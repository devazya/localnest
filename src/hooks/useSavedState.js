/**
 * useSavedState.js
 * Hydrates "is this saved?" for a batch of cards of one item_type in a
 * single query (see savedItems.getSavedIdsForType) instead of one
 * round-trip per card. Always backed by Supabase — no local-only state.
 *
 * Usage:
 *   const { isSaved } = useSavedState(userId, 'business', businesses.map(b => b.id));
 *   <SaveButton userId={userId} itemType="business" itemId={b.id} saved={isSaved(b.id)} />
 */
import { useEffect, useState, useCallback } from 'react';
import { getSavedIdsForType } from '../services/savedItems';

export function useSavedState(userId, itemType, itemIds = []) {
  const [savedIds, setSavedIds] = useState(new Set());
  const key = itemIds.join(',');

  useEffect(() => {
    let cancelled = false;
    if (!userId || itemIds.length === 0) {
      setSavedIds(new Set());
      return;
    }
    getSavedIdsForType(userId, itemType, itemIds)
      .then((ids) => { if (!cancelled) setSavedIds(ids); })
      .catch(() => { if (!cancelled) setSavedIds(new Set()); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, itemType, key]);

  const isSaved = useCallback((id) => savedIds.has(id), [savedIds]);

  return { isSaved, savedIds };
}
