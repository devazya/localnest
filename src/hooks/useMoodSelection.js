/**
 * useMoodSelection.js
 * ---------------------------------------------------------------------
 * Owns everything MoodCardsSection needs: fetching moods, tracking the
 * active selection, and persisting it — via moodsService, never
 * Supabase directly. Components only ever talk to this hook.
 *
 * Also mirrors the current selection into MoodContext (context/MoodContext.jsx)
 * so other parts of Home — Friend AI, later — can read "what mood is
 * the user in right now" without importing this hook or moodsService
 * themselves. No consumer reads that context yet; this only wires the
 * plumbing per the brief ("Friend AI should be notified of the
 * selected mood. Use context or state. Do not implement AI logic yet.").
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchMoods, getSelectedMood, setSelectedMood as persistSelectedMood } from '../services/moodsService';
import { logEvent } from '../services/userEvents';
import { useMoodContext } from '../context/MoodContext';

export function useMoodSelection() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [moods, setMoods] = useState([]);
  const [selectedSlug, setSelectedSlugState] = useState(null);
  const moodContext = useMoodContext(); // may be null if no MoodProvider is mounted above — guarded below

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [moodList, selected] = await Promise.all([fetchMoods(), getSelectedMood()]);
      setMoods(moodList);
      setSelectedSlugState(selected);
      setStatus(moodList.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.error('[useMoodSelection] failed to load moods:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keep MoodContext in sync so other sections can read the selection later.
  useEffect(() => {
    moodContext?.setSelectedMood(selectedSlug);
  }, [selectedSlug, moodContext]);

  const selectMood = useCallback((slug) => {
    // Tapping the already-selected mood deselects it — "only one mood
    // may be active" doesn't preclude clearing the selection entirely.
    const previous = selectedSlug;
    const next = slug === selectedSlug ? null : slug;
    setSelectedSlugState(next); // optimistic — UI reflects the tap immediately
    persistSelectedMood(next).catch((err) => {
      console.error('[useMoodSelection] failed to persist mood selection:', err);
    });

    // Phase 0 behaviour logging — see LocalNest Phase 0 brief.
    logEvent(
      next
        ? { eventName: 'mood.selected', screen: 'home', module: 'mood-cards', objectType: 'mood', objectId: next, metadata: { previous_mood: previous } }
        : { eventName: 'mood.cleared', screen: 'home', module: 'mood-cards', objectType: 'mood', objectId: previous, metadata: {} }
    );
  }, [selectedSlug]);

  return { status, moods, selectedSlug, selectMood, reload: load };
}
