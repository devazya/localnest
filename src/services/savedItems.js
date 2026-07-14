/**
 * savedItems.js
 * Universal bookmark service backed by the single, polymorphic `saved_items`
 * table (user_id, item_type, item_id). Every discoverable content type in
 * LocalNest saves through this one table — never create a second bookmark
 * table for a new content type; add its item_type + resolver below instead.
 *
 * item_type vocabulary (enforced by the DB check constraint too):
 *   business           -> businesses            (shops, gyms, sports venues, cafes...)
 *   event              -> events                (covers events, activities, workshops
 *                                                 via events.event_type — same table)
 *   offer              -> offers
 *   marketplace_item    -> marketplace_items
 *   pg_listing         -> pg_listings
 *   roommate_listing   -> roommate_listings
 *   ride               -> rides
 *   discussion         -> discussions
 *   community_post     -> community_posts       (may expire — see RESOLVERS note)
 *   movie              -> reserved for a future `movies`/external-integration table
 */
import { supabase } from './supabase/client';

export const SAVEABLE_TYPES = [
  'business', 'event', 'offer', 'marketplace_item', 'pg_listing',
  'roommate_listing', 'ride', 'discussion', 'community_post', 'movie',
];

function assertSaveable(itemType) {
  if (!SAVEABLE_TYPES.includes(itemType)) {
    throw new Error(`"${itemType}" is not a recognized saveable type.`);
  }
}

/** Save an item for the current user. No-ops (idempotent) if already saved. */
export async function saveItem(userId, itemType, itemId) {
  assertSaveable(itemType);
  const { error } = await supabase
    .from('saved_items')
    .upsert(
      { user_id: userId, item_type: itemType, item_id: itemId },
      { onConflict: 'user_id,item_type,item_id', ignoreDuplicates: true },
    );
  if (error) throw error;
  return true;
}

/** Remove a saved item for the current user. */
export async function unsaveItem(userId, itemType, itemId) {
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .match({ user_id: userId, item_type: itemType, item_id: itemId });
  if (error) throw error;
  return true;
}

/** Toggle save state; returns the new saved boolean. */
export async function toggleSaveItem(userId, itemType, itemId, currentlySaved) {
  if (currentlySaved) {
    await unsaveItem(userId, itemType, itemId);
    return false;
  }
  await saveItem(userId, itemType, itemId);
  return true;
}

/** Check whether a single item is saved by the user. */
export async function isItemSaved(userId, itemType, itemId) {
  const { data, error } = await supabase
    .from('saved_items')
    .select('id')
    .match({ user_id: userId, item_type: itemType, item_id: itemId })
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/**
 * Fetch the set of saved item_ids for a batch of items of one type —
 * used to hydrate "saved" state across a whole feed/grid in one query
 * instead of one round-trip per card.
 */
export async function getSavedIdsForType(userId, itemType, itemIds = []) {
  if (!userId || itemIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('saved_items')
    .select('item_id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .in('item_id', itemIds);
  if (error) throw error;
  return new Set((data || []).map((r) => r.item_id));
}

/** Fetch raw saved_items rows for a user, newest first. */
export async function getSavedItems(userId, itemType = null) {
  let query = supabase
    .from('saved_items')
    .select('id, item_type, item_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (itemType) query = query.eq('item_type', itemType);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * One resolver per item_type: given a batch of ids, return a Map(id -> card).
 * This is how the Saved Library hydrates full card data across many
 * different source tables from one polymorphic saved_items list — each
 * type is fetched with a single batched `.in('id', ids)` query, not N
 * round-trips. Card shape is intentionally minimal/display-only; the
 * component links through to the real detail page for the rest.
 */
const RESOLVERS = {
  business: async (ids) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, images, rating, locality, category_id, business_categories(label, icon)')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((b) => [b.id, {
      title: b.name,
      image: b.images?.[0] || null,
      subtitle: b.business_categories?.label || null,
      meta: b.locality,
      rating: b.rating,
      href: `/shops/${b.id}`,
    }]));
  },
  event: async (ids) => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, cover_image, category, event_type, event_date, status')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((e) => [e.id, {
      title: e.title,
      image: e.cover_image || null,
      subtitle: e.category,
      meta: e.event_date,
      badge: e.event_type,
      unavailable: e.status === 'cancelled',
      href: `/events/${e.id}`,
    }]));
  },
  offer: async (ids) => {
    const { data, error } = await supabase
      .from('offers')
      .select('id, brand_name, offer_text, valid_until')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((o) => [o.id, {
      title: o.brand_name,
      subtitle: o.offer_text,
      meta: o.valid_until,
      unavailable: o.valid_until ? new Date(o.valid_until) < new Date() : false,
      href: `/local-finds/${o.id}`,
    }]));
  },
  marketplace_item: async (ids) => {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('id, title, images, price, status')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((m) => [m.id, {
      title: m.title,
      image: m.images?.[0] || null,
      subtitle: m.price != null ? `₹${m.price}` : null,
      unavailable: m.status === 'sold',
      href: `/buysell/${m.id}`,
    }]));
  },
  pg_listing: async (ids) => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('id, title, images, rent, locality')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((p) => [p.id, {
      title: p.title,
      image: p.images?.[0] || null,
      subtitle: p.rent != null ? `₹${p.rent}/mo` : null,
      meta: p.locality,
      href: `/pg-listings/${p.id}`,
    }]));
  },
  roommate_listing: async (ids) => {
    const { data, error } = await supabase
      .from('roommate_listings')
      .select('id, title, images, rent, locality, status')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((r) => [r.id, {
      title: r.title,
      image: r.images?.[0] || null,
      subtitle: r.rent != null ? `₹${r.rent}/mo` : null,
      meta: r.locality,
      unavailable: r.status === 'closed',
      href: `/roommates/${r.id}`,
    }]));
  },
  ride: async (ids) => {
    const { data, error } = await supabase
      .from('rides')
      .select('id, source, destination, departure_time, status')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((r) => [r.id, {
      title: `${r.source} → ${r.destination}`,
      meta: r.departure_time,
      unavailable: r.status === 'cancelled',
      href: `/rideshare/${r.id}`,
    }]));
  },
  discussion: async (ids) => {
    const { data, error } = await supabase
      .from('discussions')
      .select('id, title')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((d) => [d.id, { title: d.title, href: `/community/discussion/${d.id}` }]));
  },
  community_post: async (ids) => {
    // Community posts expire after 48h; a saved one may point at a row
    // that's since been removed. Missing ids simply don't resolve, and
    // the component shows an "no longer available" empty card for them.
    const { data, error } = await supabase
      .from('community_posts')
      .select('id, content, body, is_removed')
      .in('id', ids);
    if (error) throw error;
    return new Map((data || []).map((p) => [p.id, {
      title: (p.content || p.body || '').slice(0, 80),
      unavailable: !!p.is_removed,
      href: `/community/post/${p.id}`,
    }]));
  },
  movie: async () => new Map(), // reserved for future BookMyShow/external integration
};

/**
 * Hydrate every saved item into a display-ready card, grouped by item_type.
 * Groups are generated dynamically from whatever item_types are actually
 * present in the user's saved_items — nothing is hardcoded, so a brand new
 * item_type (added to SAVEABLE_TYPES + RESOLVERS later) appears automatically.
 */
export async function getSavedLibrary(userId) {
  const rows = await getSavedItems(userId);
  const byType = new Map();
  for (const row of rows) {
    if (!byType.has(row.item_type)) byType.set(row.item_type, []);
    byType.get(row.item_type).push(row);
  }

  const groups = await Promise.all(
    Array.from(byType.entries()).map(async ([itemType, savedRows]) => {
      const ids = savedRows.map((r) => r.item_id);
      const resolver = RESOLVERS[itemType];
      let cardsById = new Map();
      try {
        cardsById = resolver ? await resolver(ids) : new Map();
      } catch {
        cardsById = new Map(); // one broken resolver never blocks other groups
      }
      const items = savedRows.map((r) => ({
        savedItemId: r.id,
        itemType: r.item_type,
        itemId: r.item_id,
        savedAt: r.created_at,
        card: cardsById.get(r.item_id) || { title: 'No longer available', unavailable: true },
      }));
      return { itemType, items };
    })
  );

  // newest-saved-first within each group, groups ordered by most recent save
  groups.forEach((g) => g.items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
  groups.sort((a, b) => new Date(b.items[0]?.savedAt || 0) - new Date(a.items[0]?.savedAt || 0));
  return groups;
}
