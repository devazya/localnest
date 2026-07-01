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
