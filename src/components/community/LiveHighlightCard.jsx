/**
 * LiveHighlightCard.jsx — Community module (Segment 2)
 * "What's Happening Nearby" — a single premium highlight card that
 * rotates through content. Each notification is a self-contained object
 * that carries its OWN destination — the card never hardcodes a single
 * click target. Whichever notification is currently visible is the one
 * that determines where a click navigates, with no possibility of the
 * two getting out of sync (the click handler is built from the exact
 * `item` that's on screen at render time, not a stale handler from when
 * the rotation started).
 *
 * destinationType drives how Community.jsx routes the click:
 *   'discussion' → opens that Discussion Room (destination = discussion id)
 *   anything else ('page' | 'ride' | 'pg' | 'event' | 'marketplace' | 'job')
 *     → app-level navigation (destination = page key for onNavigate)
 *
 * Discussion highlights are built from real Supabase rows passed in via
 * `discussions` (Community.jsx's live `allDiscussions`/discovery data) —
 * never hardcoded fake ids. A fake id here would never match a real
 * discussion, so a click would silently fall through to app navigation
 * with an unrecognised page key and land on Home — that was the bug this
 * real-data wiring fixes.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHANNEL_EMOJI } from './constants';

// Always-valid static entries — 'rideshare' and 'pgs' are real page keys
// registered in App.jsx's PAGES registry, so these never break navigation.
const STATIC_HIGHLIGHTS = [
  {
    id: 'h-rides',
    type: 'ride',
    icon: '🚗',
    title: 'Check out ride offers happening near you.',
    destination: 'rideshare',
    destinationType: 'ride',
  },
  {
    id: 'h-pg-listings',
    type: 'pg',
    icon: '🏡',
    title: 'Browse the latest PG listings in your area.',
    destination: 'pgs',
    destinationType: 'pg',
  },
];

export default function LiveHighlightCard({ onSelect, discussions = [] }) {
  const [index, setIndex] = useState(0);

  // Real discussion highlights only — built from actual Supabase rows, so
  // `destination` is always a real discussion id that Community.jsx can
  // find in `allDiscussions`.
  const discussionHighlights = useMemo(
    () => (discussions || []).slice(0, 3).map(d => ({
      id: `h-discussion-${d.id}`,
      type: 'discussion',
      icon: CHANNEL_EMOJI[d.community_channel] || '🗨️',
      title: `"${d.title}" is trending right now.`,
      destination: d.id,
      destinationType: 'discussion',
    })),
    [discussions]
  );

  const HIGHLIGHTS = useMemo(
    () => [...discussionHighlights, ...STATIC_HIGHLIGHTS],
    [discussionHighlights]
  );

  useEffect(() => {
    if (HIGHLIGHTS.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % HIGHLIGHTS.length), 6000);
    return () => clearInterval(t);
  }, [HIGHLIGHTS.length]);

  // Rotation index can end up out of range when the list shrinks (e.g. a
  // trending discussion drops off) — clamp defensively instead of crashing.
  const item = HIGHLIGHTS[index % HIGHLIGHTS.length];
  if (!item) return null;

  // Always built from the `item` currently on screen — there is no other
  // path to navigation, so the visible notification and the click target
  // can never drift apart.
  const handleClick = () => onSelect?.(item);

  return (
    <div style={{ padding: '14px 14px 0' }}>
      <motion.div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -2 }}
        style={{
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          borderRadius: 22, padding: '16px 18px',
          background: 'linear-gradient(135deg, #F8F7FF 0%, #F1EEFF 100%)',
          border: '1.5px solid rgba(109,74,255,0.14)',
          boxShadow: '0 4px 20px rgba(109,74,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        {/* soft animated shimmer */}
        <motion.div
          aria-hidden
          animate={{ x: ['-30%', '130%'] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', top: 0, bottom: 0, width: '40%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Icon + text rotate together as one unit — Dynamic-Island-style
            fade + slide + scale, so the swap reads as a single coherent
            "morph" rather than two pieces animating independently. */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0, position: 'relative' }}
          >
            <span style={{ fontSize: 30, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0D0820', lineHeight: 1.4 }}>{item.title}</span>
          </motion.div>
        </AnimatePresence>

        {/* Visual affordance only — not a separate clickable button. The
            entire card above is the click target (Segment 2 UX decision). */}
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.4" style={{ flexShrink: 0, position: 'relative' }}>
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </motion.div>
    </div>
  );
}
