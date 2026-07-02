/**
 * reputation.js — Trust & Reputation System (Segment 5.2)
 * The Neighbour Score is never hardcoded — it is derived from a set of
 * pluggable "signals", each reading from an existing table. Adding a new
 * signal later (moderator actions, resolved reports, new verifications)
 * means adding one entry to SCORE_SIGNALS + one fetcher — the UI never
 * needs to change.
 *
 * No Level / XP / Coins / Points — ever. Only a 0–100 Neighbour Score and
 * a Trust Level label.
 */
import { supabase } from './supabase/client';

// ─── Low-level helpers ──────────────────────────────────────────────────────

async function countRows(table, column, userId, extra) {
  let q = supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, userId);
  if (extra) q = extra(q);
  const { count, error } = await q;
  if (error) { console.error(`reputation: countRows(${table}) failed:`, error.message); return 0; }
  return count || 0;
}

async function sumColumn(table, column, sumCol, userId) {
  const { data, error } = await supabase.from(table).select(sumCol).eq(column, userId);
  if (error) { console.error(`reputation: sumColumn(${table}) failed:`, error.message); return 0; }
  return (data || []).reduce((s, r) => s + (r[sumCol] || 0), 0);
}

// ─── Contribution stats — every number on the profile is derived from here ─

/**
 * Every stat is read live from its source-of-truth table. `placeholder:
 * true` fields don't exist yet (moderator tooling, reports) and always
 * resolve to 0 today — the architecture is ready for them without any UI
 * changes once those tables/columns exist.
 */
export async function fetchContributionStats(userId) {
  if (!userId) return EMPTY_STATS;

  const [
    updates, discussionsStarted, sportsDiscussions, comments,
    marketplaceListings, eventsJoined, eventsOrganized,
    ridesOffered, ridesJoined, pgListingsOwned, helpfulVotes,
  ] = await Promise.all([
    countRows('community_posts', 'author_id', userId),
    countRows('discussions', 'creator_id', userId),
    countRows('discussions', 'creator_id', userId, q => q.ilike('category', '%sport%')),
    countRows('community_comments', 'author_id', userId),
    countRows('marketplace_items', 'seller_id', userId),
    countRows('event_registrations', 'user_id', userId, q => q.in('status', ['registered', 'attended'])),
    countRows('events', 'organizer_id', userId),
    countRows('rides', 'driver_id', userId),
    countRows('ride_members', 'user_id', userId),
    countRows('pg_listings', 'owner_id', userId),
    sumColumn('community_posts', 'author_id', 'helpful_count', userId),
  ]);

  return {
    updates, discussionsStarted, sportsDiscussions, comments,
    marketplaceListings, eventsJoined, eventsOrganized,
    ridesOffered, ridesJoined, pgListingsOwned, helpfulVotes,
    // Future signals — wired, inert until the underlying data exists.
    moderatorSignals: 0,
    reportsResolved: 0,
  };
}

const EMPTY_STATS = {
  updates: 0, discussionsStarted: 0, sportsDiscussions: 0, comments: 0,
  marketplaceListings: 0, eventsJoined: 0, eventsOrganized: 0,
  ridesOffered: 0, ridesJoined: 0, pgListingsOwned: 0, helpfulVotes: 0,
  moderatorSignals: 0, reportsResolved: 0,
};

/** Total "contributions" shown on the profile — one honest sum, no double counting. */
export function totalContributions(stats) {
  return (stats.updates || 0) + (stats.discussionsStarted || 0) + (stats.comments || 0)
    + (stats.marketplaceListings || 0) + (stats.eventsJoined || 0) + (stats.eventsOrganized || 0)
    + (stats.ridesOffered || 0) + (stats.ridesJoined || 0);
}

// ─── Neighbour Score — the reusable scoring architecture ───────────────────

/**
 * Each signal contributes `weight` points per unit before the diminishing-
 * returns curve is applied. To add a new signal: add a row here and make
 * sure fetchContributionStats() (or fetchVerifications()) produces that key.
 * `placeholder: true` signals are always 0 today and are listed purely so
 * the architecture documents its own future.
 */
export const SCORE_SIGNALS = [
  { key: 'updates',            label: 'Neighbourhood Updates',  weight: 3 },
  { key: 'discussionsStarted', label: 'Discussions Started',    weight: 4 },
  { key: 'comments',           label: 'Comments',               weight: 1 },
  { key: 'marketplaceListings',label: 'Marketplace Reputation', weight: 2 },
  { key: 'eventsJoined',       label: 'Event Participation',    weight: 2 },
  { key: 'eventsOrganized',    label: 'Events Hosted',          weight: 3 },
  { key: 'ridesOffered',       label: 'Ride Completion',        weight: 3 },
  { key: 'ridesJoined',        label: 'Ride Participation',     weight: 2 },
  { key: 'helpfulVotes',       label: 'Helpful Votes Received', weight: 0.6 },
  { key: 'verifications',      label: 'Verifications',          weight: 8 },
  { key: 'moderatorSignals',   label: 'Moderator Signals',      weight: 5, placeholder: true },
  { key: 'reportsResolved',    label: 'Reports Resolved',       weight: 2, placeholder: true },
];

/**
 * Weighted sum → soft cap (diminishing returns) → 0-100 integer.
 * The soft cap means a very active resident approaches, but never
 * artificially maxes out at, 100 — keeps the score meaningful long-term.
 */
export function computeNeighbourScore(stats) {
  const raw = SCORE_SIGNALS.reduce((sum, s) => sum + (stats[s.key] || 0) * s.weight, 0);
  const score = 100 * (1 - Math.exp(-raw / 60));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export const TRUST_LEVELS = [
  { min: 81, max: 100, label: 'Trusted Resident' },
  { min: 61, max: 80,  label: 'Helpful Neighbour' },
  { min: 41, max: 60,  label: 'Active Resident' },
  { min: 21, max: 40,  label: 'Getting Started' },
  { min: 0,  max: 20,  label: 'New Resident' },
];

export function getTrustLevel(score) {
  return TRUST_LEVELS.find(l => score >= l.min && score <= l.max) || TRUST_LEVELS[TRUST_LEVELS.length - 1];
}

// ─── Verification ───────────────────────────────────────────────────────────

/**
 * Derived from real ownership/verification flags — never fabricated.
 * `type` maps 1:1 to VerificationBadge's icon set, which also supports
 * 'society' and 'pg_owner' types for when that data exists.
 */
export async function fetchVerifications(userId, profile) {
  if (!userId) return [];
  const [{ data: shop }, { data: gym }] = await Promise.all([
    supabase.from('shops').select('id').eq('owner_id', userId).eq('is_verified', true).limit(1),
    supabase.from('gyms').select('id').eq('owner_id', userId).eq('is_verified', true).limit(1),
  ]);
  const list = [];
  if (profile?.is_verified) list.push({ type: 'resident', label: 'Verified Resident' });
  if (shop?.length) list.push({ type: 'shop', label: 'Verified Shop' });
  if (gym?.length) list.push({ type: 'gym', label: 'Verified Gym' });
  return list;
}

// ─── Badges — reusable, derived (no separate mutable table to drift) ───────

export const BADGE_CATALOG = {
  helpful_neighbour: { icon: '❤️', label: 'Helpful Neighbour' },
  sports_organizer:  { icon: '🏸', label: 'Sports Organizer' },
  ride_champion:     { icon: '🚗', label: 'Ride Champion' },
  trusted_pg_owner:  { icon: '🏡', label: 'Trusted PG Owner' },
  verified_seller:   { icon: '🛒', label: 'Verified Seller' },
  early_member:      { icon: '⭐', label: 'Early Member' },
  volunteer:         { icon: '🛠', label: 'Volunteer' },
  event_host:        { icon: '🎉', label: 'Event Host' },
  community_helper:  { icon: '💬', label: 'Community Helper' },
};

const EARLY_MEMBER_CUTOFF = new Date('2026-08-01T00:00:00Z');

/** Pure function of stats + profile — badges always reflect live signals. */
export function computeBadges(stats, profile, verifications = []) {
  const keys = [];
  if (stats.helpfulVotes >= 15) keys.push('helpful_neighbour');
  if (stats.sportsDiscussions >= 3) keys.push('sports_organizer');
  if (stats.ridesOffered + stats.ridesJoined >= 5) keys.push('ride_champion');
  if (stats.pgListingsOwned >= 1 && profile?.is_verified) keys.push('trusted_pg_owner');
  if (stats.marketplaceListings >= 3 && profile?.is_verified) keys.push('verified_seller');
  if (profile?.created_at && new Date(profile.created_at) < EARLY_MEMBER_CUTOFF) keys.push('early_member');
  if (stats.comments >= 25) keys.push('volunteer');
  if (stats.eventsOrganized >= 1) keys.push('event_host');
  if (stats.comments >= 10 || stats.discussionsStarted >= 2) keys.push('community_helper');
  return keys.map(key => ({ key, ...BADGE_CATALOG[key] }));
}

// ─── Contribution Timeline — GitHub-style, merged from every source ────────

const TIMELINE_LIMIT_PER_SOURCE = 12;
const TIMELINE_LIMIT_TOTAL = 20;

function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Merges recent activity from every contribution source into one
 * newest-first feed. Each item carries enough to route a tap
 * (`link: { page, params }`) to the underlying content.
 */
export async function fetchContributionTimeline(userId) {
  if (!userId) return [];

  // Note: community_posts (general chat) and community_comments (replies)
  // are deliberately excluded from the profile timeline — Recent Activity
  // shows what a resident has *done* (discussions, rides, events, listings),
  // never the content of what they posted or commented in chat.
  const [discussions, marketplace, eventRegs, rideMembers] = await Promise.all([
    supabase.from('discussions').select('id,title,category,created_at')
      .eq('creator_id', userId).order('created_at', { ascending: false }).limit(TIMELINE_LIMIT_PER_SOURCE),
    supabase.from('marketplace_items').select('id,title,status,created_at')
      .eq('seller_id', userId).order('created_at', { ascending: false }).limit(TIMELINE_LIMIT_PER_SOURCE),
    supabase.from('event_registrations').select('id,event_id,status,created_at,events(title)')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(TIMELINE_LIMIT_PER_SOURCE),
    supabase.from('ride_members').select('id,ride_id,joined_at,rides(source,destination)')
      .eq('user_id', userId).order('joined_at', { ascending: false }).limit(TIMELINE_LIMIT_PER_SOURCE),
  ]);

  const items = [];

  (discussions.data || []).forEach(d => items.push({
    id: `disc-${d.id}`, ts: d.created_at, icon: '🏸', action: 'Created',
    title: d.title, desc: 'Discussion',
    link: { page: 'community' },
  }));

  (marketplace.data || []).forEach(m => items.push({
    id: `market-${m.id}`, ts: m.created_at,
    icon: m.status === 'sold' ? '🛒' : '🛍️', action: m.status === 'sold' ? 'Sold' : 'Listed',
    title: m.title, desc: 'Marketplace',
    link: { page: 'buysell' },
  }));

  (eventRegs.data || []).forEach(e => items.push({
    id: `event-${e.id}`, ts: e.created_at, icon: '🎉', action: 'Joined',
    title: e.events?.title || 'an event', desc: 'Event',
    link: { page: 'events' },
  }));

  (rideMembers.data || []).forEach(r => items.push({
    id: `ride-${r.id}`, ts: r.joined_at, icon: '🚗', action: 'Shared',
    title: r.rides ? `Ride to ${r.rides.destination}` : 'a ride', desc: 'Ride',
    link: { page: 'rideshare' },
  }));

  return items
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .slice(0, TIMELINE_LIMIT_TOTAL)
    .map(i => ({ ...i, relativeTime: timeAgo(i.ts) }));
}

// ─── Realtime ───────────────────────────────────────────────────────────────

const REPUTATION_TABLES = [
  { table: 'community_posts', column: 'author_id' },
  { table: 'discussions', column: 'creator_id' },
  { table: 'community_comments', column: 'author_id' },
  { table: 'marketplace_items', column: 'seller_id' },
  { table: 'event_registrations', column: 'user_id' },
  { table: 'ride_members', column: 'user_id' },
  { table: 'rides', column: 'driver_id' },
];

/**
 * One shared realtime channel per profile view. Any change to any of the
 * user's contribution rows triggers a single debounced recompute — Score,
 * Badges, Contribution Count and Timeline all refresh automatically with
 * no page reload.
 */
export function subscribeToReputationChanges(userId, onChange) {
  if (!userId) return () => {};
  let timer = null;
  const debounced = () => { clearTimeout(timer); timer = setTimeout(() => onChange?.(), 400); };

  const channel = supabase.channel(`reputation-${userId}`);
  REPUTATION_TABLES.forEach(({ table, column }) => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `${column}=eq.${userId}` }, debounced);
  });
  channel.subscribe();

  return () => { clearTimeout(timer); supabase.removeChannel(channel); };
}
