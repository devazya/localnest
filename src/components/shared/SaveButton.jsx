/**
 * SaveButton.jsx
 * Universal bookmark control — one component, used on every saveable card
 * in LocalNest (business, event, offer, marketplace item, PG/roommate
 * listing, ride, discussion, community post). Persists via saved_items
 * (services/savedItems.js); no local-only state — the saved state shown
 * here is always seeded from Supabase by the parent (see useSavedState).
 *
 * Interaction: tap -> light haptic -> lavender fill -> small spring pop.
 * Deliberately restrained — one scale keyframe, no rotation/confetti.
 */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { toggleSaveItem } from '../../services/savedItems';

const SIZES = {
  sm: { box: 30, icon: 15 },
  md: { box: 36, icon: 17 },
  lg: { box: 42, icon: 20 },
};

export default function SaveButton({
  userId,
  itemType,
  itemId,
  saved = false,
  size = 'md',
  onChange,
  className,
  style,
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, setPending] = useState(false);
  const { box, icon } = SIZES[size] || SIZES.md;

  const handleTap = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending || !userId) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // light haptic
    }

    const next = !isSaved;
    setIsSaved(next); // optimistic — feels instant
    setPending(true);
    try {
      const confirmed = await toggleSaveItem(userId, itemType, itemId, isSaved);
      setIsSaved(confirmed);
      onChange?.(confirmed);
    } catch {
      setIsSaved(isSaved); // revert on failure
    } finally {
      setPending(false);
    }
  }, [isSaved, pending, userId, itemType, itemId, onChange]);

  return (
    <motion.button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from Saved' : 'Save'}
      onClick={handleTap}
      whileTap={{ scale: 0.85 }}
      className={className}
      style={{
        width: box,
        height: box,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(13,8,32,0.12)',
        cursor: userId ? 'pointer' : 'default',
        ...style,
      }}
    >
      <motion.span
        key={isSaved ? 'saved' : 'unsaved'}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 14 }}
        style={{ display: 'grid', placeItems: 'center' }}
      >
        <Bookmark
          size={icon}
          strokeWidth={2}
          fill={isSaved ? 'var(--primary, #6D4AFF)' : 'none'}
          color={isSaved ? 'var(--primary, #6D4AFF)' : 'var(--text-secondary, #4B5563)'}
        />
      </motion.span>
    </motion.button>
  );
}
