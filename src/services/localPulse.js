/**
 * localPulse.js
 * ---------------------------------------------------------------------
 * Data source for the "Local Pulse" network visualization (hero section).
 * This does NOT introduce a new table — it reuses `feed_items`, the same
 * aggregation table "Happening Around" reads from (see feedItems.js),
 * populated server-side by the existing sync_* triggers. The frontend
 * only decides how to *group* rows into the network's outer pills; it
 * never hardcodes which categories, titles, or subtitles appear.
 *
 * Shape returned per pill (matches spec: category, icon, title, subtitle,
 * timestamp, priority):
 *   { id, category, label, title, subtitle, timestamp, priority, route }
 */
import { supabase } from './supabase/client';

const SCAN_LIMIT = 40;
const MAX_PILLS = 6;

/**
 * category -> { label, route }
 * This is presentation-only (what to call a source_type / where a tap
 * should navigate). Icons live in nodeIcons.js. Adding a new source_type
 * server-side just needs an entry here to get a friendly label; anything
 * missing falls back to a title-cased version of the raw type.
 */
const CATEGORY_META = {
  event:          { label: 'Events',     route: 'events',    ctaLabel: 'Join Event' },
  activity:       { label: 'Sports',     route: 'events',    ctaLabel: 'Join Game' },
  workshop:       { label: 'Workshops',  route: 'events',    ctaLabel: 'Register' },
  community_post: { label: 'Discussion', route: 'community', ctaLabel: 'View Discussion' },
  ride:           { label: 'Rides',      route: 'rideshare', ctaLabel: 'Offer a Ride' },
  offer:          { label: 'Deals',      route: 'shops',     ctaLabel: 'Claim Offer' },
  featured_pick:  { label: 'Featured',   route: 'shops',     ctaLabel: 'View Business' },
  external:       { label: 'Alerts',     route: 'community', ctaLabel: 'Learn More' },
};

function metaFor(sourceType) {
  return CATEGORY_META[sourceType] || {
    label: sourceType ? sourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Update',
    route: 'community',
    ctaLabel: 'Explore',
  };
}

function timeAgo(iso) {
  if (!iso) return null;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/**
 * fetchLocalPulsePills({ locality, city, limit }) -> Promise<PillData[]>
 *
 * Scans the most recent/highest-priority active feed_items, then keeps
 * the first (i.e. best-ranked) row per source_type — giving one live pill
 * per category, capped at MAX_PILLS to match the network's fixed number
 * of outer slots. Never throws; returns [] on failure so the network
 * viz can keep its static fallback nodes.
 */
export async function fetchLocalPulsePills({ locality, city, limit = SCAN_LIMIT } = {}) {
  try {
    let query = supabase
      .from('feed_items')
      .select('id, source_type, source_id, title, subtitle, created_at, engagement_score, editorial_priority, status, metadata')
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('editorial_priority', { ascending: false })
      .order('engagement_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (locality) query = query.eq('locality', locality);
    else if (city) query = query.eq('city', city);

    const { data, error } = await query;
    if (error) throw error;

    const seen = new Set();
    const pills = [];
    for (const row of data || []) {
      if (seen.has(row.source_type)) continue;
      seen.add(row.source_type);
      const meta = metaFor(row.source_type);
      pills.push({
        id: row.source_type,
        category: row.source_type,
        label: meta.label,
        route: meta.route,
        ctaLabel: meta.ctaLabel,
        title: row.title,
        subtitle: row.subtitle,
        timestamp: row.created_at,
        timeLabel: timeAgo(row.created_at),
        priority: row.editorial_priority ?? 0,
      });
      if (pills.length >= MAX_PILLS) break;
    }
    return pills;
  } catch {
    return [];
  }
}
