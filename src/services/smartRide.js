/**
 * smartRide.js
 * ---------------------------------------------------------------------
 * Data layer for the Smart Ride Home section. Deliberately provider-
 * agnostic: nothing in here (or in the components that call it) assumes
 * Supabase is the permanent source of address suggestions — it's just
 * today's backing store. When a live autocomplete provider (Google
 * Places, Mapbox, OSM) is wired in, only `searchAddresses` below changes;
 * every caller keeps working against the same { id, label, subLabel,
 * latitude, longitude, source } shape.
 *
 * Tables used (proposed, not yet created — see project notes):
 *   saved_locations   (id, user_id, label, place_name, latitude, longitude, updated_at)
 *   recent_locations  (id, user_id, place_name, latitude, longitude, visited_at)
 *   ride_providers    (id, name, logo, enabled, priority, deep_link)      — not read yet
 *   vehicle_types     (id, provider_id, vehicle_name, display_name, ...) — not read yet
 *
 * Every function fails soft (returns [] / null and logs) so one broken
 * call never takes down the whole Smart Ride card — callers still get a
 * usable, if temporarily empty, UI.
 */
import { supabase } from './supabase/client';

const RECENTS_LIMIT = 5;

/* ── Saved locations (Home / Work) ──────────────────────────────────── */

/** Fetch the user's saved Home/Work (and any other labelled) locations. */
export async function getSavedLocations(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('id, label, place_name, latitude, longitude, updated_at')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[smartRide] getSavedLocations failed:', err);
    return [];
  }
}

/** Create or update a labelled saved location (e.g. label: 'Home' | 'Work'). */
export async function upsertSavedLocation(userId, { label, placeName, latitude, longitude }) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('saved_locations')
      .upsert(
        {
          user_id: userId,
          label,
          place_name: placeName,
          latitude,
          longitude,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,label' },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[smartRide] upsertSavedLocation failed:', err);
    return null;
  }
}

/** Remove a labelled saved location. */
export async function deleteSavedLocation(userId, label) {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .match({ user_id: userId, label });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[smartRide] deleteSavedLocation failed:', err);
    return false;
  }
}

/* ── Recent destinations ────────────────────────────────────────────── */

/** Most recent distinct destinations, newest first, capped at 5. */
export async function getRecentLocations(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('recent_locations')
      .select('id, place_name, latitude, longitude, visited_at')
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(RECENTS_LIMIT);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[smartRide] getRecentLocations failed:', err);
    return [];
  }
}

/** Record a destination as visited "now" — call after a successful selection. */
export async function recordRecentLocation(userId, { placeName, latitude, longitude }) {
  if (!userId || !placeName) return null;
  try {
    const { data, error } = await supabase
      .from('recent_locations')
      .insert({ user_id: userId, place_name: placeName, latitude, longitude, visited_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[smartRide] recordRecentLocation failed:', err);
    return null;
  }
}

/* ── Address search (provider abstraction) ─────────────────────────── */
/**
 * searchAddresses — today: matches against the user's own recent +
 * saved locations in Supabase. Tomorrow: swap the body for a call to
 * Google Places / Mapbox / OSM and keep the same return shape, and
 * every consumer (AddressSearchSheet, useAddressSearch) keeps working
 * unchanged.
 *
 * @returns {Promise<Array<{id:string, label:string, subLabel:string|null, latitude:number|null, longitude:number|null, source:'recent'|'saved'|'remote'}>>}
 */
export async function searchAddresses(query, { userId } = {}) {
  const q = (query || '').trim();
  if (!q || !userId) return [];
  try {
    const [{ data: recents }, { data: saved }] = await Promise.all([
      supabase
        .from('recent_locations')
        .select('id, place_name, latitude, longitude')
        .eq('user_id', userId)
        .ilike('place_name', `%${q}%`)
        .limit(6),
      supabase
        .from('saved_locations')
        .select('id, label, place_name, latitude, longitude')
        .eq('user_id', userId)
        .ilike('place_name', `%${q}%`)
        .limit(4),
    ]);

    const results = [
      ...(saved || []).map((s) => ({
        id: `saved-${s.id}`,
        label: s.place_name,
        subLabel: s.label,
        latitude: s.latitude,
        longitude: s.longitude,
        source: 'saved',
      })),
      ...(recents || []).map((r) => ({
        id: `recent-${r.id}`,
        label: r.place_name,
        subLabel: 'Recent',
        latitude: r.latitude,
        longitude: r.longitude,
        source: 'recent',
      })),
    ];

    // De-dupe by label — a place saved AND recently visited should show once.
    const seen = new Set();
    return results.filter((r) => {
      const key = r.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (err) {
    console.error('[smartRide] searchAddresses failed:', err);
    return [];
  }
}

/* ── Ride providers (Compare Rides logos) ──────────────────── */

/** Enabled providers, backend-ordered by priority. Never hardcode this list
 *  in a component — adding a provider or disabling one is a data change. */
export async function getEnabledRideProviders(citySlug) {
  try {
    const { data, error } = await supabase
      .from('ride_providers')
      .select('id, name, logo_url, deep_link_scheme, priority, city_scope')
      .eq('enabled', true)
      .order('priority', { ascending: false });
    if (error) throw error;
    const all = data || [];
    if (!citySlug) return all;
    return all.filter((p) => !p.city_scope || p.city_scope === citySlug);
  } catch (err) {
    console.error('[smartRide] getEnabledRideProviders failed:', err);
    return [];
  }
}

