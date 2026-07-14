/**
 * CelestialArcOverlay.jsx
 * Renders only the moving sun or moon marker — no arc path, no time labels.
 *
 * Sun has a multi-layered atmospheric bloom (3 concentric glow rings) so
 * it reads as a real light source rather than a coloured dot.
 *
 * Moon is a single closed crescent path (same construction as Lucide's
 * "moon" icon: an outer 270-degree arc plus a smaller inner arc) instead
 * of two overlapping same-radius circles. The overlapping-circle approach
 * looked phase-accurate in theory but rendered soft/blob-like at this
 * icon's tiny on-screen size (~16px) — the anti-aliased seam between the
 * lit and dark circles blurred into an indistinct shape instead of a
 * crisp "C". A single vector path has no such seam and stays sharp at
 * any size. This exact path construction was render-tested (rasterized
 * and visually verified) before shipping, in both the waxing and waning
 * orientation.
 *
 * IMPORTANT: mix-blend-mode:screen is applied only to the glow layers
 * (styles.glow), never to the whole SVG — screen-blending the whole tree
 * previously caused a compositing seam at the hero's clipped bottom edge.
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

function getSunPalette(hour) {
  if ((hour >= 5 && hour < 8) || (hour >= 17 && hour < 20)) {
    return { core: '#FFFFFF', mid: '#FFD04A', outer: '#FF7A00', outerFar: '#FF4500' };
  }
  if ((hour >= 8 && hour < 10) || (hour >= 15 && hour < 17)) {
    return { core: '#FFFFFF', mid: '#FFE87A', outer: '#FFB800', outerFar: '#FF8C00' };
  }
  return { core: '#FFFFFF', mid: '#FFF8DC', outer: '#FFE060', outerFar: '#FFD020' };
}

function getLunarPhase() {
  const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
  const LUNAR_CYCLE_MS = 29.53058867 * 24 * 60 * 60 * 1000;
  const age = ((Date.now() - REF_NEW_MOON) % LUNAR_CYCLE_MS + LUNAR_CYCLE_MS) % LUNAR_CYCLE_MS;
  return age / LUNAR_CYCLE_MS;
}

// Moon shape — single crescent path, always sharp. See file header for why.
function MoonShape({ phase, r = 8 }) {
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const isWaxing = phase < 0.5;

  if (illumination < 0.04) {
    // New moon — near invisible, just a faint outline
    return (
      <g shapeRendering="geometricPrecision">
        <circle r={r} fill="#12103A" />
        <circle r={r} fill="none" stroke="#4A4570" strokeWidth="0.6" />
      </g>
    );
  }

  // innerR shrinks toward 0 as illumination drops, carving progressively
  // more of the disc away — thin sliver near new moon, near-full disc
  // near full moon. Mirrored left/right for waxing vs waning.
  const innerR = Math.min(r * 0.97, r * (0.2 + illumination * 0.75));
  const d = isWaxing
    ? `M 0 ${-r} A ${innerR} ${innerR} 0 0 0 ${r} 0 A ${r} ${r} 0 1 1 0 ${-r} Z`
    : `M 0 ${-r} A ${innerR} ${innerR} 0 0 1 ${-r} 0 A ${r} ${r} 0 1 0 0 ${-r} Z`;

  return (
    <g shapeRendering="geometricPrecision">
      <path d={d} fill="#F5F2FF" stroke="#DCD4FF" strokeWidth="0.35" strokeLinejoin="round" />
    </g>
  );
}

// Sun — multi-layer atmospheric bloom
function SunBloom({ palette }) {
  return (
    <g>
      <g className={styles.glow}>
        <radialGradient id="sunG4" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={palette.outerFar} stopOpacity="0.22" />
          <stop offset="100%" stopColor={palette.outerFar} stopOpacity="0" />
        </radialGradient>
        <circle r="54" fill="url(#sunG4)" />

        <radialGradient id="sunG3" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={palette.outer} stopOpacity="0.45" />
          <stop offset="100%" stopColor={palette.outer} stopOpacity="0" />
        </radialGradient>
        <circle r="34" fill="url(#sunG3)" />

        <radialGradient id="sunG2" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={palette.mid} stopOpacity="0.75" />
          <stop offset="70%"  stopColor={palette.mid} stopOpacity="0.3" />
          <stop offset="100%" stopColor={palette.mid} stopOpacity="0" />
        </radialGradient>
        <circle r="18" fill="url(#sunG2)" />
      </g>

      <radialGradient id="sunG1" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={palette.core} stopOpacity="1" />
        <stop offset="60%"  stopColor={palette.mid}  stopOpacity="0.9" />
        <stop offset="100%" stopColor={palette.mid}  stopOpacity="0.6" />
      </radialGradient>
      <circle r="7.5" fill="url(#sunG1)" />
    </g>
  );
}

// Moon bloom
function MoonBloom({ phase }) {
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const glowOpacity = 0.2 + illumination * 0.5;
  return (
    <g>
      <g className={styles.glow}>
        <radialGradient id="moonG2" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#D8D0FF" stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor="#D8D0FF" stopOpacity="0" />
        </radialGradient>
        <circle r="24" fill="url(#moonG2)" />
        <radialGradient id="moonG1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#EDE8FF" stopOpacity={Math.min(1, glowOpacity + 0.2)} />
          <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0" />
        </radialGradient>
        <circle r="12" fill="url(#moonG1)" />
      </g>
      <MoonShape phase={phase} r={8} />
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
