/**
 * SportIcon.jsx — Profile/Community UI Premium Polish
 * Coded SVG icon per sports discussion category (Cricket, Football,
 * Badminton, Cycling, Gym, Other) — no emoji, no image assets. Used
 * wherever a Sports-channel discussion needs a real icon for its actual
 * category instead of one fixed default emoji.
 */
export default function SportIcon({ category, size = 28 }) {
  const common = { width: size, height: size, viewBox: '0 0 48 48', xmlns: 'http://www.w3.org/2000/svg' };

  switch (category) {
    case 'Cricket':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="si-bat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D9A45B" /><stop offset="100%" stopColor="#8B5E2B" />
            </linearGradient>
          </defs>
          <rect x="26" y="4" width="8" height="22" rx="4" fill="url(#si-bat)" transform="rotate(35 30 15)" />
          <rect x="20" y="24" width="12" height="18" rx="4" fill="#F2C879" transform="rotate(35 26 33)" />
          <circle cx="14" cy="36" r="8" fill="#B91C1C" />
          <path d="M8 36h12M14 30v12" stroke="#fff" strokeWidth="1.4" opacity="0.85" />
        </svg>
      );
    case 'Football':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="19" fill="#fff" stroke="#1F2937" strokeWidth="2" />
          <polygon points="24,14 30,19 28,26 20,26 18,19" fill="#1F2937" />
          <path d="M24,14 L24,6 M30,19 L37,15 M28,26 L33,34 M20,26 L15,34 M18,19 L11,15" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="6.5" r="2.3" fill="#1F2937" />
          <circle cx="37.5" cy="14.5" r="2.3" fill="#1F2937" />
          <circle cx="33.5" cy="34.5" r="2.3" fill="#1F2937" />
          <circle cx="14.5" cy="34.5" r="2.3" fill="#1F2937" />
          <circle cx="10.5" cy="14.5" r="2.3" fill="#1F2937" />
        </svg>
      );
    case 'Cycling':
      return (
        <svg {...common}>
          <circle cx="12" cy="34" r="8" fill="none" stroke="#0284C7" strokeWidth="2.6" />
          <circle cx="36" cy="34" r="8" fill="none" stroke="#0284C7" strokeWidth="2.6" />
          <path d="M12 34 L22 16 L30 16 M22 16 L30 34 M18 24 L36 34 M22 16 L18 24" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="30" cy="12" r="3" fill="#1F2937" />
          <path d="M27 16 L33 16" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'Gym':
      return (
        <svg {...common}>
          <rect x="4" y="20" width="6" height="8" rx="1.5" fill="#374151" />
          <rect x="38" y="20" width="6" height="8" rx="1.5" fill="#374151" />
          <rect x="10" y="17" width="4" height="14" rx="1.5" fill="#6B7280" />
          <rect x="34" y="17" width="4" height="14" rx="1.5" fill="#6B7280" />
          <rect x="14" y="22" width="20" height="4" rx="2" fill="#9CA3AF" />
        </svg>
      );
    case 'Other':
    default:
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="si-trophy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path d="M14 8h20v10a10 10 0 0 1-20 0z" fill="url(#si-trophy)" />
          <path d="M14 10H8a6 6 0 0 0 6 8" fill="none" stroke="#D97706" strokeWidth="2.4" />
          <path d="M34 10h6a6 6 0 0 1-6 8" fill="none" stroke="#D97706" strokeWidth="2.4" />
          <rect x="20" y="28" width="8" height="6" fill="#D97706" />
          <rect x="15" y="34" width="18" height="5" rx="2" fill="#B45309" />
        </svg>
      );
  }
}
