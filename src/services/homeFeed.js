/**
 * homeFeed.js
 * Data-fetching for the Dynamic Content Feed (§9.6.2).
 *
 * Per the spec, Segment 1's *engineering* scope is the feed container,
 * transition, loading and empty states — "the underlying business data and
 * listing logic ... still belong to backend/content, not to homepage
 * engineering" (§16). This file is intentionally a thin, swappable adapter:
 * one exported function, `fetchModuleContent(moduleId, filterId)`, that maps
 * each Primary Module to its real LocalNest table and returns a small,
 * normalized card list. Where the current schema has no column to filter by
 * a given Context Filter (e.g. Vroom's "Women Only" — `rides` has no such
 * flag yet), it degrades to the module's general query rather than
 * inventing fake data — a genuinely calm, correct empty state is preferable
 * to fabricated content.
 *
 * Terminology guardrail (§16): Neara is businesses only, Marketplace is
 * resident listings only — the two queries below never cross-read each
 * other's tables.
 */
import { supabase } from './supabase/client';

const LIMIT = 8;

/**
 * Normalized card shape every module maps into.
 * `itemType` is the saved_items category ('shop', 'pg_listing', ...).
 * `saveable` is false for community_posts (they expire after 48h, so
 * they're excluded from the bookmark table by design) and true otherwise.
 */
function card({ id, title, subtitle, meta, emoji, itemType, saveable = true }) {
  return { id, title, subtitle, meta, emoji, itemType, saveable };
}

async function fetchNeibo(filterId) {
  // Highlights / Sports / Events / Activity / Deals are intentionally
  // unwired for now — each will get its own real data source later.
  // Do NOT fall back to community_posts or discussions here; that's a
  // different concept (general chat) and shouldn't bleed into these
  // subcategories. Honest empty state until each is built out.
  return [];
}

async function fetchNeara(filterId) {
  let query = supabase
    .from('shops')
    .select('id, name, category, locality, rating')
    .eq('status', 'active')
    .order('rating', { ascending: false })
    .limit(LIMIT);

  if (filterId !== 'general') {
    // category is free text on `shops` — ilike keeps this forgiving
    // (e.g. "Cafe" filter matches a "Cafe & Bakery" category row).
    const label = filterId.replace(/-/g, ' ');
    query = query.ilike('category', `%${label}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((s) => card({
    id: s.id, title: s.name, subtitle: s.locality || s.category, meta: s.rating ? `★ ${s.rating}` : null, emoji: '📍',
    itemType: 'shop', saveable: true,
  }));
}

const STAY_TYPE = { 'boys-pg': 'boys', 'girls-pg': 'girls', 'co-living': 'co_ed' };

async function fetchStay(filterId) {
  const pgType = STAY_TYPE[filterId];
  // Hostels / Hotels / BnB / Short Stay / Service Apartments have no
  // matching pg_type in the current schema — an honest empty result
  // (rather than mislabeling a PG as a hotel) until that data exists.
  if (!pgType) return [];

  const { data, error } = await supabase
    .from('pg_listings')
    .select('id, title, rent, locality, room_type')
    .eq('status', 'active')
    .eq('pg_type', pgType)
    .order('created_at', { ascending: false })
    .limit(LIMIT);
  if (error) throw error;
  return (data || []).map((p) => card({
    id: p.id, title: p.title, subtitle: p.locality, meta: p.rent ? `₹${p.rent}/mo` : null, emoji: '🛏',
    itemType: 'pg_listing', saveable: true,
  }));
}

const MARKET_CATEGORY = {
  electronics: 'electronics', furniture: 'furniture', books: 'books',
  fashion: 'clothing', cycles: 'vehicles', miscellaneous: 'other',
};

async function fetchMarketplace(filterId) {
  const category = MARKET_CATEGORY[filterId];
  // Gaming / Rent / Exchange have no matching enum value yet — an honest
  // empty result rather than a mismatched category.
  if (!category) return [];

  const query = supabase
    .from('marketplace_items')
    .select('id, title, price, category, locality')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(LIMIT)
    .eq('category', category);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((m) => card({
    id: m.id, title: m.title, subtitle: m.locality, meta: m.price != null ? `₹${m.price}` : null, emoji: '🛒',
    itemType: 'marketplace_item', saveable: true,
  }));
}

async function fetchVroom(filterId) {
  let query = supabase
    .from('rides')
    .select('id, source, destination, departure_time, available_seats, price_per_seat')
    .eq('status', 'active')
    .order('departure_time', { ascending: true })
    .limit(LIMIT);

  // Only Airport / Metro map onto a free-text destination keyword today;
  // Office Ride / Cab Share / Bike Pool / Weekend / Recurring / Women Only /
  // Trusted Drivers have no dedicated column yet, so they show the general
  // upcoming-rides list rather than a fabricated match.
  if (filterId === 'airport' || filterId === 'metro') {
    query = query.ilike('destination', `%${filterId}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((r) => card({
    id: r.id, title: `${r.source} → ${r.destination}`,
    subtitle: r.available_seats != null ? `${r.available_seats} seats left` : null,
    meta: r.price_per_seat != null ? `₹${r.price_per_seat}` : null, emoji: '🚗',
    itemType: 'ride', saveable: true,
  }));
}

const FETCHERS = {
  neibo: fetchNeibo,
  neara: fetchNeara,
  stay: fetchStay,
  marketplace: fetchMarketplace,
  vroom: fetchVroom,
};

/**
 * fetchModuleContent(moduleId, filterId) -> Promise<Card[]>
 * Never throws to the caller — DynamicContentFeed treats a thrown/rejected
 * result the same as an empty result (calm empty state, §9.6.2), while
 * logging the real error for diagnostics.
 */
export async function fetchModuleContent(moduleId, filterId) {
  const fn = FETCHERS[moduleId];
  if (!fn) return [];
  try {
    return await fn(filterId);
  } catch (err) {
    console.error(`[homeFeed] ${moduleId}/${filterId} failed:`, err);
    return [];
  }
}
