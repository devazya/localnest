/**
 * LiveNowTicker.jsx — Community module (Segment 3.2 revised)
 *
 * Twitter/X-style: a horizontally scrolling row of individual floating
 * pill cards — each item is its own capsule with a transparent-purple
 * gradient background, a LIVE dot, bold label text, and a count badge.
 *
 * Design language: LocalNest purple (#6D4AFF) at low opacity for the
 * glass surface, solid purple for text/badge, white glow for the LIVE dot.
 *
 * Animation: the row auto-scrolls smoothly (CSS translateX on doubled
 * content for seamless loop). On touch/hover the scroll pauses; resumes
 * after 2 s. prefers-reduced-motion → page-by-page auto-advance.
 *
 * Each pill is its own <button> — tapping opens its destination.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHANNEL_EMOJI } from './constants';

// ─── Static fallback pills ────────────────────────────────────────────────────
const STATIC_ITEMS = [
  { id: 'st-pg',    emoji: '🏡', label: 'PG Listings',      count: null, dest: 'pgs',       type: 'page' },
  { id: 'st-ride',  emoji: '🚗', label: 'Ride Sharing',     count: null, dest: 'rideshare', type: 'page' },
  { id: 'st-sell',  emoji: '🛍️', label: 'Buy & Sell',       count: null, dest: 'buysell',   type: 'page' },
  { id: 'st-jobs',  emoji: '💼', label: 'Jobs',             count: null, dest: 'community', type: 'page' },
];

// ─── Build pill list from live data ──────────────────────────────────────────
function buildItems({ discussions, onlineCount, rideCount, pgCount, eventCount }) {
  const items = [];

  if (onlineCount > 0) {
    items.push({
      id: 'live-chat', emoji: '💬', label: 'Neighbourhood Chat',
      count: `${onlineCount} online`, dest: 'general-chat', type: 'chat',
    });
  }

  const activeDiscs = (discussions || []).slice(0, 5);
  for (const d of activeDiscs) {
    const emoji = CHANNEL_EMOJI[d.community_channel] || '🗨️';
    const short = d.title.length > 22 ? d.title.slice(0, 22) + '…' : d.title;
    items.push({
      id: `disc-${d.id}`, emoji, label: short,
      count: 'discussing', dest: d.id, type: 'discussion',
    });
  }

  if (rideCount > 0) {
    items.push({
      id: 'live-rides', emoji: '🚗', label: 'Ride Sharing',
      count: `${rideCount} active`, dest: 'rideshare', type: 'page',
    });
  }
  if (pgCount > 0) {
    items.push({
      id: 'live-pg', emoji: '🏡', label: 'PG Listings',
      count: `${pgCount} new today`, dest: 'pgs', type: 'page',
    });
  }
  if (eventCount > 0) {
    items.push({
      id: 'live-events', emoji: '🎉', label: 'Events',
      count: `${eventCount} upcoming`, dest: 'events', type: 'page',
    });
  }

  // Merge with statics — deduplicate by id
  const merged = [...items, ...STATIC_ITEMS];
  const seen = new Set();
  return merged.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// ─── Navigation helper ────────────────────────────────────────────────────────
function navigateTo(item, onNavigate, onJoinChat) {
  if (!item) return;
  if (item.type === 'chat')       { onJoinChat?.(); return; }
  if (item.type === 'discussion') { onNavigate?.('discussion', item.dest); return; }
  onNavigate?.(item.dest);
}

// ─── Single floating pill ─────────────────────────────────────────────────────
function LivePill({ item, onNavigate, onJoinChat }) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.button
      onTapStart={() => setPressed(true)}
      onTap={() => { setPressed(false); navigateTo(item, onNavigate, onJoinChat); }}
      onTapCancel={() => setPressed(false)}
      onClick={() => navigateTo(item, onNavigate, onJoinChat)}
      animate={{ scale: pressed ? 0.95 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '0 14px 0 10px',
        height: 40,
        borderRadius: 999,
        // Transparent purple glass — LocalNest identity
        background: 'linear-gradient(135deg, rgba(109,74,255,0.13) 0%, rgba(155,106,255,0.10) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(109,74,255,0.22)',
        boxShadow: '0 2px 12px rgba(109,74,255,0.12), inset 0 1px 0 rgba(255,255,255,0.35)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle inner shimmer stripe */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
        pointerEvents: 'none',
        borderRadius: 999,
      }} />

      {/* LIVE dot */}
      <div style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: '#EF4444',
        boxShadow: '0 0 0 2px rgba(239,68,68,0.25)',
        animation: 'livePulse 1.8s ease-in-out infinite',
        position: 'relative', zIndex: 1,
      }} />

      {/* Emoji */}
      <span style={{ fontSize: 15, lineHeight: 1, position: 'relative', zIndex: 1 }}>{item.emoji}</span>

      {/* Label */}
      <span style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#3B1FA8',
        letterSpacing: -0.2,
        position: 'relative', zIndex: 1,
        fontFamily: 'var(--font-display, inherit)',
      }}>
        {item.label}
      </span>

      {/* Count badge — same style as Twitter's "+105 watching" chip */}
      {item.count && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 9px',
          borderRadius: 999,
          background: 'rgba(109,74,255,0.18)',
          border: '1px solid rgba(109,74,255,0.20)',
          fontSize: 11,
          fontWeight: 700,
          color: '#6D4AFF',
          letterSpacing: 0,
          position: 'relative', zIndex: 1,
          whiteSpace: 'nowrap',
        }}>
          {item.count}
        </span>
      )}
    </motion.button>
  );
}

// ─── Reduced-motion variant: auto-advance one pill at a time ──────────────────
function PillSlide({ items, onNavigate, onJoinChat }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div style={{ padding: '10px 14px', display: 'flex', gap: 8, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28 }}
        >
          <LivePill item={items[idx % items.length]} onNavigate={onNavigate} onJoinChat={onJoinChat} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LiveNowTicker({
  discussions = [],
  onlineCount = 0,
  rideCount = 0,
  pgCount = 0,
  eventCount = 0,
  onNavigate,
  onJoinChat,
}) {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const items = useMemo(
    () => buildItems({ discussions, onlineCount, rideCount, pgCount, eventCount }),
    // eslint-disable-next-line
    [discussions.length, onlineCount, rideCount, pgCount, eventCount]
  );

  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);

  const pause = useCallback(() => {
    setPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 2000);
  }, []);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  if (prefersReduced) {
    return <PillSlide items={items} onNavigate={onNavigate} onJoinChat={onJoinChat} />;
  }

  return (
    <div
      style={{ padding: '10px 0 10px 14px', flexShrink: 0, overflow: 'hidden' }}
      onMouseEnter={pause}
      onMouseLeave={() => { clearTimeout(resumeTimer.current); setPaused(false); }}
      onTouchStart={pause}
    >
      <style>{`
        @keyframes pillScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pill-track {
          animation: pillScroll 32s linear infinite;
          will-change: transform;
        }
        .pill-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* Scrolling pill row */}
      <div
        className={`pill-track${paused ? ' paused' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 'max-content',
        }}
      >
        {/* Doubled for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <LivePill
            key={`${item.id}-${i}`}
            item={item}
            onNavigate={onNavigate}
            onJoinChat={onJoinChat}
          />
        ))}
      </div>
    </div>
  );
}
