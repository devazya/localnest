/**
 * homeHighlights.js
 * ---------------------------------------------------------------------
 * Data-fetching for the Home page "Highlight" section — a 5-card
 * auto-sliding spotlight reel (Movies / Cafe / Sports / Deals /
 * Nightlife). Reads ONLY home_highlights — its own admin-curated table,
 * not curated_picks/offers/businesses. See the table comment in the
 * `create_home_highlights` migration for why it's separate.
 *
 * Every field the card/section renders (title, description, badge_label,
 * image_url, is_clickable, nav_target) comes from this table — never
 * hardcoded client-side, so an editor can change copy, swap the image,
 * or flip a genre's clickability straight from Supabase.
 */
import { supabase } from './supabase/client';

/**
 * fetchHomeHighlights({ locality }) -> Promise<HighlightCard[]>
 * locality: the current user's profiles.locality, if known — prefers
 * locally-scoped rows while still falling back to globally-scoped
 * (locality_scope IS NULL) ones rather than showing nothing.
 */
export async function fetchHomeHighlights({ locality = null } = {}) {
  let query = supabase
    .from('home_highlights')
    .select('id, genre, title, description, badge_label, image_url, is_clickable, nav_target, nav_params, sort_order')
    .order('sort_order', { ascending: true });

  query = locality
    ? query.or(`locality_scope.is.null,locality_scope.eq.${locality}`)
    : query.is('locality_scope', null);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    genre: row.genre,
    title: row.title,
    description: row.description || null,
    badgeLabel: row.badge_label || null,
    imageUrl: row.image_url || null,
    isClickable: !!row.is_clickable && !!row.nav_target,
    navTarget: row.nav_target || null,
    navParams: row.nav_params || {},
  }));
}
