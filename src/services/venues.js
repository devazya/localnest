/**
 * venues.js
 * ---------------------------------------------------------------------
 * Data-fetching for the "Let's Play" Home section. Reads ONLY the
 * normalized sports-booking schema:
 *
 *   businesses (business_type = 'venue')
 *     -> venue_sports (business_id, sport_id, price_per_hour, ...)
 *          -> venue_slots (venue_sport_id, starts_at, capacity, booked_count, status)
 *   sports (id, slug, label, icon)
 *
 * One venue_sports row = one bookable "venue offers this sport" card.
 * A venue offering 3 sports produces 3 cards — this mirrors how price,
 * slot duration and indoor/outdoor vary per sport at the same venue.
 *
 * Never queries community_posts, feed_items, events, etc. — Let's Play
 * is its own concept and stays out of Happening Around / Neighbourhood
 * Pulse's tables, same guardrail already established in homeFeed.js.
 *
 * "Distance" is intentionally NOT computed here yet — there is no
 * resolved user-location hook wired to this section today, and
 * fabricating a distance string would violate the "no fake data" brief.
 * Locality is surfaced instead until real geo-distance is wired in (see
 * businesses.location / venue.latitude+longitude, which already exist
 * for this later).
 *
 * SOCIAL LAYER — "people, not just venues": also batches one query
 * against services/sportsSocial.js to attach an honest, optional
 * `socialProof` string per card (e.g. "12 joined · 3 looking for a
 * partner"). Built only from rows that exist — never fabricated. See
 * sportsSocial.js for the underlying sport_matches / match_participants
 * / sport_partner_requests tables (architecture prep for match-joining,
 * not implemented as a UI flow yet).
 */
import { supabase } from './supabase/client';
import { fetchSocialSignalsForVenueSports, fetchPartnerRequestCounts } from './sportsSocial';

const LIMIT = 12;

/**
 * A slot is "open" but shown as "limited" once its remaining capacity
 * drops to 25% or less — a presentation-only distinction (the DB only
 * knows open/full/cancelled). Never fabricated for a slot with no data.
 *
 * Also derives two presentation-only states the DB doesn't store
 * directly, both from real data already on the row (never invented):
 *   'closed'      — venue has opening/closing hours and right now falls
 *                    outside them (uses businesses.opening_time/closing_time,
 *                    which already exist for this).
 *   'coming_soon' — venue_sports exists but has no slots published yet.
 */
function deriveBookingState(slots, venue) {
  const now = new Date();

  if (venue?.opening_time && venue?.closing_time) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = venue.opening_time.split(':').map(Number);
    const [closeH, closeM] = venue.closing_time.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const isOvernight = closeMinutes <= openMinutes; // e.g. 18:00 -> 02:00
    const withinHours = isOvernight
      ? (nowMinutes >= openMinutes || nowMinutes < closeMinutes)
      : (nowMinutes >= openMinutes && nowMinutes < closeMinutes);

    if (!withinHours && (!slots || slots.length === 0)) {
      return { status: 'closed', nextSlotAt: null };
    }
  }

  if (!slots || slots.length === 0) return { status: 'coming_soon', nextSlotAt: null };

  const upcoming = slots
    .filter((s) => new Date(s.starts_at).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

  const next = upcoming[0] || slots[0];
  if (!next) return { status: 'coming_soon', nextSlotAt: null };

  let status = next.status; // 'open' | 'full' | 'cancelled'
  if (status === 'open' && next.capacity > 0) {
    const remaining = next.capacity - (next.booked_count || 0);
    if (remaining <= Math.max(1, Math.ceil(next.capacity * 0.25))) {
      status = 'limited';
    }
  }

  return { status, nextSlotAt: next.starts_at };
}

/**
 * buildSocialProof(signal, partnerRequestCount) -> string | null
 * Honest, minimal copy — omits any clause with a zero count instead of
 * printing "0 joined". Returns null (render nothing) when there is
 * genuinely no social signal for this card.
 */
function buildSocialProof(signal, partnerRequestCount) {
  const clauses = [];

  if (signal?.nextCoachingStartsAt) {
    const mins = Math.round((new Date(signal.nextCoachingStartsAt).getTime() - Date.now()) / 60000);
    if (mins > 0 && mins <= 120) {
      clauses.push(`Coaching session starts in ${mins} min`);
    }
  }
  if (signal?.joinedCount > 0) {
    clauses.push(`${signal.joinedCount} joined`);
  }
  if (partnerRequestCount > 0) {
    clauses.push(`${partnerRequestCount} looking for a partner`);
  }

  return clauses.length > 0 ? clauses.join(' · ') : null;
}

/**
 * Dynamic chip source for the category selector — never hardcoded.
 * "All" is prepended by the component, not stored here.
 */
export async function fetchSportsCategories() {
  const { data, error } = await supabase
    .from('sports')
    .select('id, slug, label, icon')
    .order('label', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * fetchLetsPlayVenues({ sportSlug }) -> Promise<Card[]>
 * sportSlug: 'all' | a sports.slug value. Filtering is instant/client-
 * driven by the caller re-invoking this with a new slug — no route change.
 */
export async function fetchLetsPlayVenues({ sportSlug = 'all' } = {}) {
  let query = supabase
    .from('venue_sports')
    .select(`
      id,
      price_per_hour,
      slot_duration_minutes,
      surface_type,
      indoor,
      sport:sports!inner ( id, slug, label, icon ),
      venue:businesses!inner ( id, name, locality, city, images, rating, review_count, status, business_type, opening_time, closing_time ),
      venue_slots ( id, starts_at, ends_at, capacity, booked_count, status )
    `)
    .eq('venue.status', 'active')
    .eq('venue.business_type', 'venue')
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  if (sportSlug && sportSlug !== 'all') {
    query = query.eq('sport.slug', sportSlug);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data || [];

  // Batched, read-only social layer — one query for every card on
  // screen, never one-per-card. See services/sportsSocial.js.
  const venueSportIds = rows.map((r) => r.id);
  const sportIds = [...new Set(rows.map((r) => r.sport?.id).filter(Boolean))];
  const [socialSignals, partnerCounts] = await Promise.all([
    fetchSocialSignalsForVenueSports(venueSportIds),
    fetchPartnerRequestCounts({ sportIds }),
  ]);

  return rows.map((row) => {
    const { status, nextSlotAt } = deriveBookingState(row.venue_slots, row.venue);
    const signal = socialSignals.get(row.id);
    const partnerCount = partnerCounts.get(row.sport?.id) || 0;

    return {
      id: row.id,                       // venue_sports.id — the bookable unit
      venueId: row.venue?.id,
      venueName: row.venue?.name,
      locality: row.venue?.locality || row.venue?.city,
      imageUrl: row.venue?.images?.[0] || null,
      rating: row.venue?.rating,
      reviewCount: row.venue?.review_count,
      sportLabel: row.sport?.label,
      sportIcon: row.sport?.icon,
      sportSlug: row.sport?.slug,
      pricePerHour: row.price_per_hour,
      indoor: row.indoor,
      bookingStatus: status,            // 'open' | 'limited' | 'full' | 'cancelled' | 'closed' | 'coming_soon'
      nextSlotAt,
      socialProof: buildSocialProof(signal, partnerCount), // string | null — see buildSocialProof
      saveType: 'business',             // venues save through the existing business item_type
      saveId: row.venue?.id,
    };
  });
}
