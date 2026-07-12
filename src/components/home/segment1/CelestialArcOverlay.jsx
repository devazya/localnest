/**
 * CelestialArcOverlay.jsx
 * Renders only the moving sun or moon marker — no arc path, no time labels.
 *
 * Sun now has a multi-layered atmospheric bloom (3 concentric glow rings)
 * so it reads as a real light source rather than a coloured dot, matching
 * the reference design where the sun bleeds warmly into the sky around it.
 *
 * Moon shows its actual current phase via an SVG clip-path technique:
 * a lit hemisphere is partially hidden by an offset dark circle whose
 * x-position encodes the terminator, giving accurate crescent / gibbous /
 * full shapes from the real calendar date.
 */
import styles from './HeroIllustration.module.css';
import { useCelestialPosition } from '../../../hooks/useCelestialPosition';

const VB_W = 390;
const VB_H = 300;

const DAY_ARC = {
  p0: { x: 26,  y: 118 },
  p1: { x: 195, y: 34  },
  p2: { x: 364, y: 118 },
};
const NIGHT_ARC = {
  p0: { x: 26,  y: 128 },
  p1: { x: 195, y: 52  },
  p2: { x: 364, y: 128 },
};

// ── Sun colour palette based on time of day ───────────────────────────────
// Returns { core, mid, outer, outerFar } — colours for 4 glow layers
function getSunPalette(hour) {
  if ((hour >= 5 && hour < 8) || (hour >= 17 && hour < 20)) {
    // Sunrise / sunset — deep orange bloom
    return { core: '#FFFFFF', mid: '#FFD04A', outer: '#FF7A00', outerFar: '#FF4500' };
  }
  if ((hour >= 8 && hour < 10) || (hour >= 15 && hour < 17)) {
    // Morning / late afternoon — warm amber-yellow
    return { core: '#FFFFFF', mid: '#FFE87A', outer: '#FFB800', outerFar: '#FF8C00' };
  }
  // Midday — bright white-yellow, smaller visible bloom
  return { core: '#FFFFFF', mid: '#FFF8DC', outer: '#FFE060', outerFar: '#FFD020' };
}

// ── Lunar phase ───────────────────────────────────────────────────────────
function getLunarPhase() {
  const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
  const LUNAR_CYCLE_MS = 29.53058867 * 24 * 60 * 60 * 1000;
  const age = ((Date.now() - REF_NEW_MOON) % LUNAR_CYCLE_MS + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS;
  return age / LUNAR_CYCLE_MS; // 0 = new moon, 0.5 = full moon
}

// ── Moon shape drawn with clip-path terminator technique ──────────────────
function MoonShape({ phase, r = 6 }) {
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const isWaxing = phase < 0.5;
  const clipId = 'moonPhaseClip';

  if (illumination < 0.04) {
    // New moon — near-invisible, just a faint outline
    return (
      <g>
        <circle r={r} fill="#12103A" />
        <circle r={r} fill="none" stroke="#3A3560" strokeWidth="0.8" />
      </g>
    );
  }

  if (illumination > 0.96) {
    // Full moon
    return (
      <g>
        <circle r={r} fill="#F0ECFF" />
        <circle cx="-2" cy="-1.5" r="1.1" fill="#C8C0EE" opacity="0.5" />
        <circle cx="1.6" cy="1.8" r="0.8" fill="#C8C0EE" opacity="0.4" />
        <circle cx="0.5" cy="-0.3" r="0.5" fill="#C8C0EE" opacity="0.35" />
      </g>
    );
  }

  // The lit arc covers half the disc. The terminator circle overlaps from
  // the dark side, its cx shifting to reveal more or less of the lit half.
  // cx = 0 → exactly half lit (quarter moon). Moving away reveals more/less.
  const terminatorCx = (isWaxing ? -1 : 1) * r * (1 - illumination * 2);

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle r={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Full dark disc as base */}
        <circle r={r} fill="#12103A" />
        {/* Lit half — always on the correct waxing/waning side */}
        <circle
          cx={isWaxing ? r : -r}
          r={r}
          fill="#F0ECFF"
        />
        {/* Terminator: dark circle eats into the lit side to carve the crescent */}
        <circle
          cx={terminatorCx}
          r={r}
          fill="#12103A"
        />
        {/* Crater marks on the lit portion */}
        <circle
          cx={(isWaxing ? 1 : -1) * r * 0.3}
          cy="-1"
          r="0.7"
          fill="#C8C0EE"
          opacity="0.4"
        />
      </g>
    </g>
  );
}

// ── Sun — multi-layer atmospheric bloom ───────────────────────────────────
function SunBloom({ palette }) {
  return (
    <g>
      {/* Outermost haze — very large, very faint */}
      <radialGradient id="sunG4" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={palette.outerFar} stopOpacity="0.22" />
        <stop offset="100%" stopColor={palette.outerFar} stopOpacity="0" />
      </radialGradient>
      <circle r="54" fill="url(#sunG4)" />

      {/* Outer glow ring */}
      <radialGradient id="sunG3" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={palette.outer} stopOpacity="0.45" />
        <stop offset="100%" stopColor={palette.outer} stopOpacity="0" />
      </radialGradient>
      <circle r="34" fill="url(#sunG3)" />

      {/* Mid glow — warm colour halo */}
      <radialGradient id="sunG2" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={palette.mid} stopOpacity="0.75" />
        <stop offset="70%"  stopColor={palette.mid} stopOpacity="0.3" />
        <stop offset="100%" stopColor={palette.mid} stopOpacity="0" />
      </radialGradient>
      <circle r="18" fill="url(#sunG2)" />

      {/* Inner bright core */}
      <radialGradient id="sunG1" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={palette.core} stopOpacity="1" />
        <stop offset="60%"  stopColor={palette.mid}  stopOpacity="0.9" />
        <stop offset="100%" stopColor={palette.mid}  stopOpacity="0.6" />
      </radialGradient>
      <circle r="7.5" fill="url(#sunG1)" />
    </g>
  );
}

// ── Moon bloom ────────────────────────────────────────────────────────────
function MoonBloom({ phase }) {
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const glowOpacity = 0.2 + illumination * 0.5; // brighter glow near full moon
  return (
    <g>
      <radialGradient id="moonG2" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#D8D0FF" stopOpacity={glowOpacity} />
        <stop offset="100%" stopColor="#D8D0FF" stopOpacity="0" />
      </radialGradient>
      <circle r="28" fill="url(#moonG2)" />
      <radialGradient id="moonG1" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#EDE8FF" stopOpacity={Math.min(1, glowOpacity + 0.2)} />
        <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0" />
      </radialGradient>
      <circle r="14" fill="url(#moonG1)" />
      <MoonShape phase={phase} r={6} />
    </g>
  );
}

export default function CelestialArcOverlay() {
  const celestial = useCelestialPosition(DAY_ARC, NIGHT_ARC);
  const { isDay } = celestial;
  const hour = new Date().getHours();
  const sunPalette = getSunPalette(hour);
  const lunarPhase = getLunarPhase();

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs />
      <g
        style={{ transition: 'transform 500ms ease-out' }}
        transform={`translate(${celestial.x} ${celestial.y})`}
      >
        {isDay
          ? <SunBloom palette={sunPalette} />
          : <MoonBloom phase={lunarPhase} />
        }
      </g>
    </svg>
  );
}
