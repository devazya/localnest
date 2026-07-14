/**
 * useAddressSearch
 * ---------------------------------------------------------------------
 * Backs the Smart Ride destination command palette (AddressSearchSheet).
 * Owns: query text, debounced live suggestions, the selected location,
 * recent destinations, and Home/Work saved locations. Talks only to
 * services/smartRide.js, so swapping the underlying suggestion source
 * (Supabase today → Google Places / Mapbox / OSM later) never touches
 * this hook's contract or any component that consumes it.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  searchAddresses,
  getRecentLocations,
  getSavedLocations,
  recordRecentLocation,
  upsertSavedLocation,
  deleteSavedLocation,
} from '../services/smartRide';

const DEBOUNCE_MS = 220;

export function useAddressSearch(userId) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [recents, setRecents]         = useState([]);
  const [saved, setSaved]             = useState([]); // [{label:'Home',...}, {label:'Work',...}]
  const debounceRef = useRef(null);

  const refreshRecents = useCallback(async () => {
    const data = await getRecentLocations(userId);
    setRecents(data);
  }, [userId]);

  const refreshSaved = useCallback(async () => {
    const data = await getSavedLocations(userId);
    setSaved(data);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    refreshRecents();
    refreshSaved();
  }, [userId, refreshRecents, refreshSaved]);

  // Debounced live suggestions as the user types.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(query, { userId });
      setSuggestions(results);
      setSearching(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query, userId]);

  const homeLocation = saved.find((s) => s.label === 'Home') || null;
  const workLocation = saved.find((s) => s.label === 'Work') || null;

  /** Select a destination (from suggestions, recents, or Home/Work) and log it as recent. */
  const selectLocation = useCallback(async (loc) => {
    setSelected(loc);
    setQuery(loc.label || loc.place_name || '');
    if (userId && (loc.label || loc.place_name)) {
      await recordRecentLocation(userId, {
        placeName: loc.label || loc.place_name,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      refreshRecents();
    }
  }, [userId, refreshRecents]);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setQuery('');
    setSuggestions([]);
  }, []);

  const setHomeOrWork = useCallback(async (labelType, loc) => {
    if (!userId) return;
    await upsertSavedLocation(userId, {
      label: labelType,
      placeName: loc.label || loc.place_name,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    refreshSaved();
  }, [userId, refreshSaved]);

  const removeHomeOrWork = useCallback(async (labelType) => {
    if (!userId) return;
    await deleteSavedLocation(userId, labelType);
    refreshSaved();
  }, [userId, refreshSaved]);

  return {
    query, setQuery,
    suggestions, searching,
    selected, selectLocation, clearSelection,
    recents, refreshRecents,
    saved, homeLocation, workLocation, setHomeOrWork, removeHomeOrWork,
  };
}
