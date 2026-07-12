/**
 * HeroIllustration.jsx
 * Full-width illustrated neighbourhood panorama used as the hero
 * background, plus the real-time sun/moon-arc overlay. Day and night are
 * both handled: outside 6 AM–6 PM the sky swaps to a night gradient with
 * stars and a moon tracking its own arc (18:00 → 00:00 → 06:00), instead
 * of leaving the daytime sun/sky rendered while it's actually night.
 *
 * The time-tracking itself lives in `useCelestialPosition` (hooks/) on
 * purpose — kept separate from this illustration so it can be reused
 * unchanged if/when the hero background is swapped for different art.
 */
import styles from './HeroIllustration.module.css';
import { useCelestialPosition } from '../../../hooks/useCelestialPosition';

const VB_W = 390;
const VB_H = 300;

// Day arc: 6 AM (bottom-left) → 12 PM (top-centre) → 6 PM (bottom-right).
const DAY_ARC = {
  p0: { x: 26, y: 118 },
  p1: { x: 195, y: 34 },
  p2: { x: 364, y: 118 },
};
// Night arc: 6 PM → 12 AM → 6 AM. Slightly lower peak — a quieter, dimmer
// path than the sun's, per the moon reading as calmer/smaller in the sky.
const NIGHT_ARC = {
  p0: { x: 26, y: 128 },
  p1: { x: 195, y: 52 },
  p2: { x: 364, y: 128 },
};

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="9" ry="3" fill="rgba(0,0,0,0.10)" />
      <rect x="-1.5" y="-8" width="3" height="10" fill="#7A5A3A" />
      <circle cx="0" cy="-14" r="9" fill="#7BAE7F" />
      <circle cx="-5" cy="-10" r="6.5" fill="#8FC290" />
      <circle cx="5" cy="-10" r="6.5" fill="#6F9F73" />
    </g>
  );
}

function Building({ x, y, w, h, base, roof, windowColor, litRatio = 0.66 }) {
  const cols = Math.max(2, Math.floor(w / 14));
  const rows = Math.max(2, Math.floor(h / 16));
  const windows = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = 5 + c * (w - 10) / cols;
      const wy = 8 + r * (h - 16) / rows;
      const seed = (r * 7 + c * 13) % 10;
      const lit = seed / 10 < litRatio;
      windows.push(
        <rect key={`${r}-${c}`} x={wx} y={wy} width={(w - 10) / cols - 3} height={(h - 16) / rows - 4}
          rx="1" fill={lit ? windowColor : 'rgba(255,255,255,0.14)'} />
      );
    }
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} fill={base} rx="2" />
      <polygon points={`-2,0 ${w / 2},-14 ${w + 2},0`} fill={roof} />
      {windows}
    </g>
  );
}

function Person({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.85">
      <circle cx="0" cy="0" r="2" fill="#3A2E52" />
      <rect x="-1.6" y="2" width="3.2" height="6" rx="1.4" fill="#6D4AFF" />
    </g>
  );
}

function Stars() {
  const pts = [
    [30, 22], [60, 40], [95, 18], [140, 30], [175, 16], [225, 26],
    [265, 18], [300, 34], [335, 22], [360, 44], [20, 60], [110, 50],
    [200, 52], [280, 58], [350, 66], [70, 70], [160, 68],
  ];
  return (
    <g>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="#FFFFFF" opacity={i % 2 === 0 ? 0.9 : 0.55} />
      ))}
    </g>
  );
}

export default function HeroIllustration() {
  const celestial = useCelestialPosition(DAY_ARC, NIGHT_ARC);
  const { isDay } = celestial;
  const arc = isDay ? DAY_ARC : NIGHT_ARC;
  const labels = isDay ? ['6 AM', '12 PM', '6 PM'] : ['6 PM', '12 AM', '6 AM'];
  const litRatio = isDay ? 0.66 : 0.85;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label={isDay ? 'Illustration of the neighbourhood in daylight' : 'Illustration of the neighbourhood at night'}
    >
      <defs>
        <linearGradient id="skyGradDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B8AD1" />
          <stop offset="45%" stopColor="#C9A6C9" />
          <stop offset="75%" stopColor="#F2B78C" />
          <stop offset="100%" stopColor="#FBDDA6" />
        </linearGradient>
        <linearGradient id="skyGradNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E0B26" />
          <stop offset="45%" stopColor="#251B49" />
          <stop offset="78%" stopColor="#3B2A63" />
          <stop offset="100%" stopColor="#4E3A78" />
        </linearGradient>
        <linearGradient id="lakeGradDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6D9A8" />
          <stop offset="100%" stopColor="#C9B7E8" />
        </linearGradient>
        <linearGradient id="lakeGradNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#453769" />
          <stop offset="100%" stopColor="#2B2350" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6DC" stopOpacity="1" />
          <stop offset="45%" stopColor="#FFE29A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFE29A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9E7FF" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#B9AEEA" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#B9AEEA" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width={VB_W} height={VB_H} fill={isDay ? 'url(#skyGradDay)' : 'url(#skyGradNight)'} />
      {!isDay && <Stars />}

      {/* Birds (day only — night skips these for roosting realism) */}
      {isDay && (
        <g stroke="rgba(60,40,70,0.35)" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M40 55 q5 -6 10 0 q5 -6 10 0" />
          <path d="M330 40 q4 -5 8 0 q4 -5 8 0" />
          <path d="M290 70 q4 -5 8 0 q4 -5 8 0" />
        </g>
      )}

      {/* Skyline background buildings */}
      <g opacity="0.55">
        <Building x={0}   y={150} w={40} h={70} base="#8E7FBE" roof="#7A6DAE" windowColor="#FDE9B8" litRatio={litRatio} />
        <Building x={350} y={140} w={40} h={80} base="#8E7FBE" roof="#7A6DAE" windowColor="#FDE9B8" litRatio={litRatio} />
      </g>

      {/* Left residential blocks + Cafe Nest */}
      <g>
        <Building x={4}   y={168} w={54} h={62} base="#B98F72" roof="#9C7359" windowColor="#FFE7A8" litRatio={litRatio} />
        <Building x={60}  y={150} w={46} h={80} base="#C79B6E" roof="#A87C50" windowColor="#FFE7A8" litRatio={litRatio} />
        <g transform="translate(0 202)">
          <rect x="2" y="0" width="80" height="30" rx="3" fill="#7A4B36" />
          <rect x="8" y="6" width="20" height="14" rx="1.5" fill="#FDE9B8" />
          <rect x="34" y="6" width="20" height="14" rx="1.5" fill="#FDE9B8" />
          <rect x="60" y="10" width="16" height="20" rx="1.5" fill="#5B3624" />
          <rect x="-2" y="-9" width="88" height="10" rx="4" fill="#EADFC8" />
          <text x="40" y="-2" textAnchor="middle" fontSize="6.2" fontWeight="800" letterSpacing="0.6" fill="#5B3624" fontFamily="var(--font-sans, sans-serif)">CAFE NEST</text>
        </g>
      </g>

      {/* Right residential blocks + Community Hub */}
      <g>
        <Building x={332} y={160} w={54} h={70} base="#B98F72" roof="#9C7359" windowColor="#FFE7A8" litRatio={litRatio} />
        <Building x={284} y={144} w={46} h={86} base="#C79B6E" roof="#A87C50" windowColor="#FFE7A8" litRatio={litRatio} />
        <g transform="translate(226 196)">
          <rect x="0" y="0" width="92" height="36" rx="3" fill="#6D4AFF" />
          <rect x="8" y="8" width="18" height="16" rx="1.5" fill="#FDE9B8" />
          <rect x="32" y="8" width="18" height="16" rx="1.5" fill="#FDE9B8" />
          <rect x="56" y="8" width="18" height="16" rx="1.5" fill="#FDE9B8" />
          <rect x="-4" y="-9" width="100" height="10" rx="4" fill="#EFE8FF" />
          <text x="46" y="-2" textAnchor="middle" fontSize="6" fontWeight="800" letterSpacing="0.4" fill="#4A2FCC" fontFamily="var(--font-sans, sans-serif)">COMMUNITY HUB</text>
        </g>
      </g>

      {/* Park ground */}
      <path d="M0 232 Q195 208 390 232 L390 300 L0 300 Z" fill={isDay ? '#BFE0B8' : '#374A3C'} />

      {/* Lake */}
      <ellipse cx="195" cy="252" rx="72" ry="18" fill={isDay ? 'url(#lakeGradDay)' : 'url(#lakeGradNight)'} opacity="0.85" />

      {/* Paths */}
      <path d="M40 300 Q120 250 195 250 Q270 250 350 300" fill="none" stroke={isDay ? '#F0DDB9' : '#4A3E68'} strokeWidth="10" opacity="0.7" />

      {/* Trees */}
      <Tree x={110} y={270} s={0.9} />
      <Tree x={140} y={288} s={1.1} />
      <Tree x={250} y={286} s={1.1} />
      <Tree x={278} y={268} s={0.85} />
      <Tree x={95}  y={296} s={1.0} />
      <Tree x={296} y={296} s={1.0} />

      {/* People on the path (day only) */}
      {isDay && (
        <>
          <Person x={150} y={278} />
          <Person x={230} y={282} />
          <Person x={190} y={266} />
        </>
      )}

      {/* ── Sun/moon-arc overlay ── */}
      <g opacity="0.9">
        <path
          d={`M ${arc.p0.x} ${arc.p0.y} Q ${arc.p1.x} ${arc.p1.y} ${arc.p2.x} ${arc.p2.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.4"
          strokeDasharray="4 5"
          strokeLinecap="round"
        />
        <text x={arc.p0.x} y={arc.p0.y + 16} textAnchor="middle" fontSize="8" fontWeight="600" fill="#ffffff" fontFamily="var(--font-sans, sans-serif)">{labels[0]}</text>
        <text x={arc.p1.x} y={arc.p1.y - 8} textAnchor="middle" fontSize="8" fontWeight="600" fill="#ffffff" fontFamily="var(--font-sans, sans-serif)">{labels[1]}</text>
        <text x={arc.p2.x} y={arc.p2.y + 16} textAnchor="middle" fontSize="8" fontWeight="600" fill="#ffffff" fontFamily="var(--font-sans, sans-serif)">{labels[2]}</text>
      </g>

      {/* Current-time sun or moon marker */}
      <g style={{ transition: 'transform 400ms ease-out' }} transform={`translate(${celestial.x} ${celestial.y})`}>
        {isDay ? (
          <>
            <circle r="16" fill="url(#sunGlow)" />
            <circle r="6" fill="#FFF8E7" stroke="#FFD873" strokeWidth="1.2" />
          </>
        ) : (
          <>
            <circle r="14" fill="url(#moonGlow)" />
            <circle r="5.5" fill="#F1EEFF" />
            <circle r="5.5" fill="none" stroke="#D9D2F7" strokeWidth="0.6" />
            <circle cx="-1.6" cy="-1.2" r="1" fill="#D9D2F7" opacity="0.6" />
            <circle cx="1.4" cy="1.6" r="0.7" fill="#D9D2F7" opacity="0.5" />
          </>
        )}
      </g>
    </svg>
  );
}
