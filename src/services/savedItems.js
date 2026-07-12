/**
 * savedItems.js
 * Bookmark ("save") service backed by the `saved_items` table.
 *
 * Scope: durable content only — shops, PGs, marketplace items, rides,
 * movies, offers, activities, events, gyms, discussions. Community posts
 * (`community_posts`) are intentionally NOT saveable — they expire after
 * 48h, so bookmarking one would just leave a dead link in the user's
 * Saved list. Callers should never pass item_type: 'community_post';
 * the DB check constraint will reject it anyway.
 */
import { supabase } from './supabase/client';

export const SAVEABLE_TYPES = [
  'shop', 'pg_listing', 'marketplace_item', 'ride',
  'movie', 'offer', 'activity', 'event', 'gym', 'discussion',
];

function assertSaveable(itemType) {
  if (!SAVEABLE_TYPES.includes(itemType)) {
    throw new Error(`"${itemType}" is not saveable (public posts expire after 48h and can't be bookmarked).`);
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

/** Fetch all saved items for a user, newest first (for the Saved screen). */
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
