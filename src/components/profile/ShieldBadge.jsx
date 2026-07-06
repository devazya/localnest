/**
 * ShieldBadge.jsx — Profile UI Premium Polish
 * Premium 3D shield-with-star badge (Neighbour Score card decoration).
 * Self-contained SVG, coded rather than image-based.
 */
export default function ShieldBadge({ size = 58 }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: 'drop-shadow(0 8px 14px rgba(76,29,149,0.35))' }}
    >
      <defs>
        <linearGradient id="sb-rim-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="30%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="sb-inner-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="sb-star-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <g id="sb-sparkle">
          <path d="M12 0C12 7.5 14.5 12 24 12C14.5 12 12 16.5 12 24C12 16.5 9.5 12 0 12C9.5 12 12 7.5 12 0Z" />
        </g>
        <filter id="sb-shadow-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="sb-highlight-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Ambient drop shadow under the shield */}
      <ellipse cx="60" cy="110" rx="25" ry="6" fill="#7C3AED" filter="url(#sb-shadow-blur)" opacity="0.4" />

      {/* Base 3D extrusion */}
      <path
        d="M 30,20 L 90,20 C 95,20 100,25 100,32 L 100,55 C 100,75 80,95 60,105 C 40,95 20,75 20,55 L 20,32 C 20,25 25,20 30,20 Z"
        transform="translate(0, 5)"
        fill="#4C1D95"
      />

      {/* Outer rim */}
      <path
        d="M 30,20 L 90,20 C 95,20 100,25 100,32 L 100,55 C 100,75 80,95 60,105 C 40,95 20,75 20,55 L 20,32 C 20,25 25,20 30,20 Z"
        fill="url(#sb-rim-grad)"
      />

      {/* Inner face */}
      <path
        d="M 30,20 L 90,20 C 95,20 100,25 100,32 L 100,55 C 100,75 80,95 60,105 C 40,95 20,75 20,55 L 20,32 C 20,25 25,20 30,20 Z"
        transform="translate(60, 62.5) scale(0.68) translate(-60, -62.5)"
        fill="url(#sb-inner-grad)"
      />

      {/* Inner shadow for depth */}
      <path
        d="M 30,20 L 90,20 C 95,20 100,25 100,32 L 100,55 C 100,75 80,95 60,105 C 40,95 20,75 20,55 L 20,32 C 20,25 25,20 30,20 Z"
        transform="translate(60, 62.5) scale(0.68) translate(-60, -62.5)"
        fill="none" stroke="#3B0764" strokeWidth="3" opacity="0.4"
      />

      {/* Specular plastic highlights */}
      <ellipse cx="35" cy="28" rx="12" ry="4" transform="rotate(-35 35 28)" fill="#FFFFFF" opacity="0.8" filter="url(#sb-highlight-blur)" />
      <ellipse cx="85" cy="28" rx="8" ry="3" transform="rotate(35 85 28)" fill="#FFFFFF" opacity="0.4" filter="url(#sb-highlight-blur)" />

      {/* Center star */}
      <g transform="translate(60, 58) scale(1.1) translate(-60, -58)">
        <polygon
          points="60,35 66,49 81,49 69,58 74,73 60,64 46,73 51,58 39,49 54,49"
          fill="#2E1065" stroke="#2E1065" strokeWidth="4" strokeLinejoin="round"
          opacity="0.5" transform="translate(0, 3)"
        />
        <polygon
          points="60,35 66,49 81,49 69,58 74,73 60,64 46,73 51,58 39,49 54,49"
          fill="url(#sb-star-grad)" stroke="url(#sb-star-grad)" strokeWidth="5" strokeLinejoin="round"
        />
        <polygon
          points="60,35 66,49 81,49 69,58 74,73 60,64 46,73 51,58 39,49 54,49"
          fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" opacity="0.9"
        />
      </g>

      {/* Floating sparkles */}
      <g transform="translate(82, 14) scale(0.65)"><use href="#sb-sparkle" fill="#FDE047" /></g>
      <g transform="translate(98, 42) scale(0.35)"><use href="#sb-sparkle" fill="#FEF08A" /></g>
      <g transform="translate(8, 45) scale(0.55)"><use href="#sb-sparkle" fill="#FDE047" /></g>
      <g transform="translate(86, 75) scale(0.45)"><use href="#sb-sparkle" fill="#C4B5FD" /></g>
      <g transform="translate(15, 70) scale(0.5)"><use href="#sb-sparkle" fill="#E9D5FF" /></g>
      <g transform="translate(20, 16) scale(0.25)"><use href="#sb-sparkle" fill="#D8B4FE" /></g>
    </svg>
  );
}
