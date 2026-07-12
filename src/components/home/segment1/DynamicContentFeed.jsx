/**
 * DynamicContentFeed.jsx — §9.6.2
 * Renders the result of the active Module + Filter pair, directly on Home.
 * Cross-fades on change (never a hard cut); a static, non-shimmering
 * skeleton while loading; a calm one-line empty state when a pair genuinely
 * has no content yet. `role="tabpanel"` with a brief `aria-live="polite"`
 * summary rather than reading every card on every filter change (§12).
 *
 * Data-fetching/ranking logic itself lives in services/homeFeed.js — this
 * component only owns the container, transition, loading and empty states
 * (§9.6.2 scope note).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchModuleContent } from '../../../services/homeFeed';
import { getSavedIdsForType, toggleSaveItem } from '../../../services/savedItems';
import styles from './DynamicContentFeed.module.css';

function SkeletonCard({ i }) {
  return <div className={styles.skeleton} style={{ animationDelay: `${i * 40}ms` }} />;
}

/**
 * Bookmark toggle rendered on saveable cards only (§ saved_items scope
 * note in homeFeed.js — community_posts are excluded since they expire
 * after 48h and never render this button).
 */
function SaveToggle({ saved, onToggle }) {
  return (
    <button
      type="button"
      className={styles.saveBtn}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      aria-pressed={saved}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

export default function DynamicContentFeed({ moduleId, filterId, moduleLabel, filterLabel, onOpenModule, userId }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'empty'
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const myRequest = ++requestId.current;
    setStatus('loading');

    fetchModuleContent(moduleId, filterId).then(async (result) => {
      if (cancelled || myRequest !== requestId.current) return;
      setItems(result);
      setStatus(result.length > 0 ? 'ready' : 'empty');

      // Hydrate saved state in one batched query (per item type present).
      const saveableType = result.find((r) => r.saveable)?.itemType;
      if (userId && saveableType) {
        const ids = result.filter((r) => r.saveable).map((r) => r.id);
        try {
          const saved = await getSavedIdsForType(userId, saveableType, ids);
          if (!cancelled && myRequest === requestId.current) setSavedIds(saved);
        } catch (err) {
          console.error('[DynamicContentFeed] failed to load saved state:', err);
        }
      } else {
        setSavedIds(new Set());
      }
    });

    return () => { cancelled = true; };
  }, [moduleId, filterId, userId]);

  const handleToggleSave = useCallback(async (item) => {
    if (!userId || !item.saveable) return;
    const currentlySaved = savedIds.has(item.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      currentlySaved ? next.delete(item.id) : next.add(item.id);
      return next;
    });
    try {
      await toggleSaveItem(userId, item.itemType, item.id, currentlySaved);
    } catch (err) {
      console.error('[DynamicContentFeed] toggle save failed:', err);
      setSavedIds((prev) => {
        const next = new Set(prev);
        currentlySaved ? next.add(item.id) : next.delete(item.id);
        return next;
      });
    }
  }, [userId, savedIds]);

  const summary = status === 'ready'
    ? `Showing ${filterLabel} in ${moduleLabel}, ${items.length} result${items.length === 1 ? '' : 's'}`
    : status === 'empty'
      ? `No ${filterLabel.toLowerCase()} nearby yet in ${moduleLabel}`
      : `Loading ${filterLabel} in ${moduleLabel}`;

  return (
    <div
      id="s1-content-feed"
      role="tabpanel"
      aria-live="polite"
      className={styles.feed}
    >
      <span className={styles.srOnly}>{summary}</span>

      {status === 'loading' && (
        <div className={styles.grid} aria-hidden="true">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} i={i} />)}
        </div>
      )}

      {status === 'empty' && (
        <div className={styles.empty}>
          Nothing to show for {filterLabel} in {moduleLabel} nearby yet — check back soon.
        </div>
      )}

      {status === 'ready' && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${moduleId}:${filterId}`}
            className={styles.grid}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                className={styles.card}
                onClick={() => onOpenModule?.(moduleId)}
                type="button"
              >
                <span className={styles.cardEmoji} aria-hidden="true">{item.emoji}</span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  {item.subtitle && <span className={styles.cardSubtitle}>{item.subtitle}</span>}
                </span>
                {item.meta && <span className={styles.cardMeta}>{item.meta}</span>}
                {item.saveable && userId && (
                  <SaveToggle saved={savedIds.has(item.id)} onToggle={() => handleToggleSave(item)} />
                )}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
