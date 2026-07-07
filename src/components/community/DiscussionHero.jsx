/**
 * DiscussionHero.jsx — Reusable Discussion Room hero section
 *
 * Receives a `themeKey` (community_channel slug) and a `discussion` object.
 * Renders the complete hero — background gradient, ambient glow, particles,
 * SVG illustration, feature card, top-row nav, stats row, and action pills —
 * purely from the theme config. Zero hardcoded channel logic lives here.
 *
 * To add a new discussion type:
 *   1. Add SVG to src/assets/discussionThemes/
 *   2. Add one object in src/config/discussionThemes.js
 *   → This file needs zero changes.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDiscussionTheme } from '../../config/discussionThemes';
import AnimatedNumber from './AnimatedNumber';
import SportIcon from './SportIcon';
import { CHANNEL_EMOJI } from './constants';

// ─── Particle layer ────────────────────────────────────────────────────────
// Renders N small decorative dots at deterministic positions (no random on
// re-render) so the hero stays stable without needing useMemo tricks.
function ParticleLayer({ color, count }) {
  const dots = useMemo(() => {
    const positions = [
      { x: '8%',  y: '18%', r: 3   },
      { x: '88%', y: '12%', r: 2   },
      { x: '5%',  y: '58%', r: 2.5 },
      { x: '92%', y: '55%', r: 3   },
      { x: '18%', y: '82%', r: 2   },
      { x: '78%', y: '80%', r: 2.5 },
      { x: '50%', y: '8%',  r: 1.5 },
    ];
    return positions.slice(0, count);
  }, [count]);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} opacity="0.55" />
      ))}
    </svg>
  );
}

// ─── Illustration renderer ─────────────────────────────────────────────────
// Handles both imported SVG URLs and raw inline SVG markup.
function Illustration({ theme }) {
  const { illustration, illustrationInlineSvg, accentColor, glowColor } = theme;

  const wrapStyle = {
    width: 148,
    height: 148,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const glowStyle = {
    position: 'absolute',
    inset: -16,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
    pointerEvents: 'none',
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: `drop-shadow(0 12px 24px ${accentColor}55)`,
    display: 'block',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      style={wrapStyle}
    >
      <div style={glowStyle} />

      {illustrationInlineSvg ? (
        /* Inline SVG — rendered via dangerouslySetInnerHTML so gradients/filters
           inside the SVG resolve correctly without a separate HTTP request.     */
        <div
          style={imgStyle}
          dangerouslySetInnerHTML={{ __html: illustrationInlineSvg }}
          aria-hidden="true"
        />
      ) : illustration ? (
        /* Imported SVG URL — treated as an <img> for simplicity; Vite resolves
           the file URL at build time.                                           */
        <img
          src={illustration}
          alt=""
          aria-hidden="true"
          style={imgStyle}
          loading="eager"
          draggable="false"
        />
      ) : null}
    </motion.div>
  );
}

// ─── Feature card ──────────────────────────────────────────────────────────
function FeatureCard({ theme, discussion }) {
  const { cardAccent, featureCard: defaults } = theme;

  // Prefer real discussion data; fall back to theme defaults.
  const label    = defaults.label;
  const title    = discussion?.title || defaults.title;
  const subtitle = discussion?.description || defaults.subtitle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: '11px 14px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        background: cardAccent,
        borderRadius: '18px 0 0 18px',
      }} />

      <div style={{ paddingLeft: 6, flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: cardAccent,
          fontFamily: 'var(--font-sans)',
          letterSpacing: 0.3,
          marginBottom: 2,
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11.5,
          fontWeight: 500,
          color: '#6B7280',
          fontFamily: 'var(--font-sans)',
          marginBottom: 1,
        }}>
          We&apos;re talking about
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#111827',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </div>
      </div>

      {/* Star accent */}
      <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
        ⭐
      </div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function DiscussionHero({
  discussion,
  themeKey,
  onlineCount   = 0,
  readingCount  = 0,
  typingCount   = 0,
  pills         = [],
  onBack,
  onLeave,
}) {
  const theme = getDiscussionTheme(themeKey);
  const isSports = themeKey === 'sports';

  return (
    <div
      style={{
        background: theme.bgGradient,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Layer 1: ambient glow blob ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -60,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: theme.glowColor,
          filter: 'blur(38px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -30,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: theme.glowColor,
          filter: 'blur(30px)',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* ── Layer 2: particles ── */}
      {theme.particles && (
        <ParticleLayer color={theme.particles.color} count={theme.particles.count} />
      )}

      {/* ── Layer 3: content ── */}
      <div style={{ position: 'relative', padding: '14px 14px 0' }}>

        {/* TOP ROW — Back | Icon + Title | Leave */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Back button */}
          <button
            onClick={onBack}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Channel icon badge */}
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px -3px rgba(0,0,0,0.25)',
          }}>
            {isSports
              ? <SportIcon category={discussion?.category} size={24} />
              : <span style={{ fontSize: 18 }}>{CHANNEL_EMOJI[themeKey] || '🗨️'}</span>
            }
          </div>

          {/* Room title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 16.5, fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-display)',
              textShadow: '0 1px 8px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {discussion?.title || theme.displayName}
            </div>
          </div>

          {/* Leave button */}
          <button
            onClick={onLeave}
            style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 999, padding: '7px 13px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Leave
          </button>
        </div>

        {/* SECOND ROW — stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginTop: 8, marginLeft: 50,
        }}>
          <span style={{
            fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-sans)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ADE80',
              display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite',
            }} />
            <AnimatedNumber value={onlineCount} /> Online
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
            👀 {readingCount} Reading
          </span>
          {typingCount > 0 && (
            <span style={{
              fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500,
              animation: 'typingPulse 1.4s ease-in-out infinite',
              fontFamily: 'var(--font-sans)',
            }}>
              ✍️ {typingCount} Typing
            </span>
          )}
        </div>

        {/* THIRD ROW — action pills */}
        {pills.length > 0 && (
          <div style={{
            display: 'flex', gap: 8, marginTop: 10, marginLeft: 50, flexWrap: 'wrap',
          }}>
            {pills.map(p => (
              <button
                key={p.label}
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: 999, padding: '6px 12px',
                  fontSize: 12, fontWeight: 500, color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.26)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
              >
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>
        )}

        {/* ILLUSTRATION — centrepiece SVG */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 18,
          marginBottom: 0,
        }}>
          <Illustration theme={theme} />
        </div>
      </div>

      {/* FEATURE CARD — floats over the bottom edge, overlapping chat */}
      <div style={{ padding: '0 14px', marginTop: -18, paddingBottom: 18 }}>
        <FeatureCard theme={theme} discussion={discussion} />
      </div>
    </div>
  );
}
