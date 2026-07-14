/**
 * useMixedSavedState.js
 * Like useSavedState, but for a list of cards that mix multiple
 * saved_items item_types (e.g. the Happening Around feed, which has
 * event/ride/offer/community_post cards side by side). Groups ids by
 * type and issues one batched query per type (not per card), then
 * exposes a single isSaved(saveType, id) lookup.
 */
import { useEffect, useState, useCallback } from 'react';
import { getSavedIdsForType } from '../services/savedItems';

const key = (saveType, id) => `${saveType}:${id}`;

/**
 * @param {string|null} userId
 * @param {Array<{ saveType: string|null, saveId: string }>} items
 */
export function useMixedSavedState(userId, items = []) {
  const [savedKeys, setSavedKeys] = useState(new Set());
  const depKey = items.map((i) => `${i.saveType}:${i.saveId}`).join(',');

  useEffect(() => {
    let cancelled = false;
    if (!userId || items.length === 0) {
      setSavedKeys(new Set());
      return;
    }

    const byType = new Map();
    for (const item of items) {
      if (!item.saveType) continue; // not-yet-saveable types (e.g. external alerts)
      if (!byType.has(item.saveType)) byType.set(item.saveType, []);
      byType.get(item.saveType).push(item.saveId);
    }

    Promise.all(
      Array.from(byType.entries()).map(([saveType, ids]) =>
        getSavedIdsForType(userId, saveType, ids).then((idSet) =>
          Array.from(idSet).map((id) => key(saveType, id))
        )
      )
    )
      .then((groups) => {
        if (cancelled) return;
        setSavedKeys(new Set(groups.flat()));
      })
      .catch(() => {
        if (!cancelled) setSavedKeys(new Set());
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, depKey]);

  const isSaved = useCallback(
    (saveType, id) => savedKeys.has(key(saveType, id)),
    [savedKeys]
  );

  return { isSaved };
}
