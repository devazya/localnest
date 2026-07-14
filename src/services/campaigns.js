/**
 * campaigns.js
 * ---------------------------------------------------------------------
 * Data-fetching for the "Local Finds" Home section. This is the ONLY
 * frontend entry point onto the `campaigns` table (the canonical
 * Promotions Engine — see supabase/migrations & Database/Schema.md).
 *
 * ARCHITECTURE REMINDER: Provider -> Sync Layer -> Supabase -> Frontend.
 * This file never talks to District/Magicpin/Nearbuy/CashKaro or any
 * other provider directly — it only ever reads `campaigns`, which a
 * separate sync layer (edge functions, tracked in campaign_sync_jobs)
 * keeps populated regardless of where a given row originated
 * (campaign_providers.slug). The frontend does not know or care where a
 * campaign came from beyond its provider's display name/logo.
 *
 * campaigns.campaign_type is intentionally broader than "coupon":
 *   'affiliate_offer' | 'merchant_promotion' | 'sponsored_listing' |
 *   'cashback' | 'referral_reward' | 'loyalty_reward' |
 *   'festival_campaign' | 'flash_sale' | 'seasonal_campaign'
 * CAMPAIGN_TYPE_CONFIG below is the single place mapping a type to its
 * default CTA label — adding a new campaign_type later is a config-only
 * change, same pattern as feedItems.js FEED_TYPE_CONFIG.
 *
 * Saving uses the universal SaveButton via saved_items with
 * item_type='campaign' (see services/savedItems.js) — no separate
 * bookmark table. Analytics (viewed/clicked/saved/claimed/shared/
 * converted/redeemed/dismissed) route through the existing generic
 * user_events behaviour layer (services/userEvents.js) with
 * module='local_finds', object_type='campaign' — no dedicated
 * promotion_clicks table, to avoid a duplicate concept next to
 * user_events and saved_items.
 */
import { supabase } from './supabase/client';

const LIMIT = 12;

/** @type {Record<string, { ctaLabel: string }>} */
export const CAMPAIGN_TYPE_CONFIG = {
  affiliate_offer:    { ctaLabel: 'View Deal' },
  merchant_promotion: { ctaLabel: 'Claim Offer' },
  sponsored_listing:  { ctaLabel: 'View Business' },
  cashback:           { ctaLabel: 'Get Cashback' },
  referral_reward:    { ctaLabel: 'Refer & Earn' },
  loyalty_reward:     { ctaLabel: 'Redeem' },
  festival_campaign:  { ctaLabel: 'View Offer' },
  flash_sale:         { ctaLabel: 'Grab Deal' },
  seasonal_campaign:  { ctaLabel: 'View Offer' },
};
const DEFAULT_TYPE_CONFIG = { ctaLabel: 'View Deal' };

function ctaLabelFor(row) {
  if (row.coupon_code) return 'Get Coupon';
  const cfg = CAMPAIGN_TYPE_CONFIG[row.campaign_type] || DEFAULT_TYPE_CONFIG;
  return row.metadata?.cta_label || cfg.ctaLabel;
}

function discountLabel(row) {
  switch (row.discount_type) {
    case 'percentage': return row.discount_value != null ? `${row.discount_value}% OFF` : null;
    case 'flat': return row.discount_value != null ? `₹${row.discount_value} OFF` : null;
    case 'bogo': return 'Buy 1 Get 1';
    case 'free_item': return 'Free Item';
    case 'cashback': return row.cashback_amount != null ? `₹${row.cashback_amount} Cashback` : 'Cashback';
    case 'points': return row.reward_points != null ? `${row.reward_points} pts` : 'Reward Points';
    default: return null;
  }
}

function expiryLabel(expiresAt) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const hrs = Math.round(diffMs / 3600000);
  if (hrs < 24) return `Ends in ${Math.max(hrs, 1)}h`;
  const days = Math.round(hrs / 24);
  if (days <= 7) return `Ends in ${days}d`;
  return null; // far-future expiry isn't urgency-worthy — omit rather than clutter the card
}

/** Normalize a raw campaigns row (+ joined provider/business/category) into LocalFindCard's shape. */
function normalizeCampaign(row) {
  return {
    id: row.id,
    campaignType: row.campaign_type,
    promotionType: row.promotion_type,
    title: row.title,
    subtitle: row.subtitle || row.short_description,
    imageUrl: row.image_url || row.banner_url,
    logoUrl: row.logo_url || row.business?.images?.[0] || null,
    merchantName: row.business?.name || row.campaign_providers?.name || null,
    discountLabel: discountLabel(row),
    couponCode: row.coupon_code,
    locality: row.locality || row.business?.locality,
    city: row.city || row.business?.city,
    expiryLabel: expiryLabel(row.expires_at),
    isFeatured: row.is_featured,
    isSponsored: row.is_sponsored,
    providerSlug: row.campaign_providers?.slug || 'internal',
    categoryLabel: row.business_categories?.label || null,
    affiliateUrl: row.affiliate_url,
    deepLink: row.deep_link,
    ctaLabel: ctaLabelFor(row),
    saveType: 'campaign',
    saveId: row.id,
  };
}

/**
 * fetchLocalFinds({ locality, city, categorySlug, limit }) -> Promise<Card[]>
 * Ranked by priority (sponsored/merchant boosts) then ranking_score
 * (reserved for the future AI personalisation layer — see Friend AI
 * extension point below) then recency. Only active, public, currently
 * in-window campaigns are returned — expired/paused/draft/internal_test
 * rows never reach the frontend (also enforced by RLS).
 *
 * Never throws — callers get [] on failure and surface their own retry
 * state, matching feedItems.js/curatedPicks.js.
 */
export async function fetchLocalFinds({ locality, city, categorySlug = null, limit = LIMIT } = {}) {
  let query = supabase
    .from('campaigns')
    .select(`
      id, campaign_type, promotion_type, title, subtitle, short_description,
      image_url, banner_url, logo_url, discount_type, discount_value,
      cashback_amount, reward_points, coupon_code, affiliate_url, deep_link,
      locality, city, expires_at, priority, ranking_score, is_featured, is_sponsored, metadata,
      business:businesses ( name, images, locality, city ),
      campaign_providers ( slug, name ),
      business_categories ( slug, label )
    `)
    .eq('status', 'active')
    .eq('visibility', 'public')
    .lte('starts_at', new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('ranking_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (locality) query = query.eq('locality', locality);
  else if (city) query = query.eq('city', city);

  if (categorySlug && categorySlug !== 'all') {
    const { data: cat, error: catErr } = await supabase
      .from('business_categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (catErr) throw catErr;
    if (!cat) return [];
    query = query.eq('category_id', cat.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Dedup pass: same real-world deal synced from multiple providers
  // collapses to one card, keeping the higher-priority row and folding
  // in the other's affiliate_url as a fallback link. dedup_key is
  // computed by the sync layer, not the frontend.
  const seen = new Map();
  for (const row of data || []) {
    const key = row.metadata?.dedup_key || row.id;
    const existing = seen.get(key);
    if (!existing || (row.priority ?? 0) > (existing.priority ?? 0)) {
      seen.set(key, row);
    }
  }

  return Array.from(seen.values()).map(normalizeCampaign);
}

/**
 * AI PERSONALISATION EXTENSION POINT (not implemented):
 * Friend AI will eventually re-rank the array fetchLocalFinds returns
 * using mood, favourite categories, visited/saved businesses, time of
 * day, weather, location, budget, past redemptions, and community
 * popularity. That resolver can sit entirely in front of this function
 * (re-sort its output) or replace the `.order(...)` chain with a call
 * to a ranking view/function server-side — either way, LocalFinds.jsx
 * and LocalFindCard.jsx never need to change.
 */
