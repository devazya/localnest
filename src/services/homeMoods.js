/**
 * homeMoods.js
 * ---------------------------------------------------------------------
 * Data-fetching for the Home page "Mood Cards" section — a horizontal
 * row of admin-curated mood selectors (Chill / Social / Productive /
 * Adventurous / Foodie / Romantic). Reads ONLY home_moods, its own
 * editorial table — same convention as services/homeHighlights.js
 * (never businesses/curated_picks/offers/feed_items).
 *
 * Every field the card renders (label, emoji, gradient, is_clickable,
 * nav_target) comes from this table — never hardcoded client-side.
 */
import { supabase } from './supabase/client';

/**
 * fetchHomeMoods({ locality }) -> Promise<MoodCard[]>
 * locality: the current user's profiles.locality, if known — prefers
 * locally-scoped rows while still falling back to globally-scoped
 * (locality_scope IS NULL) ones rather than showing nothing.
 */
export async function fetchHomeMoods({ locality = null } = {}) {
  let query = supabase
    .from('home_moods')
    .select('id, mood_key, label, emoji, gradient_from, gradient_to, is_clickable, nav_target, nav_params, sort_order')
    .order('sort_order', { ascending: true });

  query = locality
    ? query.or(`locality_scope.is.null,locality_scope.eq.${locality}`)
    : query.is('locality_scope', null);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    moodKey: row.mood_key,
    label: row.label,
    emoji: row.emoji,
    gradientFrom: row.gradient_from,
    gradientTo: row.gradient_to,
    isClickable: !!row.is_clickable && !!row.nav_target,
    navTarget: row.nav_target || null,
    navParams: row.nav_params || {},
  }));
}
