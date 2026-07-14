/**
 * curatedPicks.js
 * ---------------------------------------------------------------------
 * Data-fetching for the "Neighbourhood Picks" Home section. Reads ONLY:
 *
 *   curated_picks (item_type='business') -- the single source of truth
 *     for ordering (priority) and editorial metadata (badge, highlight)
 *   -> businesses                         -- the raw listing
 *   -> business_categories                -- category label/icon + chips
 *
 * Never queries feed_items, venue_sports, community_posts, etc. — this
 * section is its own concept, same guardrail as homeFeed.js/venues.js.
 *
 * RANKING: never "rating only". The frontend simply consumes
 * curated_picks in priority order — today that's an editor-set integer,
 * but the column is the hook for popularity/AI-recommendation/distance
 * ranking later without any frontend change.
 *
 * business_reviews is deliberately NOT queried here — businesses.rating/
 * review_count are already the maintained aggregate, so a live review
 * join would be a duplicate, unrelated read for this section.
 *
 * EDITORIAL WORDING: `badge` and `highlight` are free-text editor input
 * from curated_picks — never fabricate one client-side, and never
 * substitute "Sponsored"/"Advertisement"/"Paid"/"Promoted" for a missing
 * value. A pick with no badge simply shows no tag.
 */
import { supabase } from './supabase/client';

const LIMIT = 12;

/**
 * Whether a business reads as open right now, from its stored
 * opening_time/closing_time (handles overnight ranges, e.g. 18:00-02:00).
 * Returns null (unknown) rather than guessing when times aren't set —
 * the card simply omits the Open/Closed pill in that case.
 */
function computeOpenNow(openingTime, closingTime) {
  if (!openingTime || !closingTime) return null;
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const open = toMinutes(openingTime);
  const close = toMinutes(closingTime);
  if (open === close) return true; // same open/close time == 24 hours

  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  return open < close ? (cur >= open && cur < close) : (cur >= open || cur < close);
}

/** Dynamic chip source — never hardcoded. "All" is prepended by the component. */
export async function fetchBusinessCategories() {
  const { data, error } = await supabase
    .from('business_categories')
    .select('id, slug, label, icon')
    .order('label', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * fetchNeighbourhoodPicks({ categorySlug, locality }) -> Promise<Card[]>
 * categorySlug: 'all' | a business_categories.slug value.
 * locality: the current user's profiles.locality, if known — used to
 * prefer locally-scoped picks while still falling back to globally-
 * scoped (locality_scope IS NULL) ones rather than showing nothing.
 */
export async function fetchNeighbourhoodPicks({ categorySlug = 'all', locality = null } = {}) {
  const nowIso = new Date().toISOString();

  // Resolve slug -> id first: PostgREST can't cleanly filter a
  // two-level-deep embedded relation (curated_picks -> business ->
  // business_categories), so this keeps the main query a single hop.
  let categoryId = null;
  if (categorySlug && categorySlug !== 'all') {
    const { data: cat, error: catErr } = await supabase
      .from('business_categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (catErr) throw catErr;
    if (!cat) return []; // unknown slug -> an honest empty result, not a guess
    categoryId = cat.id;
  }

  let query = supabase
    .from('curated_picks')
    .select(`
      id, priority, badge, highlight, starts_at, ends_at,
      business:businesses!inner (
        id, name, category_id, locality, city, images, rating, review_count,
        opening_time, closing_time, status,
        business_categories ( slug, label, icon )
      )
    `)
    .eq('item_type', 'business')
    .eq('business.status', 'active')
    .lte('starts_at', nowIso)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order('priority', { ascending: false })
    .order('starts_at', { ascending: false })
    .limit(LIMIT);

  query = locality
    ? query.or(`locality_scope.is.null,locality_scope.eq.${locality}`)
    : query.is('locality_scope', null);

  if (categoryId) {
    query = query.eq('business.category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row) => {
    const biz = row.business;
    return {
      id: row.id,                     // curated_picks.id — this specific placement
      businessId: biz?.id,
      name: biz?.name,
      categoryLabel: biz?.business_categories?.label,
      categoryIcon: biz?.business_categories?.icon,
      locality: biz?.locality || biz?.city,
      imageUrl: biz?.images?.[0] || null,
      rating: biz?.rating,
      reviewCount: biz?.review_count,
      openNow: computeOpenNow(biz?.opening_time, biz?.closing_time),
      badge: row.badge || null,
      highlight: row.highlight || null,
      saveType: 'business',
      saveId: biz?.id,
    };
  });
}
