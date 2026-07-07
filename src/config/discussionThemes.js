/**
 * discussionThemes.js — Central theme configuration for Discussion Rooms
 *
 * HOW TO ADD A NEW THEME:
 *   1. Drop your SVG into src/assets/discussionThemes/<theme>/yourfile.svg
 *   2. Import it at the top of this file
 *   3. Add one object to DISCUSSION_THEMES below
 *   4. Done — DiscussionHero.jsx picks it up automatically, zero other changes.
 *
 * SVG imports (existing assets)
 */
import foodSvg   from '../assets/discussionThemes/food.svg/gemini-svg (3).svg';
import gamingSvg from '../assets/discussionThemes/gaming.svg/gemini-svg (4).svg';
import musicSvg  from '../assets/discussionThemes/music.svg/gemini-svg.svg';
import studySvg  from '../assets/discussionThemes/study.svg/gemini-svg (1).svg';
import travelSvg from '../assets/discussionThemes/travel.svg/gemini-svg (2).svg';
import movieSceneSvg from '../assets/discussionThemes/movie.svg/movie.svg';

// ─── Inline SVGs for themes that don't have an asset file yet ────────────────
// Replace the `illustration` string with an import once you have the SVG file.

const MOVIE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="mv-bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#6B3EC8"/>
      <stop offset="100%" stop-color="#2D1060"/>
    </radialGradient>
    <radialGradient id="mv-spot" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="rgba(255,230,100,0.22)"/>
      <stop offset="100%" stop-color="rgba(255,230,100,0)"/>
    </radialGradient>
    <filter id="mv-glow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="mv-shadow"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#1a0050" flood-opacity="0.7"/></filter>
  </defs>
  <rect width="400" height="400" fill="url(#mv-bg)"/>
  <ellipse cx="200" cy="0" rx="160" ry="200" fill="url(#mv-spot)"/>
  <!-- Popcorn bucket -->
  <g transform="translate(200,200)" filter="url(#mv-shadow)">
    <!-- Bucket body -->
    <path d="M-68 -20 L-55 80 Q0 95 55 80 L68 -20 Z" fill="#E8192C"/>
    <path d="M-68 -20 L-55 80 Q0 95 55 80 L68 -20 Z" fill="none" stroke="#C0001F" stroke-width="1.5" opacity="0.5"/>
    <!-- Stripes -->
    <path d="M-22 -20 L-18 80 Q0 95 0 95 L0 -20 Z" fill="#ffffff" opacity="0.15"/>
    <path d="M22 -20 L18 80 Q0 95 0 95 L0 -20 Z" fill="#ffffff" opacity="0.08"/>
    <!-- Rim -->
    <ellipse cx="0" cy="-20" rx="68" ry="14" fill="#FF3A4D"/>
    <ellipse cx="0" cy="-20" rx="62" ry="10" fill="#E8192C"/>
    <!-- Popcorn pieces top row -->
    <ellipse cx="-40" cy="-42" rx="22" ry="18" fill="#FFEAB0" filter="url(#mv-glow)"/>
    <ellipse cx="0"   cy="-52" rx="24" ry="20" fill="#FFD97A" filter="url(#mv-glow)"/>
    <ellipse cx="40"  cy="-42" rx="22" ry="18" fill="#FFEAB0" filter="url(#mv-glow)"/>
    <!-- Popcorn pieces second row -->
    <ellipse cx="-58" cy="-32" rx="18" ry="15" fill="#FFE080"/>
    <ellipse cx="-20" cy="-60" rx="18" ry="15" fill="#FFCD5A"/>
    <ellipse cx="20"  cy="-62" rx="19" ry="16" fill="#FFD97A"/>
    <ellipse cx="58"  cy="-32" rx="18" ry="15" fill="#FFE080"/>
    <!-- Kernel details -->
    <ellipse cx="-40" cy="-44" rx="10" ry="7" fill="#FFF3CF" opacity="0.6"/>
    <ellipse cx="0"   cy="-54" rx="11" ry="8" fill="#FFF3CF" opacity="0.6"/>
    <ellipse cx="40"  cy="-44" rx="10" ry="7" fill="#FFF3CF" opacity="0.6"/>
  </g>
  <!-- Clapperboard -->
  <g transform="translate(295,100) rotate(18)" filter="url(#mv-shadow)">
    <rect x="-28" y="0" width="56" height="46" rx="5" fill="#1a1a2e"/>
    <rect x="-28" y="0" width="56" height="14" rx="5" fill="#2a2a3e"/>
    <!-- Clapperboard stripes -->
    <path d="M-22 0 L-15 14 L-7 14 L-14 0 Z" fill="#fff" opacity="0.9"/>
    <path d="M-3 0 L4 14 L12 14 L5 0 Z" fill="#fff" opacity="0.9"/>
    <path d="M16 0 L23 14 L28 14 L21 0 Z" fill="#fff" opacity="0.9"/>
    <!-- Lines on board -->
    <line x1="-22" y1="22" x2="22" y2="22" stroke="#3a3a5e" stroke-width="2"/>
    <line x1="-22" y1="30" x2="22" y2="30" stroke="#3a3a5e" stroke-width="2"/>
    <line x1="-22" y1="38" x2="22" y2="38" stroke="#3a3a5e" stroke-width="2"/>
  </g>
  <!-- Stars -->
  <g fill="#FFE97A" opacity="0.7">
    <circle cx="60" cy="70"   r="3"/>
    <circle cx="340" cy="90"  r="2"/>
    <circle cx="80" cy="150"  r="1.5"/>
    <circle cx="330" cy="170" r="2.5"/>
    <circle cx="50" cy="220"  r="2"/>
    <circle cx="350" cy="250" r="1.5"/>
  </g>
</svg>`;

const SPORTS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="sp-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF8C00"/>
      <stop offset="100%" stop-color="#C45200"/>
    </linearGradient>
    <filter id="sp-shadow"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#7a2e00" flood-opacity="0.6"/></filter>
    <filter id="sp-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="400" height="400" fill="url(#sp-bg)"/>
  <!-- Court lines (subtle) -->
  <g stroke="#ffffff" stroke-width="1.5" opacity="0.12" fill="none">
    <rect x="30" y="30" width="340" height="340" rx="4"/>
    <line x1="200" y1="30" x2="200" y2="370"/>
    <ellipse cx="200" cy="200" rx="50" ry="50"/>
  </g>
  <!-- Badminton shuttlecock -->
  <g transform="translate(200,185)" filter="url(#sp-shadow)">
    <!-- Cork base -->
    <ellipse cx="0" cy="60" rx="22" ry="18" fill="#F4D58D"/>
    <ellipse cx="0" cy="60" rx="18" ry="14" fill="#E8C26A"/>
    <ellipse cx="0" cy="58" rx="13" ry="10" fill="#DBA845"/>
    <!-- Rubber band -->
    <ellipse cx="0" cy="46" rx="20" ry="7" fill="#C8860C"/>
    <!-- Feather ring -->
    <ellipse cx="0" cy="40" rx="22" ry="8" fill="none" stroke="#8B5E00" stroke-width="2"/>
    <!-- Individual feathers -->
    <g fill="none" stroke-width="1.5">
      <path d="M0 40 Q-65 -40 -50 -110" stroke="#F0EBE0"/>
      <path d="M0 40 Q-45 -60 -20 -115" stroke="#F0EBE0"/>
      <path d="M0 40 Q-20 -70 10 -115"  stroke="#F0EBE0"/>
      <path d="M0 40 Q10 -72 40 -112"   stroke="#F0EBE0"/>
      <path d="M0 40 Q38 -62 62 -105"   stroke="#F0EBE0"/>
      <path d="M0 40 Q62 -44 78 -90"    stroke="#F0EBE0"/>
      <path d="M0 40 Q75 -20 82 -65"    stroke="#F0EBE0"/>
      <!-- Feather tips (white spread) -->
      <path d="M-50 -110 Q-40 -125 -20 -115" stroke="#E0D8C8" stroke-width="1"/>
      <path d="M-20 -115 Q-5 -128 10 -115"   stroke="#E0D8C8" stroke-width="1"/>
      <path d="M10 -115 Q28 -125 40 -112"    stroke="#E0D8C8" stroke-width="1"/>
      <path d="M40 -112 Q55 -120 62 -105"    stroke="#E0D8C8" stroke-width="1"/>
      <path d="M62 -105 Q75 -108 78 -90"     stroke="#E0D8C8" stroke-width="1"/>
    </g>
  </g>
  <!-- Accent dots -->
  <g fill="#FFD080" opacity="0.5">
    <circle cx="55"  cy="60"  r="5"/>
    <circle cx="345" cy="80"  r="4"/>
    <circle cx="40"  cy="300" r="6"/>
    <circle cx="360" cy="320" r="5"/>
  </g>
</svg>`;

const GENERAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="gen-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFC"/>
      <stop offset="100%" stop-color="#4B30B5"/>
    </linearGradient>
    <filter id="gen-shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#2510a0" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="400" height="400" fill="url(#gen-bg)"/>
  <!-- Three chat bubbles stacked -->
  <g transform="translate(200,200)" filter="url(#gen-shadow)">
    <!-- Bottom bubble (blue) -->
    <g transform="translate(30,60)">
      <rect x="-90" y="-28" width="130" height="56" rx="28" fill="#5B8DEF"/>
      <polygon points="-60,28 -38,28 -50,50" fill="#5B8DEF"/>
      <rect x="-76" y="-10" width="50" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
      <rect x="-76" y="4"  width="32" height="8" rx="4" fill="rgba(255,255,255,0.35)"/>
    </g>
    <!-- Middle bubble (pink) -->
    <g transform="translate(-25,0)">
      <rect x="-90" y="-28" width="150" height="56" rx="28" fill="#F472B6"/>
      <polygon points="40,28 60,28 48,50" fill="#F472B6"/>
      <rect x="-74" y="-10" width="70" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
      <rect x="-74" y="4"  width="45" height="8" rx="4" fill="rgba(255,255,255,0.35)"/>
    </g>
    <!-- Top bubble (white/purple) -->
    <g transform="translate(10,-65)">
      <rect x="-100" y="-28" width="160" height="56" rx="28" fill="#FFFFFF" opacity="0.92"/>
      <polygon points="-50,28 -30,28 -42,48" fill="#FFFFFF" opacity="0.92"/>
      <rect x="-82" y="-10" width="60" height="8" rx="4" fill="#7C5CFC" opacity="0.4"/>
      <rect x="-82" y="4"  width="40" height="8" rx="4" fill="#7C5CFC" opacity="0.25"/>
    </g>
  </g>
  <!-- Decorative dots -->
  <g fill="#BFA8FF" opacity="0.45">
    <circle cx="55"  cy="55"  r="6"/>
    <circle cx="345" cy="65"  r="4"/>
    <circle cx="48"  cy="340" r="5"/>
    <circle cx="360" cy="330" r="6"/>
    <circle cx="340" cy="200" r="3"/>
  </g>
</svg>`;

const COFFEE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cf-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4A96A"/>
      <stop offset="100%" stop-color="#8B5E2E"/>
    </linearGradient>
    <linearGradient id="cf-cup" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FAECD5"/>
      <stop offset="100%" stop-color="#EDD4A8"/>
    </linearGradient>
    <filter id="cf-shadow"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#4a2800" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="400" height="400" fill="url(#cf-bg)"/>
  <!-- Saucer -->
  <ellipse cx="200" cy="288" rx="100" ry="22" fill="#C48A3E" filter="url(#cf-shadow)"/>
  <ellipse cx="200" cy="282" rx="95"  ry="18" fill="#D4A056"/>
  <!-- Cup -->
  <g filter="url(#cf-shadow)">
    <path d="M130 200 Q128 280 145 290 Q200 300 255 290 Q272 280 270 200 Z" fill="url(#cf-cup)"/>
    <path d="M130 200 Q128 210 200 215 Q272 210 270 200 Z" fill="#F5E0BE"/>
    <!-- Cup handle -->
    <path d="M268 220 Q310 220 310 252 Q310 280 268 278" fill="none" stroke="url(#cf-cup)" stroke-width="16" stroke-linecap="round"/>
    <path d="M268 220 Q304 220 304 252 Q304 278 268 278" fill="none" stroke="#EDD4A8" stroke-width="8" stroke-linecap="round"/>
  </g>
  <!-- Coffee surface -->
  <ellipse cx="200" cy="200" rx="70" ry="16" fill="#6B3A1F"/>
  <!-- Latte art (heart) -->
  <g transform="translate(200,200)" fill="#C4854A" opacity="0.7">
    <path d="M0 8 Q-20 -12 -20 -20 A14 14 0 0 1 0 -8 A14 14 0 0 1 20 -20 Q20 -12 0 8 Z"/>
  </g>
  <!-- Steam wisps -->
  <g fill="none" stroke="#D4B896" stroke-width="3" stroke-linecap="round" opacity="0.6">
    <path d="M168 178 Q163 160 168 142 Q173 124 168 106"/>
    <path d="M200 173 Q195 155 200 137 Q205 119 200 101"/>
    <path d="M232 178 Q227 160 232 142 Q237 124 232 106"/>
  </g>
</svg>`;

const RUNNING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="run-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="run-shadow"><feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#014d35" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="400" height="400" fill="url(#run-bg)"/>
  <!-- Ground lines (motion) -->
  <g stroke="#ffffff" stroke-width="2" opacity="0.15" stroke-linecap="round">
    <line x1="20" y1="300" x2="120" y2="300"/>
    <line x1="20" y1="315" x2="90"  y2="315"/>
    <line x1="20" y1="330" x2="60"  y2="330"/>
  </g>
  <!-- Running shoe (side view) -->
  <g transform="translate(200,215)" filter="url(#run-shadow)">
    <!-- Sole -->
    <path d="M-110 55 Q-115 70 -80 80 L100 80 Q125 80 120 60 L90 55 Z" fill="#1a1a2e"/>
    <!-- Midsole -->
    <path d="M-108 40 Q-112 58 -78 65 L98 65 Q118 65 115 48 L88 40 Z" fill="#F0F0F0"/>
    <path d="M-80 65 Q-60 58 -20 62 Q20 66 60 62 Q90 58 98 65" fill="#E0E0E0"/>
    <!-- Upper -->
    <path d="M-100 40 Q-105 -20 -60 -50 Q-20 -75 30 -72 Q75 -70 95 -40 L88 40 Z" fill="#10B981"/>
    <!-- Overlays / panels -->
    <path d="M-60 -50 Q0 -80 50 -65 Q80 -50 88 40 L40 40 Q20 -30 -20 -45 Z" fill="#059669" opacity="0.6"/>
    <path d="M-100 40 Q-90 0 -60 -30 L-40 20 Z" fill="#34D399" opacity="0.4"/>
    <!-- Laces -->
    <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9">
      <line x1="-50" y1="-10" x2="20"  y2="-25"/>
      <line x1="-40" y1="5"   x2="35"  y2="-10"/>
      <line x1="-28" y1="20"  x2="48"  y2="5"/>
      <line x1="-14" y1="34"  x2="62"  y2="20"/>
    </g>
    <!-- Heel tab -->
    <rect x="-108" y="10" width="22" height="30" rx="6" fill="#047857"/>
    <!-- Nike-esque swoosh -->
    <path d="M-80 30 Q20 -60 88 -30" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.25"/>
  </g>
  <!-- Motion streaks -->
  <g stroke="#ffffff" stroke-width="2.5" opacity="0.2" stroke-linecap="round">
    <line x1="30" y1="190" x2="100" y2="190"/>
    <line x1="20" y1="210" x2="80"  y2="210"/>
    <line x1="35" y1="230" x2="90"  y2="230"/>
  </g>
</svg>`;

const TEA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="tea-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86EFAC"/>
      <stop offset="100%" stop-color="#15803D"/>
    </linearGradient>
    <linearGradient id="tea-cup" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F0FFF4"/>
      <stop offset="100%" stop-color="#DCFCE7"/>
    </linearGradient>
    <filter id="tea-shadow"><feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#064e1c" flood-opacity="0.5"/></filter>
  </defs>
  <rect width="400" height="400" fill="url(#tea-bg)"/>
  <!-- Saucer -->
  <ellipse cx="200" cy="295" rx="105" ry="22" fill="#4ADE80" opacity="0.5" filter="url(#tea-shadow)"/>
  <ellipse cx="200" cy="288" rx="98" ry="16" fill="#86EFAC"/>
  <!-- Cup body -->
  <g filter="url(#tea-shadow)">
    <path d="M128 195 Q126 278 144 288 Q200 300 256 288 Q274 278 272 195 Z" fill="url(#tea-cup)"/>
    <!-- Handle -->
    <path d="M270 218 Q312 218 312 252 Q312 282 270 280" fill="none" stroke="url(#tea-cup)" stroke-width="15" stroke-linecap="round"/>
    <path d="M270 218 Q306 218 306 252 Q306 282 270 280" fill="none" stroke="#F0FFF4" stroke-width="7"  stroke-linecap="round"/>
  </g>
  <!-- Tea surface -->
  <ellipse cx="200" cy="198" rx="70" ry="15" fill="#86EFAC" opacity="0.8"/>
  <!-- Teabag string -->
  <line x1="200" y1="155" x2="200" y2="195" stroke="#6B7280" stroke-width="2"/>
  <rect x="185" y="140" width="30" height="22" rx="4" fill="#374151" opacity="0.8"/>
  <!-- Steam -->
  <g fill="none" stroke="#BBF7D0" stroke-width="3" stroke-linecap="round" opacity="0.55">
    <path d="M172 175 Q167 157 172 140 Q177 123 172 106"/>
    <path d="M200 170 Q195 152 200 135 Q205 118 200 101"/>
    <path d="M228 175 Q223 157 228 140 Q233 123 228 106"/>
  </g>
  <!-- Leaf decoration -->
  <g transform="translate(155,240)" fill="#4ADE80" opacity="0.5">
    <ellipse cx="0" cy="0" rx="18" ry="9" transform="rotate(-30)"/>
    <line x1="0" y1="-9" x2="0" y2="9" stroke="#16A34A" stroke-width="1.5" transform="rotate(-30)"/>
  </g>
</svg>`;

// ─── Theme Configuration ──────────────────────────────────────────────────────
// Each entry maps a community_channel slug → full visual theme for DiscussionHero.
//
// Fields:
//   id              — matches the community_channel slug in the discussions table
//   displayName     — human-readable room name (used as fallback if discussion.title is short)
//   illustration    — SVG import path (string URL) OR raw inline SVG markup string
//   illustrationIsInline — true = render as dangerouslySetInnerHTML, false = <img src>
//   bgGradient      — CSS gradient for the hero background
//   glowColor       — semi-transparent color for the ambient glow layer
//   accentColor     — primary brand color (buttons, pills, borders)
//   cardAccent      — feature card left-border / label color
//   particles       — decorative dots config: { color, count }
//   featureCard     — default card content when discussion has no description
//     label         — small label above the main line (e.g. "Tonight 8:00 PM")
//     title         — bold main line
//     subtitle      — secondary line
//     showPoster    — whether to show a right-side poster/thumbnail placeholder

export const DISCUSSION_THEMES = {
  // ── Movie Night ────────────────────────────────────────────────────────────
  'general': {
    id: 'general',
    displayName: 'General Chat',
    illustration: null,
    illustrationInlineSvg: GENERAL_SVG,
    bgGradient: 'linear-gradient(160deg, #5B3FD8 0%, #4028B8 45%, #311FA0 100%)',
    glowColor: 'rgba(124, 92, 252, 0.35)',
    accentColor: '#6D4AFF',
    cardAccent: '#8B6FFF',
    particles: { color: '#BFA8FF', count: 6 },
    featureCard: {
      label: 'Community Hub',
      title: 'Open to everyone',
      subtitle: 'Start a conversation',
      showPoster: false,
    },
  },

  // ── Sports ─────────────────────────────────────────────────────────────────
  'sports': {
    id: 'sports',
    displayName: 'Sports Room',
    illustration: null,
    illustrationInlineSvg: SPORTS_SVG,
    bgGradient: 'linear-gradient(160deg, #E07400 0%, #C45200 50%, #A03D00 100%)',
    glowColor: 'rgba(255, 140, 0, 0.38)',
    accentColor: '#EA6A0E',
    cardAccent: '#FF9A3C',
    particles: { color: '#FFD080', count: 5 },
    featureCard: {
      label: "Today's Match",
      title: 'Live Discussion',
      subtitle: 'Join the conversation',
      showPoster: false,
    },
  },

  // ── Events ─────────────────────────────────────────────────────────────────
  'events': {
    id: 'events',
    displayName: 'Events Room',
    illustration: null,
    illustrationInlineSvg: MOVIE_SVG,
    // Full-width cinematic scene (popcorn + clapperboard + spotlights) shown
    // behind the hero header, replacing the flat gradient background.
    heroSceneSvg: movieSceneSvg,
    bgGradient: 'linear-gradient(160deg, #4B207B 0%, #230E4E 55%, #0b0213 100%)',
    glowColor: 'rgba(219, 39, 119, 0.32)',
    accentColor: '#DB2777',
    cardAccent: '#A575F1',
    particles: null,
    featureCard: {
      label: 'Upcoming Event',
      title: 'Something exciting',
      subtitle: 'Stay tuned',
      showPoster: true,
      icon: 'clapper',
    },
  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  'gaming': {
    id: 'gaming',
    displayName: 'Gaming Room',
    illustration: gamingSvg,
    illustrationInlineSvg: null,
    bgGradient: 'linear-gradient(160deg, #7B55C8 0%, #5930A8 50%, #3D1E88 100%)',
    glowColor: 'rgba(109, 74, 255, 0.4)',
    accentColor: '#7B55C8',
    cardAccent: '#A78BFA',
    particles: { color: '#C4B5FD', count: 7 },
    featureCard: {
      label: 'Game Night',
      title: 'Ready to play?',
      subtitle: 'Join the lobby',
      showPoster: false,
    },
  },

  // ── Food ───────────────────────────────────────────────────────────────────
  'food': {
    id: 'food',
    displayName: 'Foodies Room',
    illustration: foodSvg,
    illustrationInlineSvg: null,
    bgGradient: 'linear-gradient(160deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    accentColor: '#EA580C',
    cardAccent: '#FB923C',
    particles: { color: '#FED7AA', count: 5 },
    featureCard: {
      label: 'Weekend Food Crawl',
      title: 'Spice Garden Eats',
      subtitle: 'Share your favourites',
      showPoster: false,
    },
  },

  // ── Music ──────────────────────────────────────────────────────────────────
  'music': {
    id: 'music',
    displayName: 'Music Room',
    illustration: musicSvg,
    illustrationInlineSvg: null,
    bgGradient: 'linear-gradient(160deg, #8B5CF6 0%, #6D28D9 55%, #4C1D95 100%)',
    glowColor: 'rgba(167, 139, 250, 0.38)',
    accentColor: '#7C3AED',
    cardAccent: '#A78BFA',
    particles: { color: '#DDD6FE', count: 6 },
    featureCard: {
      label: 'Now Playing',
      title: 'Share your playlist',
      subtitle: 'What are you listening to?',
      showPoster: false,
    },
  },

  // ── Study ──────────────────────────────────────────────────────────────────
  'study': {
    id: 'study',
    displayName: 'Study Group',
    illustration: studySvg,
    illustrationInlineSvg: null,
    bgGradient: 'linear-gradient(160deg, #D97706 0%, #B45309 55%, #92400E 100%)',
    glowColor: 'rgba(217, 119, 6, 0.32)',
    accentColor: '#D97706',
    cardAccent: '#FBBF24',
    particles: { color: '#FDE68A', count: 5 },
    featureCard: {
      label: "Today's Topic",
      title: 'Study Session',
      subtitle: 'Focus together',
      showPoster: false,
    },
  },

  // ── Travel ─────────────────────────────────────────────────────────────────
  'travel': {
    id: 'travel',
    displayName: 'Travel Room',
    illustration: travelSvg,
    illustrationInlineSvg: null,
    bgGradient: 'linear-gradient(160deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    accentColor: '#2563EB',
    cardAccent: '#60A5FA',
    particles: { color: '#BFDBFE', count: 6 },
    featureCard: {
      label: 'Next Destination',
      title: 'Where to next?',
      subtitle: 'Plan together',
      showPoster: false,
    },
  },

  // ── Coffee ─────────────────────────────────────────────────────────────────
  'coffee': {
    id: 'coffee',
    displayName: 'Coffee Corner',
    illustration: null,
    illustrationInlineSvg: COFFEE_SVG,
    bgGradient: 'linear-gradient(160deg, #C48A3E 0%, #A0672A 55%, #7D4E1A 100%)',
    glowColor: 'rgba(196, 138, 62, 0.35)',
    accentColor: '#B45309',
    cardAccent: '#F59E0B',
    particles: { color: '#FDE68A', count: 5 },
    featureCard: {
      label: 'Coffee Meetup',
      title: 'Grab a cup ☕',
      subtitle: 'Casual hangout',
      showPoster: false,
    },
  },

  // ── Running ────────────────────────────────────────────────────────────────
  'running': {
    id: 'running',
    displayName: 'Running Club',
    illustration: null,
    illustrationInlineSvg: RUNNING_SVG,
    bgGradient: 'linear-gradient(160deg, #10B981 0%, #059669 55%, #047857 100%)',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    accentColor: '#059669',
    cardAccent: '#34D399',
    particles: { color: '#A7F3D0', count: 6 },
    featureCard: {
      label: 'Morning Run',
      title: 'Sunday 6:30 AM',
      subtitle: 'Spice Garden Gate 1',
      showPoster: false,
    },
  },

  // ── Tea ────────────────────────────────────────────────────────────────────
  'tea': {
    id: 'tea',
    displayName: 'Tea Corner',
    illustration: null,
    illustrationInlineSvg: TEA_SVG,
    bgGradient: 'linear-gradient(160deg, #4ADE80 0%, #16A34A 55%, #15803D 100%)',
    glowColor: 'rgba(74, 222, 128, 0.3)',
    accentColor: '#16A34A',
    cardAccent: '#4ADE80',
    particles: { color: '#BBF7D0', count: 5 },
    featureCard: {
      label: 'Evening Tea',
      title: 'Chai time ☕',
      subtitle: 'Relax and chat',
      showPoster: false,
    },
  },

  // ── Ride Sharing ───────────────────────────────────────────────────────────
  'ride-sharing': {
    id: 'ride-sharing',
    displayName: 'Ride Sharing',
    illustration: null,
    illustrationInlineSvg: GENERAL_SVG, // placeholder until ride SVG is added
    bgGradient: 'linear-gradient(160deg, #16A34A 0%, #15803D 55%, #166534 100%)',
    glowColor: 'rgba(22, 163, 74, 0.35)',
    accentColor: '#16A34A',
    cardAccent: '#4ADE80',
    particles: { color: '#BBF7D0', count: 4 },
    featureCard: {
      label: 'Ride Available',
      title: 'Find your carpool',
      subtitle: 'Commute together',
      showPoster: false,
    },
  },

  // ── Buy & Sell ─────────────────────────────────────────────────────────────
  'buy-sell': {
    id: 'buy-sell',
    displayName: 'Marketplace',
    illustration: null,
    illustrationInlineSvg: GENERAL_SVG,
    bgGradient: 'linear-gradient(160deg, #EA580C 0%, #C2410C 55%, #9A3412 100%)',
    glowColor: 'rgba(234, 88, 12, 0.35)',
    accentColor: '#EA580C',
    cardAccent: '#FB923C',
    particles: { color: '#FED7AA', count: 4 },
    featureCard: {
      label: 'Marketplace',
      title: 'Buy & Sell',
      subtitle: 'Great deals nearby',
      showPoster: false,
    },
  },

  // ── Jobs ───────────────────────────────────────────────────────────────────
  'jobs': {
    id: 'jobs',
    displayName: 'Jobs Room',
    illustration: null,
    illustrationInlineSvg: GENERAL_SVG,
    bgGradient: 'linear-gradient(160deg, #B45309 0%, #92400E 55%, #78350F 100%)',
    glowColor: 'rgba(180, 83, 9, 0.32)',
    accentColor: '#B45309',
    cardAccent: '#F59E0B',
    particles: { color: '#FDE68A', count: 4 },
    featureCard: {
      label: 'Opportunities',
      title: 'Jobs & Gigs',
      subtitle: 'Hiring nearby',
      showPoster: false,
    },
  },

  // ── Help ───────────────────────────────────────────────────────────────────
  'help': {
    id: 'help',
    displayName: 'Help Room',
    illustration: null,
    illustrationInlineSvg: GENERAL_SVG,
    bgGradient: 'linear-gradient(160deg, #7C3AED 0%, #5B21B6 55%, #4C1D95 100%)',
    glowColor: 'rgba(124, 58, 237, 0.35)',
    accentColor: '#7C3AED',
    cardAccent: '#A78BFA',
    particles: { color: '#DDD6FE', count: 4 },
    featureCard: {
      label: 'Community Help',
      title: 'Ask anything',
      subtitle: 'We help each other',
      showPoster: false,
    },
  },

  // ── Lost & Found ───────────────────────────────────────────────────────────
  'lost-and-found': {
    id: 'lost-and-found',
    displayName: 'Lost & Found',
    illustration: null,
    illustrationInlineSvg: GENERAL_SVG,
    bgGradient: 'linear-gradient(160deg, #DC2626 0%, #B91C1C 55%, #991B1B 100%)',
    glowColor: 'rgba(220, 38, 38, 0.32)',
    accentColor: '#DC2626',
    cardAccent: '#F87171',
    particles: { color: '#FECACA', count: 4 },
    featureCard: {
      label: 'Lost & Found',
      title: 'Help your neighbours',
      subtitle: 'Report or claim items',
      showPoster: false,
    },
  },
};

/**
 * getDiscussionTheme(channelSlug)
 * Returns the theme config for the given channel slug.
 * Falls back to 'general' if slug is unknown.
 */
export function getDiscussionTheme(channelSlug) {
  return DISCUSSION_THEMES[channelSlug] || DISCUSSION_THEMES['general'];
}
