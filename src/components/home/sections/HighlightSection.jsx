/**
 * HighlightSection.jsx (home/sections)
 * ---------------------------------------------------------------------
 * "Highlight" — a 5-card spotlight reel on Home, one card per genre
 * (Movies / Cafe / Sports / Deals / Nightlife). Reads ONLY
 * home_highlights (services/homeHighlights.js) — never businesses,
 * offers, curated_picks, or feed_items directly; that guardrail matches
 * every other Home section (see NeighbourhoodPicksSection, LetsPlay).
 *
 * Carousel behaviour (matches Explore.jsx's "Must Try" InfiniteCarousel):
 *  - The active card keeps its exact width/height — only the track
 *    position changes, so the card itself is never resized.
 *  - The list is tripled ([...items, ...items, ...items]) and the
 *    track is centered with side padding of calc(50% - cardWidth/2),
 *    so the previous and next card peek in from the edges instead of
 *    leaving empty space either side.
 *  - Auto-advances one card every 2.5s, sliding left, looping forever
 *    (re-centers into the middle copy once each spring settles, so the
 *    loop never visibly jumps).
 *  - Manual drag also works: dragging resets to the nearest neighbour
 *    and restarts the autoplay clock.
 *  - Tapping a peeking side card brings it to center; tapping the
 *    centered card navigates (only Cafe currently has a nav_target).
 *  - Dots + the plain-text description panel below stay synced to the
 *    centered card, same as before.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import HighlightCard from '../shared/HighlightCard';
import FeedSkeleton from '../shared/FeedSkeleton';
import FeedErrorState from '../shared/FeedErrorState';
import { fetchHomeHighlights } from '../../../services/homeHighlights';
import { logEvent } from '../../../services/userEvents';
import { useAuth } from '../../../context/AuthContext';

const AUTO_SLIDE_MS = 2500;
const CARD_GAP = 22; // widened so even the active card's small contained shadow has room to fade before reaching its neighbour
const CARD_WIDTH = Math.min(0.78 * (typeof window !== 'undefined' ? window.innerWidth : 390), 320);
const STEP = CARD_WIDTH + CARD_GAP;

export default function HighlightSection({ onNavigate }) {
  const { profile } = useAuth();
  const locality = profile?.locality || null;

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [items, setItems] = useState([]);
  const [trackIndex, setTrackIndex] = useState(0); // position within the tripled array

  const x = useMotionValue(0);
  const autoplayRef = useRef(null);
  const N = items.length;

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await fetchHomeHighlights({ locality });
      setItems(data);
      setStatus(data.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.error('[HighlightSection] failed to load highlights:', err);
      setStatus('error');
    }
  }, [locality]);

  useEffect(() => { load(); }, [load]);

  // Once data arrives, start centered on the first real item inside the
  // MIDDLE copy of the tripled array, so both neighbours peek in from
  // the very first render (no empty edges).
  useEffect(() => {
    if (N > 0) {
      setTrackIndex(N);
      x.set(-N * STEP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  // Animate the track to the new position, then silently re-centre back
  // into the middle copy once the spring settles — this is what makes
  // the loop infinite in both directions without a visible jump.
  useEffect(() => {
    if (N === 0) return undefined;
    const controls = animate(x, -trackIndex * STEP, { type: 'spring', damping: 30, stiffness: 260 });
    controls.then(() => {
      setTrackIndex((cur) => {
        if (cur < N * 0.5) { const next = cur + N; x.set(-next * STEP); return next; }
        if (cur >= N * 2.5) { const next = cur - N; x.set(-next * STEP); return next; }
        return cur;
      });
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex, N]);

  // Autoplay — one card every 2.5s, restarts whenever trackIndex changes
  // (including manual drags) so it never fights the person's gesture.
  useEffect(() => {
    if (status !== 'success' || N <= 1) return undefined;
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => setTrackIndex((i) => i + 1), AUTO_SLIDE_MS);
    return () => clearInterval(autoplayRef.current);
  }, [status, N, trackIndex]);

  const activeIndex = N ? ((trackIndex % N) + N) % N : 0;
  const active = items[activeIndex];

  // Phase 0 behaviour logging — see LocalNest Phase 0 brief. Fires once
  // per distinct centered card, not once per animation tick.
  useEffect(() => {
    if (!active) return;
    logEvent({ eventName: 'highlight.view', screen: 'home', module: 'highlight', objectType: 'highlight', objectId: active.id, metadata: { genre: active.genre } });
  }, [active?.id]);

  const handleOpen = useCallback((item) => {
    if (!item.isClickable) return;
    logEvent({ eventName: 'highlight.tap', screen: 'home', module: 'highlight', objectType: 'highlight', objectId: item.id, metadata: { genre: item.genre, nav_target: item.navTarget } });
    onNavigate?.(item.navTarget, item.navParams);
  }, [onNavigate]);

  const handleCardTap = useCallback((tripledIdx, item) => {
    if (tripledIdx === trackIndex) {
      handleOpen(item);
    } else {
      setTrackIndex(tripledIdx); // bring the tapped side card to center
    }
  }, [trackIndex, handleOpen]);

  const handleDragEnd = (_, info) => {
    if (N <= 1) return;
    const delta = info.offset.x;
    if (Math.abs(delta) < 40) return;
    setTrackIndex((i) => (delta < 0 ? i + 1 : i - 1));
  };

  const goToDot = (i) => {
    setTrackIndex((cur) => {
      const curActive = ((cur % N) + N) % N;
      return cur + (i - curActive);
    });
  };

  const tripled = N ? [...items, ...items, ...items] : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 32 }}
    >
      <SectionHeader title="Highlight" subtitle="Spotlight of the day, around you." />

      {status === 'loading' && <FeedSkeleton count={1} cardWidth={CARD_WIDTH} />}

      {status === 'error' && <FeedErrorState onRetry={load} />}

      {status === 'success' && (
        <>
          {/* paddingTop gives the active card's -6px lift room to render
              without overflow:hidden clipping its top edge off */}
          <div style={{ overflow: 'hidden', width: '100%', background: '#ffffff', paddingTop: 10 }}>
            <motion.div
              drag="x"
              dragMomentum={false}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                gap: CARD_GAP,
                paddingLeft: `calc(50% - ${CARD_WIDTH / 2}px)`,
                paddingRight: `calc(50% - ${CARD_WIDTH / 2}px)`,
                x,
                cursor: 'grab',
                touchAction: 'pan-y',
              }}
            >
              {tripled.map((item, idx) => {
                const isActive = idx === trackIndex;
                return (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    onClick={() => handleCardTap(idx, item)}
                    animate={{ scale: isActive ? 1 : 0.88, y: isActive ? -6 : 0, opacity: isActive ? 1 : 1, filter: isActive ? 'blur(0px)' : 'blur(2px)' }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                  >
                    <HighlightCard item={item} width={CARD_WIDTH} lifted={isActive} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => goToDot(i)}
                aria-label={`Show ${it.genre} highlight`}
                style={{
                  position: 'relative',
                  width: i === activeIndex ? 28 : 6, height: 6, borderRadius: 99, border: 'none', padding: 0,
                  overflow: 'hidden',
                  background: 'rgba(109,74,255,0.22)',
                  transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1)', cursor: 'pointer',
                }}
              >
                {i === activeIndex && (
                  <motion.div
                    key={trackIndex}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTO_SLIDE_MS / 1000, ease: 'linear' }}
                    style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#6D4AFF', borderRadius: 99 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Plain-text description — no container, no pill, no rating/location. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: '14px 24px 0', textAlign: 'center' }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0D0820', lineHeight: 1.3 }}>
                {active.title}
              </div>
              {active.description && (
                <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>
                  {active.description}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
}
