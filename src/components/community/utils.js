/**
 * utils.js — Community module
 * Pure helper functions extracted verbatim from the original Community.jsx.
 */

import { CHANNELS } from './constants';

export function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Pastel Identity System ─────────────────────────────────────────────────
// Deterministic pastel color per user, derived from their id so it never
// changes between renders/sessions. Used to tint bubbles, avatar rings,
// reply/mention highlights.
const PASTEL_IDENTITY_PALETTE = [
  { name: 'Soft Lavender',    tint: '#EDE9FF', solid: '#8B7CF6', ring: 'rgba(139,124,246,0.35)' },
  { name: 'Soft Purple',      tint: '#F1E9FF', solid: '#9B6BFF', ring: 'rgba(155,107,255,0.35)' },
  { name: 'Soft Lilac',       tint: '#F3E8FF', solid: '#A78BFA', ring: 'rgba(167,139,250,0.35)' },
  { name: 'Soft Sky Blue',    tint: '#E6F4FF', solid: '#5EA8E8', ring: 'rgba(94,168,232,0.35)' },
  { name: 'Soft Mint',        tint: '#E5FBF3', solid: '#4FBF9C', ring: 'rgba(79,191,156,0.35)' },
  { name: 'Soft Sage',        tint: '#EEF5E9', solid: '#8CAE79', ring: 'rgba(140,174,121,0.35)' },
  { name: 'Soft Peach',       tint: '#FFEFE6', solid: '#F2A278', ring: 'rgba(242,162,120,0.35)' },
  { name: 'Soft Coral',       tint: '#FFE9E6', solid: '#F0897A', ring: 'rgba(240,137,122,0.35)' },
  { name: 'Soft Rose',        tint: '#FFE9F1', solid: '#EA8FB1', ring: 'rgba(234,143,177,0.35)' },
  { name: 'Soft Cream',       tint: '#FFF8E8', solid: '#D9B65C', ring: 'rgba(217,182,92,0.35)' },
  { name: 'Soft Powder Blue', tint: '#EAF2FB', solid: '#7FA6D6', ring: 'rgba(127,166,214,0.35)' },
];

function hashId(id) {
  const str = String(id || 'anon');
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** Returns a stable pastel identity { name, tint, solid, ring } for a user id. */
export function getPastelIdentity(userId) {
  const idx = hashId(userId) % PASTEL_IDENTITY_PALETTE.length;
  return PASTEL_IDENTITY_PALETTE[idx];
}

// ─── Message Grouping ───────────────────────────────────────────────────────
// Groups consecutive messages by the same author into visual clusters —
// avatar/name shown once per group, not once per message. A new group also
// starts after a gap of GROUP_GAP_MS between messages.
const GROUP_GAP_MS = 5 * 60 * 1000; // 5 minutes

export function groupMessages(messages) {
  const groups = [];
  for (const msg of messages || []) {
    const last = groups[groups.length - 1];
    const sameAuthor = last && last.authorId === msg.author_id;
    const withinGap = last && (new Date(msg.created_at) - new Date(last.items[last.items.length - 1].created_at)) < GROUP_GAP_MS;
    if (sameAuthor && withinGap) {
      last.items.push(msg);
    } else {
      groups.push({ authorId: msg.author_id, profile: msg.profiles, items: [msg] });
    }
  }
  return groups;
}

export function getChannelMeta(slug) {
  return CHANNELS.find(c => c.slug === slug);
}

export function getChannelPrefix(slug) {
  const c = getChannelMeta(slug);
  return c ? `D/${c.name}` : `D/${slug}`;
}

export function isToday(ts) {
  const d = new Date(ts), n = new Date();
  return d.toDateString() === n.toDateString();
}

export function isThisWeek(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

export function isThisMonth(ts) {
  const d = new Date(ts), n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

// ─── Discussion Ecosystem (Segment 3) ───────────────────────────────────────

/**
 * Sort a list of discussion rows for a single channel's view.
 * getMemberCount(id) -> live presence count for that discussion.
 */
export function sortDiscussions(list, sortKey, getMemberCount) {
  const arr = [...(list || [])];
  const count = (d) => getMemberCount?.(d.id) ?? 0;
  switch (sortKey) {
    case 'newest':
      return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'most_members':
      return arr.sort((a, b) => count(b) - count(a) || new Date(b.last_activity_at) - new Date(a.last_activity_at));
    case 'trending':
      return arr.sort((a, b) => count(b) - count(a) || new Date(b.last_activity_at) - new Date(a.last_activity_at));
    case 'recent_activity':
    default:
      return arr.sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at));
  }
}

/**
 * Build General's discovery-hub groups (Trending / Recently Active /
 * Popular) from the full cross-channel active-discussions list. The
 * discussion itself still belongs to only one channel — this only decides
 * which rows to surface and in what order.
 */
export function buildDiscoveryGroups(allDiscussions, getMemberCount, { limit = 8 } = {}) {
  const list = allDiscussions || [];
  const count = (d) => getMemberCount?.(d.id) ?? 0;

  const recentlyActive = [...list]
    .sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at))
    .slice(0, limit);

  const HOT_WINDOW_MS = 3 * 60 * 60 * 1000; // last 3 hours counts as "hot"
  const now = Date.now();
  const hot = list.filter(d => now - new Date(d.last_activity_at).getTime() <= HOT_WINDOW_MS);
  const trendingSource = hot.length > 0 ? hot : list;
  const trending = [...trendingSource]
    .sort((a, b) => count(b) - count(a) || new Date(b.last_activity_at) - new Date(a.last_activity_at))
    .slice(0, limit);

  const popular = [...list]
    .sort((a, b) => count(b) - count(a) || new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

  return { trending, recentlyActive, popular };
}
