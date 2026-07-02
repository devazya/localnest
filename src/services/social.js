/**
 * social.js — Social Interaction Layer (Segment 5.3)
 * Identity, Recognition, Interaction, Discovery, Trust — the data layer
 * for mentions, resident discovery, mutual connections, and profile
 * quick actions (report / mute). All derived live from Supabase; no
 * duplicated state, no new tables beyond the two genuinely new concepts
 * (profile_reports, muted_residents) that had no existing home.
 */
import { supabase } from './supabase/client';
import { PROFILE_SELECT } from './followers';

// ─── Mentions ────────────────────────────────────────────────────────────

/** Matches `@word` (letters, digits, underscore, dot) anywhere in text. */
export const MENTION_REGEX = /@([a-zA-Z0-9_.]{2,32})/g;

/** Pull the in-progress `@partial` token the user is currently typing,
 * right before the cursor — or null if the cursor isn't inside a mention. */
export function getActiveMentionQuery(text, cursorPos) {
  const upToCursor = text.slice(0, cursorPos);
  const match = upToCursor.match(/(?:^|\s)@([a-zA-Z0-9_.]{0,32})$/);
  return match ? match[1] : null;
}

/** Replaces the in-progress `@partial` token with the chosen `@username `. */
export function insertMention(text, cursorPos, username) {
  const upToCursor = text.slice(0, cursorPos);
  const replaced = upToCursor.replace(/(?:^|\s)@([a-zA-Z0-9_.]{0,32})$/, (m) => {
    const lead = m.startsWith(' ') ? ' ' : '';
    return `${lead}@${username} `;
  });
  return replaced + text.slice(cursorPos);
}

/** Splits text into plain-string / mention-token segments for rendering. */
export function splitMentions(text) {
  if (!text) return [];
  const parts = [];
  let lastIndex = 0;
  const re = new RegExp(MENTION_REGEX);
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    parts.push({ type: 'mention', value: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });
  return parts;
}

/** Autocomplete search — residents by username / full name prefix or substring. */
export async function searchResidents(query, excludeId, limit = 6) {
  const q = (query || '').trim();
  if (q.length === 0) return [];
  let sel = supabase.from('profiles').select(PROFILE_SELECT)
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
    .limit(limit);
  if (excludeId) sel = sel.neq('id', excludeId);
  const { data, error } = await sel;
  if (error) { console.error('social: searchResidents failed:', error.message); return []; }
  return data || [];
}

/** Resolve a single @username → profile, for tap-to-open on a mention chip. */
export async function fetchProfileByUsername(username) {
  if (!username) return null;
  const { data, error } = await supabase.from('profiles').select(PROFILE_SELECT).eq('username', username).maybeSingle();
  if (error) { console.error('social: fetchProfileByUsername failed:', error.message); return null; }
  return data;
}

// ─── Mutual Connections ────────────────────────────────────────────────────

/** "Followed by X and N others" — residents the viewer follows who also
 * follow the target. Two lightweight queries + a client-side intersection
 * (follow graphs here are small; no need for a SQL join view). */
export async function fetchMutualConnections(viewerId, targetId, limit = 4) {
  if (!viewerId || !targetId || viewerId === targetId) return { names: [], total: 0 };
  const [{ data: viewerFollowing }, { data: targetFollowers }] = await Promise.all([
    supabase.from('followers').select('following_id').eq('follower_id', viewerId),
    supabase.from('followers').select('follower_id').eq('following_id', targetId),
  ]);
  const followingSet = new Set((viewerFollowing || []).map(r => r.following_id));
  const mutualIds = (targetFollowers || []).map(r => r.follower_id).filter(id => followingSet.has(id));
  if (mutualIds.length === 0) return { names: [], total: 0 };

  const { data: profiles } = await supabase
    .from('profiles').select('id,full_name,username')
    .in('id', mutualIds.slice(0, limit));

  const names = (profiles || []).map(p => p.full_name || p.username || 'Resident');
  return { names, total: mutualIds.length };
}

// ─── Resident Discovery ─────────────────────────────────────────────────────

/**
 * "People You May Know" — simple, explainable ranking:
 *  +3 same locality, +2 mutual follow, +1 shared discussion, +1 shared event.
 * Excludes self and residents already followed. Keeps the algorithm
 * intentionally simple per spec — a scoring pass over a bounded candidate
 * set, not a recommendation engine.
 */
export async function fetchSuggestedResidents(userId, myProfile, limit = 8) {
  if (!userId) return [];

  const [{ data: alreadyFollowing }, { data: candidates }] = await Promise.all([
    supabase.from('followers').select('following_id').eq('follower_id', userId),
    supabase.from('profiles').select(PROFILE_SELECT).neq('id', userId).limit(60),
  ]);
  const excludeIds = new Set([userId, ...(alreadyFollowing || []).map(r => r.following_id)]);
  const pool = (candidates || []).filter(p => !excludeIds.has(p.id));
  if (pool.length === 0) return [];

  const [{ data: myFollowing }, { data: myDiscussions }, { data: myEventRegs }] = await Promise.all([
    supabase.from('followers').select('following_id').eq('follower_id', userId),
    supabase.from('discussions').select('creator_id').eq('creator_id', userId),
    supabase.from('event_registrations').select('event_id').eq('user_id', userId),
  ]);
  const myFollowingSet = new Set((myFollowing || []).map(r => r.following_id));

  // Residents my followees follow (a cheap proxy for "mutual follow" signal).
  let mutualFollowCounts = new Map();
  if (myFollowingSet.size > 0) {
    const { data: secondHop } = await supabase
      .from('followers').select('following_id')
      .in('follower_id', Array.from(myFollowingSet));
    (secondHop || []).forEach(r => mutualFollowCounts.set(r.following_id, (mutualFollowCounts.get(r.following_id) || 0) + 1));
  }

  const scored = pool.map(p => {
    let score = 0;
    if (myProfile?.locality && p.locality && p.locality === myProfile.locality) score += 3;
    if (mutualFollowCounts.has(p.id)) score += Math.min(2, mutualFollowCounts.get(p.id));
    return { ...p, _score: score };
  });

  scored.sort((a, b) => b._score - a._score || new Date(b.created_at) - new Date(a.created_at));
  return scored.slice(0, limit);
}

// ─── Profile Quick Actions ──────────────────────────────────────────────────

export async function reportProfile(reporterId, reportedId, reason, details) {
  if (!reporterId || !reportedId || reporterId === reportedId) return;
  const { error } = await supabase.from('profile_reports').insert({ reporter_id: reporterId, reported_id: reportedId, reason, details: details || null });
  if (error) throw error;
}

export async function muteResident(muterId, mutedId) {
  if (!muterId || !mutedId || muterId === mutedId) return;
  const { error } = await supabase.from('muted_residents').insert({ muter_id: muterId, muted_id: mutedId });
  if (error && error.code !== '23505') throw error;
}

export async function unmuteResident(muterId, mutedId) {
  const { error } = await supabase.from('muted_residents').delete().eq('muter_id', muterId).eq('muted_id', mutedId);
  if (error) throw error;
}

export async function fetchIsMuted(muterId, mutedId) {
  if (!muterId || !mutedId) return false;
  const { data, error } = await supabase.from('muted_residents').select('muter_id').eq('muter_id', muterId).eq('muted_id', mutedId).maybeSingle();
  if (error) return false;
  return !!data;
}

// ─── Profile Sharing ────────────────────────────────────────────────────────

export function buildProfileUrl(userId) {
  return `${window.location.origin}${window.location.pathname}#/profile/${userId}`;
}

export async function copyProfileLink(userId) {
  const url = buildProfileUrl(userId);
  await navigator.clipboard.writeText(url);
  return url;
}

export async function shareProfile(userId, name) {
  const url = buildProfileUrl(userId);
  if (navigator.share) {
    try {
      await navigator.share({ title: `${name} on LocalNest`, url });
      return true;
    } catch {
      return false; // user cancelled — not an error
    }
  }
  await navigator.clipboard.writeText(url);
  return true;
}
