/**
 * sportsSocial.js
 * ---------------------------------------------------------------------
 * The "people, not just venues" layer for Let's Play. Reads:
 *
 *   sport_matches         — open matches / games / coaching sessions
 *   match_participants    — who has joined a match
 *   sport_partner_requests — "looking for a partner" posts
 *
 * This module is READ-ONLY today. There is no create-match, join-match
 * or post-partner-request UI yet — those are future screens. What
 * exists now is the fetch layer that lets a card honestly say things
 * like "12 players joined this football game" or "4 people are looking
 * for a badminton partner tonight", using only rows that are actually
 * there. Never fabricates counts: every function returns an empty
 * array/0 when there's nothing to show, and callers must treat that as
 * "render nothing" (see VenueCard's socialProof line), matching the
 * "no fake data" rule already established in venues.js.
 *
 * FUTURE UI (not built yet, this module is ready for it):
 *   - createMatch(), joinMatch(), leaveMatch()
 *   - createPartnerRequest(), respondToPartnerRequest()
 *   - a "Matches near you" / "Find a partner" tab on the venue detail
 *     or a dedicated screen, per the Let's Play FUTURE CAPABILITIES list.
 */
import { supabase } from './supabase/client';

/**
 * fetchSocialSignalsForVenueSports(venueSportIds) -> Map<venueSportId, {
 *   openMatchCount, coachingSessionCount, nextCoachingStartsAt, joinedCount
 * }>
 *
 * One batched query (not one per card) for every venue_sports id
 * currently on screen — mirrors the useMixedSavedState batching
 * pattern. Only counts matches that are upcoming/ongoing and public.
 */
export async function fetchSocialSignalsForVenueSports(venueSportIds = []) {
  const signals = new Map();
  if (!venueSportIds || venueSportIds.length === 0) return signals;

  const { data, error } = await supabase
    .from('sport_matches')
    .select('id, venue_sport_id, match_type, starts_at, current_participants, max_participants')
    .in('venue_sport_id', venueSportIds)
    .eq('visibility', 'public')
    .in('status', ['upcoming', 'ongoing'])
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('[sportsSocial] failed to load matches for venues:', error);
    return signals;
  }

  for (const row of data || []) {
    const bucket = signals.get(row.venue_sport_id) || {
      openMatchCount: 0,
      coachingSessionCount: 0,
      nextCoachingStartsAt: null,
      joinedCount: 0,
    };

    if (row.match_type === 'coaching_session') {
      bucket.coachingSessionCount += 1;
      if (!bucket.nextCoachingStartsAt || new Date(row.starts_at) < new Date(bucket.nextCoachingStartsAt)) {
        bucket.nextCoachingStartsAt = row.starts_at;
      }
    } else {
      bucket.openMatchCount += 1;
    }
    bucket.joinedCount += row.current_participants || 0;

    signals.set(row.venue_sport_id, bucket);
  }

  return signals;
}

/**
 * fetchPartnerRequestCounts({ sportIds }) -> Map<sportId, count>
 * Powers "4 people are looking for a badminton partner tonight" —
 * grouped by sport so a category chip or card can surface it without
 * a per-card round trip.
 */
export async function fetchPartnerRequestCounts({ sportIds = [] } = {}) {
  const counts = new Map();
  if (!sportIds || sportIds.length === 0) return counts;

  const { data, error } = await supabase
    .from('sport_partner_requests')
    .select('sport_id')
    .in('sport_id', sportIds)
    .eq('status', 'open');

  if (error) {
    console.error('[sportsSocial] failed to load partner requests:', error);
    return counts;
  }

  for (const row of data || []) {
    counts.set(row.sport_id, (counts.get(row.sport_id) || 0) + 1);
  }
  return counts;
}

/**
 * fetchUpcomingMatchesForVenueSport(venueSportId) -> Promise<Match[]>
 * Full detail for a single venue+sport — for a future "Matches" tab on
 * the venue detail screen. Not called anywhere yet.
 */
export async function fetchUpcomingMatchesForVenueSport(venueSportId) {
  const { data, error } = await supabase
    .from('sport_matches')
    .select('id, match_type, title, description, starts_at, ends_at, skill_level, max_participants, current_participants, status')
    .eq('venue_sport_id', venueSportId)
    .eq('visibility', 'public')
    .in('status', ['upcoming', 'ongoing'])
    .order('starts_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * fetchOpenPartnerRequests({ sportSlug, locality }) -> Promise<Request[]>
 * For a future "Find a partner" screen — not called anywhere yet.
 */
export async function fetchOpenPartnerRequests({ sportSlug, locality } = {}) {
  let query = supabase
    .from('sport_partner_requests')
    .select('id, sport:sports!inner(slug, label, icon), venue_id, locality, city, preferred_time, skill_level, note, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (sportSlug) query = query.eq('sport.slug', sportSlug);
  if (locality) query = query.eq('locality', locality);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
