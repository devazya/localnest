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

// ─── Build pill list from live data ──────────────────────────────────────────
// Only real, currently-happening activity gets a pill: the Neighbourhood
// Chat (when someone's actually online in it) and individual discussions
// that currently have people chatting in them (memberCount > 0). No static
// shortcuts, no "discussing" label on rooms nobody is actually in.
function buildItems({ discussions, onlineCount, getMemberCount }) {
  const items = [];

  if (onlineCount > 0) {
    items.push({
      id: 'live-chat', emoji: '💬', label: 'Neighbourhood Chat',
      count: `${onlineCount} online`, dest: 'general-chat', type: 'chat',
    });
  }

  const activeDiscs = (discussions || []).filter(d => (getMemberCount?.(d.id) || 0) > 0);
  for (const d of activeDiscs) {
    const emoji = CHANNEL_EMOJI[d.community_channel] || '🗨️';
    const short = d.title.length > 22 ? d.title.slice(0, 22) + '…' : d.title;
    items.push({
      id: `disc-${d.id}`, emoji, label: short,
      count: 'discussing', dest: d.id, type: 'discussion',
    });
  }

  return items;
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
// GPU-composited auto-scroll: instead of animating the native `scrollLeft`
// (which forces a layout recalculation on every frame — the reason this used
// to feel laggy no matter the speed), the track is translated via CSS
// `transform: translateX()`, which the browser can composite purely on the
// GPU. That's what gets this to a genuinely smooth 60fps.
//
// Dragging is reimplemented on top of the same transform (pointer events +
// a ref-tracked offset) since the track is no longer a native scroll
// container. Interacting pauses the auto-driver immediately; it resumes 2s
// after release, continuing from wherever the user left it.
export default function LiveNowTicker({
  discussions = [],
  onlineCount = 0,
  getMemberCount,
  onNavigate,
  onJoinChat,
}) {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const items = useMemo(
    () => buildItems({ discussions, onlineCount, getMemberCount }),
    // eslint-disable-next-line
    [discussions, onlineCount, getMemberCount]
  );

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const resumeTimer = useRef(null);
  const [autoOn, setAutoOn] = useState(true);

  // Current scroll offset in px, kept in a ref (not React state) so every
  // frame's update is a direct DOM write, not a re-render.
  const posRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);

  // Pixels per second — frame-rate independent (uses real elapsed time,
  // not just a fixed increment per animation frame) so it scrolls at the
  // same smooth pace on every device regardless of refresh rate.
  const SPEED_PER_SECOND = 45;

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-posRef.current}px, 0, 0)`;
  }, []);

  const wrapPosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const singleWidth = track.scrollWidth / 2; // content is doubled
    if (singleWidth <= 0) return;
    if (posRef.current >= singleWidth) posRef.current -= singleWidth;
    else if (posRef.current < 0) posRef.current += singleWidth;
  }, []);

  // ─ rAF-driven auto-scroll (transform-based, GPU-composited) ─
  useEffect(() => {
    if (prefersReduced) return; // handled by PillSlide fallback instead
    let lastTime = null;
    const step = (time) => {
      if (lastTime == null) lastTime = time;
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.1); // clamp huge gaps (tab switches)
      lastTime = time;
      if (autoOn && !draggingRef.current) {
        posRef.current += SPEED_PER_SECOND * deltaSeconds;
        wrapPosition();
        applyTransform();
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoOn, prefersReduced, applyTransform, wrapPosition]);

  // ─ Pause on interaction, resume 2s after release ─
  const pauseAuto = useCallback(() => {
    setAutoOn(false);
    clearTimeout(resumeTimer.current);
  }, []);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setAutoOn(true), 2000);
  }, []);

  // ─ Manual drag, reimplemented on the transform offset ─
  const handlePointerDown = useCallback((e) => {
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
    pauseAuto();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, [pauseAuto]);

  const handlePointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const delta = dragStartXRef.current - e.clientX; // drag left → scroll forward
    posRef.current = dragStartPosRef.current + delta;
    wrapPosition();
    applyTransform();
  }, [applyTransform, wrapPosition]);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    scheduleResume();
  }, [scheduleResume]);

  const handleWheel = useCallback((e) => {
    posRef.current += e.deltaX || e.deltaY;
    wrapPosition();
    applyTransform();
    pauseAuto();
    scheduleResume();
  }, [applyTransform, wrapPosition, pauseAuto, scheduleResume]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  // No real activity right now — vanish entirely so the layout below
  // (Neighbourhood Chat card) shifts straight up with no empty gap.
  if (items.length === 0) return null;

  if (prefersReduced) {
    return <PillSlide items={items} onNavigate={onNavigate} onJoinChat={onJoinChat} />;
  }

  return (
    <div style={{ padding: '10px 0 10px 14px', flexShrink: 0 }}>
      <style>{`
        .pill-viewport {
          overflow: hidden;
          touch-action: pan-y;
          cursor: grab;
        }
        .pill-viewport:active { cursor: grabbing; }
        .pill-track {
          will-change: transform;
        }
      `}</style>

      <div
        ref={viewportRef}
        className="pill-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => { if (draggingRef.current) handlePointerUp(); }}
        onWheel={handleWheel}
      >
        <div ref={trackRef} className="pill-track" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'max-content' }}>
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
    </div>
  );
}
