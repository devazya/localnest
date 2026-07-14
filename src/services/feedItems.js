/**
 * feedItems.js
 * ---------------------------------------------------------------------
 * Data-fetching for "Happening Around" (and any future section that
 * wants a ranked, cross-content discovery feed). This is the ONLY
 * frontend entry point onto the `feed_items` aggregation table — the
 * table is populated server-side by existing Postgres triggers
 * (sync_event_to_feed, sync_ride_to_feed, sync_post_to_feed,
 * sync_offer_to_feed, sync_pick_to_feed), so the frontend never queries
 * events / community_posts / rides / offers directly for this section.
 *
 * feed_items.source_type is constrained (DB check) to:
 *   'event' | 'activity' | 'workshop' | 'community_post' | 'ride' |
 *   'offer' | 'featured_pick' | 'external'
 *
 * FEED_TYPE_CONFIG below is the single place that maps a source_type to
 * its display badge, default CTA label, and (if any) the saved_items
 * item_type it resolves to for the universal SaveButton. Adding a new
 * source_type later (e.g. a future 'business_update') is a config-only
 * change — FeedCard and FeedCarousel never need to change.
 */
import { supabase } from './supabase/client';

const LIMIT = 12;

/**
 * @typedef {Object} FeedTypeConfig
 * @property {string} label            - Human label used for the top-left badge fallback.
 * @property {string} ctaLabel         - Default CTA text for this content type.
 * @property {string|null} saveType    - item_type in saved_items this resolves to, or null if not saveable yet.
 * @property {string} emojiFallback    - Used when a feed item has no image_url.
 */

/** @type {Record<string, FeedTypeConfig>} */
export const FEED_TYPE_CONFIG = {
  event:           { label: 'Event',            ctaLabel: 'Join',        saveType: 'event', emojiFallback: '🎉' },
  activity:        { label: 'Sports',            ctaLabel: 'Book',        saveType: 'event', emojiFallback: '⚽' },
  workshop:        { label: 'Workshop',          ctaLabel: 'Register',    saveType: 'event', emojiFallback: '🛠️' },
  community_post:  { label: 'Community',         ctaLabel: 'View',        saveType: 'community_post', emojiFallback: '💬' },
  ride:            { label: 'Ride Share',        ctaLabel: 'Request Ride', saveType: 'ride', emojiFallback: '🚗' },
  offer:           { label: 'Offer',             ctaLabel: 'Claim Offer', saveType: 'offer', emojiFallback: '🏷️' },
  featured_pick:   { label: 'Featured',          ctaLabel: 'View Business', saveType: 'business', emojiFallback: '⭐' },
  external:        { label: 'Alert',             ctaLabel: 'Learn More',  saveType: null, emojiFallback: '📌' },
};

/** Fallback used for any source_type not (yet) in FEED_TYPE_CONFIG, so the
 *  renderer never breaks when the backend introduces a new type first. */
const DEFAULT_TYPE_CONFIG = { label: 'Update', ctaLabel: 'Learn More', saveType: null, emojiFallback: '📍' };

export function getFeedTypeConfig(sourceType) {
  return FEED_TYPE_CONFIG[sourceType] || DEFAULT_TYPE_CONFIG;
}

function timeUntil(occursAt) {
  if (!occursAt) return null;
  const diffMs = new Date(occursAt).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return diffMs > 0 ? `In ${mins}m` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return diffMs > 0 ? `In ${hrs}h` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return diffMs > 0 ? `In ${days}d` : `${days}d ago`;
}

/**
 * Normalize a raw feed_items row into the shape FeedCard renders.
 * Nothing here is hardcoded per source_type beyond looking up
 * FEED_TYPE_CONFIG — new types degrade gracefully via DEFAULT_TYPE_CONFIG.
 */
function normalizeFeedItem(row) {
  const cfg = getFeedTypeConfig(row.source_type);
  return {
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    locality: row.locality,
    city: row.city,
    occursAt: row.occurs_at,
    timeLabel: timeUntil(row.occurs_at),
    createdAt: row.created_at,
    engagementScore: row.engagement_score,
    editorialPriority: row.editorial_priority,
    metadata: row.metadata || {},
    badge: row.metadata?.badge || null, // e.g. 'LIVE' | 'TRENDING' | 'NEW' | 'TODAY' | 'FEATURED', backend-driven
    ctaLabel: row.metadata?.cta_label || cfg.ctaLabel,
    saveType: cfg.saveType,
    saveId: row.source_id, // saved_items.item_id points at the source row, not the feed_items row
    emojiFallback: cfg.emojiFallback,
    typeLabel: cfg.label,
  };
}

/**
 * fetchHappeningAround({ locality, city, limit }) -> Promise<FeedCardData[]>
 * Ranked by editorial_priority first (backend-curated boosts), then
 * engagement_score, then recency — matches the "AI-ranked mixture" brief
 * without the frontend needing to know how ranking is computed; that
 * logic can move server-side (e.g. a view or function) later without
 * this call site changing.
 *
 * Never throws — callers get [] on failure and can show the retry state
 * using the `error` they capture from the wrapped call site instead.
 */
export async function fetchHappeningAround({ locality, city, limit = LIMIT } = {}) {
  let query = supabase
    .from('feed_items')
    .select('id, source_type, source_id, title, subtitle, image_url, locality, city, occurs_at, created_at, expires_at, engagement_score, editorial_priority, status, metadata')
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
  return (data || []).map(normalizeFeedItem);
}
