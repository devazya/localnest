/**
 * LocalNest Icon Library
 * ──────────────────────────────────────────────────────────────────
 * Soft 3D clay-style icons — matching the uploaded reference sheets.
 * Every icon is a pure SVG React component, no external dependencies.
 *
 * Usage:
 *   import { PGIcon, GymIcon, RideIcon } from '../assets/icons';
 *   <PGIcon size={48} />
 *
 * All icons accept: size (default 48), className, style
 */

/* ─── Wrapper helper ──────────────────────────────────────────────── */
function Icon({ size = 48, className, style, children, viewBox = '0 0 80 80' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CATEGORY ICONS  (matching Image 2 reference)
══════════════════════════════════════════════════════════════════ */

/** PG — Purple bed with pillow */
export function PGIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Bed frame */}
      <rect x="8" y="44" width="64" height="20" rx="7" fill="#C4B5FD"/>
      <rect x="8" y="44" width="64" height="20" rx="7" fill="url(#pgShadow)"/>
      {/* Mattress */}
      <rect x="10" y="32" width="60" height="16" rx="6" fill="#EDE9FE"/>
      {/* Pillow */}
      <rect x="15" y="30" width="20" height="12" rx="5" fill="#fff"/>
      <rect x="15" y="30" width="20" height="12" rx="5" fill="url(#pgPillowShine)" opacity="0.6"/>
      {/* Headboard */}
      <rect x="8" y="22" width="16" height="26" rx="5" fill="#7C3AED"/>
      <rect x="8" y="22" width="16" height="10" rx="5" fill="#8B5CF6"/>
      {/* Legs */}
      <rect x="12" y="62" width="6" height="8" rx="3" fill="#6D28D9"/>
      <rect x="62" y="62" width="6" height="8" rx="3" fill="#6D28D9"/>
      {/* Shine on mattress */}
      <ellipse cx="40" cy="33" rx="22" ry="4" fill="#fff" opacity="0.3"/>
      <defs>
        <linearGradient id="pgShadow" x1="8" y1="44" x2="8" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" stopOpacity="0"/>
          <stop offset="1" stopColor="#4C1D95" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="pgPillowShine" x1="15" y1="30" x2="35" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#fff" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Gym — Purple dumbbell */
export function GymIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Left weight */}
      <rect x="6" y="26" width="14" height="28" rx="6" fill="#7C3AED"/>
      <rect x="6" y="26" width="14" height="28" rx="6" fill="url(#gymL)"/>
      {/* Left collar */}
      <rect x="17" y="31" width="7" height="18" rx="4" fill="#6D28D9"/>
      {/* Bar */}
      <rect x="22" y="36" width="36" height="8" rx="4" fill="#8B5CF6"/>
      <rect x="22" y="36" width="36" height="4" rx="4" fill="#A78BFA"/>
      {/* Right collar */}
      <rect x="56" y="31" width="7" height="18" rx="4" fill="#6D28D9"/>
      {/* Right weight */}
      <rect x="60" y="26" width="14" height="28" rx="6" fill="#7C3AED"/>
      <rect x="60" y="26" width="14" height="28" rx="6" fill="url(#gymR)"/>
      {/* Shine */}
      <rect x="9" y="29" width="8" height="6" rx="3" fill="#fff" opacity="0.25"/>
      <rect x="63" y="29" width="8" height="6" rx="3" fill="#fff" opacity="0.25"/>
      <defs>
        <linearGradient id="gymL" x1="6" y1="26" x2="20" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#4C1D95"/>
        </linearGradient>
        <linearGradient id="gymR" x1="60" y1="26" x2="74" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#4C1D95"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Shops — Blue shopping bag with star */
export function ShopsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Bag body */}
      <rect x="14" y="28" width="52" height="38" rx="10" fill="#3B82F6"/>
      <rect x="14" y="28" width="52" height="38" rx="10" fill="url(#shopGrad)"/>
      {/* Bag top fold */}
      <rect x="14" y="28" width="52" height="12" rx="8" fill="#2563EB"/>
      {/* Handles */}
      <path d="M28 28 C28 16 52 16 52 28" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Star */}
      <path d="M40 36 L42.2 42.9 L49.5 42.9 L43.7 47.1 L45.9 54 L40 49.8 L34.1 54 L36.3 47.1 L30.5 42.9 L37.8 42.9 Z" fill="#fff" opacity="0.95"/>
      {/* Shine */}
      <ellipse cx="32" cy="34" rx="6" ry="3" fill="#fff" opacity="0.2"/>
      <defs>
        <linearGradient id="shopGrad" x1="14" y1="28" x2="66" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Cafes — Orange coffee cup with saucer */
export function CafesIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Saucer */}
      <ellipse cx="40" cy="62" rx="24" ry="6" fill="#FB923C"/>
      <ellipse cx="40" cy="62" rx="24" ry="6" fill="url(#saucerGrad)"/>
      {/* Cup body */}
      <path d="M22 30 L26 62 Q40 66 54 62 L58 30 Z" fill="#F97316"/>
      <path d="M22 30 L26 62 Q40 66 54 62 L58 30 Z" fill="url(#cupGrad)"/>
      {/* Cup lip */}
      <ellipse cx="40" cy="30" rx="18" ry="5" fill="#FB923C"/>
      <ellipse cx="40" cy="30" rx="18" ry="5" fill="url(#lipGrad)"/>
      {/* Handle */}
      <path d="M58 36 C70 36 70 56 58 56" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Coffee surface */}
      <ellipse cx="40" cy="30" rx="14" ry="3.5" fill="#92400E"/>
      <ellipse cx="40" cy="30" rx="10" ry="2" fill="#78350F"/>
      {/* Steam */}
      <path d="M34 22 C34 16 38 16 38 10" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M40 20 C40 14 44 14 44 8" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <defs>
        <linearGradient id="cupGrad" x1="22" y1="30" x2="58" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C"/>
          <stop offset="1" stopColor="#C2410C"/>
        </linearGradient>
        <linearGradient id="saucerGrad" x1="16" y1="56" x2="64" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74"/>
          <stop offset="1" stopColor="#EA580C"/>
        </linearGradient>
        <linearGradient id="lipGrad" x1="22" y1="25" x2="58" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74"/>
          <stop offset="1" stopColor="#F97316"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Buy & Sell — Purple price tag */
export function BuySellIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Tag body */}
      <path d="M18 10 L58 10 Q66 10 66 18 L66 42 L40 68 L14 42 L14 18 Q14 10 18 10 Z" fill="#7C3AED"/>
      <path d="M18 10 L58 10 Q66 10 66 18 L66 42 L40 68 L14 42 L14 18 Q14 10 18 10 Z" fill="url(#tagGrad)"/>
      {/* Hole */}
      <circle cx="40" cy="22" r="5" fill="#EDE9FE"/>
      <circle cx="40" cy="22" r="3" fill="#C4B5FD"/>
      {/* Price lines */}
      <rect x="28" y="34" width="24" height="4" rx="2" fill="#fff" opacity="0.8"/>
      <rect x="30" y="42" width="20" height="3" rx="1.5" fill="#fff" opacity="0.5"/>
      {/* Shine */}
      <ellipse cx="30" cy="18" rx="8" ry="4" fill="#fff" opacity="0.2"/>
      <defs>
        <linearGradient id="tagGrad" x1="14" y1="10" x2="66" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Rides — Blue car (front-facing) */
export function RidesIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Car body */}
      <rect x="8" y="36" width="64" height="24" rx="10" fill="#3B82F6"/>
      <rect x="8" y="36" width="64" height="24" rx="10" fill="url(#carBodyGrad)"/>
      {/* Roof */}
      <path d="M20 36 L26 18 Q28 14 32 14 L48 14 Q52 14 54 18 L60 36 Z" fill="#60A5FA"/>
      <path d="M20 36 L26 18 Q28 14 32 14 L48 14 Q52 14 54 18 L60 36 Z" fill="url(#roofGrad)"/>
      {/* Windshield */}
      <path d="M26 34 L30 20 L50 20 L54 34 Z" fill="#BFDBFE" opacity="0.9"/>
      <path d="M26 34 L30 20 L50 20 L54 34 Z" fill="url(#windshield)"/>
      {/* Windows shimmer */}
      <path d="M28 30 L31 21 L36 21 L33 30 Z" fill="#fff" opacity="0.35"/>
      {/* Headlights */}
      <ellipse cx="18" cy="52" rx="7" ry="5" fill="#FDE68A"/>
      <ellipse cx="18" cy="52" rx="7" ry="5" fill="url(#headlight)"/>
      <ellipse cx="62" cy="52" rx="7" ry="5" fill="#FDE68A"/>
      {/* Wheels */}
      <circle cx="22" cy="64" r="8" fill="#1E3A5F"/>
      <circle cx="22" cy="64" r="5" fill="#374151"/>
      <circle cx="22" cy="64" r="2.5" fill="#9CA3AF"/>
      <circle cx="58" cy="64" r="8" fill="#1E3A5F"/>
      <circle cx="58" cy="64" r="5" fill="#374151"/>
      <circle cx="58" cy="64" r="2.5" fill="#9CA3AF"/>
      {/* Grille */}
      <rect x="30" y="52" width="20" height="6" rx="3" fill="#1D4ED8" opacity="0.6"/>
      <rect x="37" y="50" width="6" height="10" rx="3" fill="#1D4ED8" opacity="0.4"/>
      <defs>
        <linearGradient id="carBodyGrad" x1="8" y1="36" x2="72" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
        <linearGradient id="roofGrad" x1="20" y1="14" x2="60" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD"/>
          <stop offset="1" stopColor="#3B82F6"/>
        </linearGradient>
        <linearGradient id="windshield" x1="26" y1="20" x2="54" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" stopOpacity="0.9"/>
          <stop offset="1" stopColor="#BFDBFE" stopOpacity="0.7"/>
        </linearGradient>
        <radialGradient id="headlight" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#FEF3C7"/>
          <stop offset="1" stopColor="#F59E0B"/>
        </radialGradient>
      </defs>
    </Icon>
  );
}

/** Events — Calendar with star */
export function EventsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Calendar body */}
      <rect x="10" y="18" width="60" height="52" rx="10" fill="#fff"/>
      <rect x="10" y="18" width="60" height="52" rx="10" fill="url(#calBg)"/>
      <rect x="10" y="18" width="60" height="52" rx="10" stroke="rgba(109,74,255,0.15)" strokeWidth="1.5"/>
      {/* Header bar */}
      <rect x="10" y="18" width="60" height="20" rx="10" fill="#EF4444"/>
      <rect x="10" y="28" width="60" height="10" rx="0" fill="#EF4444"/>
      {/* Rings */}
      <rect x="25" y="11" width="6" height="16" rx="3" fill="#DC2626"/>
      <rect x="49" y="11" width="6" height="16" rx="3" fill="#DC2626"/>
      {/* Star on header */}
      <path d="M40 22 L41.5 26.6 L46.4 26.6 L42.4 29.4 L43.9 34 L40 31.2 L36.1 34 L37.6 29.4 L33.6 26.6 L38.5 26.6 Z" fill="#fff"/>
      {/* Grid dots */}
      {[28,40,52].map(x => [48,57,66].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#6D4AFF" opacity="0.6"/>
      )))}
      <defs>
        <linearGradient id="calBg" x1="10" y1="18" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9FF"/>
          <stop offset="1" stopColor="#EDE9FE"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Services — Purple wrench */
export function ServicesIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Wrench handle */}
      <path d="M20 68 L50 38" stroke="#7C3AED" strokeWidth="12" strokeLinecap="round"/>
      <path d="M20 68 L50 38" stroke="url(#wrenchGrad)" strokeWidth="12" strokeLinecap="round"/>
      {/* Wrench head */}
      <path d="M50 38 C48 24 60 14 70 18 C64 16 62 22 64 28 L68 32 C72 34 70 44 62 42 C56 40 52 44 50 38 Z" fill="#8B5CF6"/>
      <path d="M50 38 C48 24 60 14 70 18 C64 16 62 22 64 28 L68 32 C72 34 70 44 62 42 C56 40 52 44 50 38 Z" fill="url(#wrenchHead)"/>
      {/* Shine */}
      <path d="M26 62 L36 52" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
      <defs>
        <linearGradient id="wrenchGrad" x1="20" y1="68" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
        <linearGradient id="wrenchHead" x1="48" y1="14" x2="72" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD"/>
          <stop offset="1" stopColor="#6D28D9"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Hospital */
export function HospitalIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Building */}
      <rect x="14" y="22" width="52" height="50" rx="6" fill="#E2E8F0"/>
      <rect x="14" y="22" width="52" height="50" rx="6" fill="url(#hospGrad)"/>
      {/* Roof line */}
      <rect x="14" y="22" width="52" height="14" rx="6" fill="#94A3B8"/>
      {/* Red cross circle */}
      <circle cx="40" cy="34" r="12" fill="#EF4444"/>
      <rect x="37" y="27" width="6" height="14" rx="3" fill="#fff"/>
      <rect x="33" y="31" width="14" height="6" rx="3" fill="#fff"/>
      {/* Windows */}
      {[22,42].map(x => [46,58].map(y => (
        <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" rx="3" fill="#BFDBFE" opacity="0.8"/>
      )))}
      {/* Door */}
      <rect x="33" y="58" width="14" height="14" rx="4" fill="#64748B"/>
      <rect x="33" y="58" width="7" height="14" rx="4" fill="#475569"/>
      <defs>
        <linearGradient id="hospGrad" x1="14" y1="22" x2="66" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC"/>
          <stop offset="1" stopColor="#CBD5E1"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Medical — Red heart with pulse */
export function MedicalIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Heart */}
      <path d="M40 66 C40 66 12 48 12 30 C12 22 18 14 26 14 C31 14 36 17 40 22 C44 17 49 14 54 14 C62 14 68 22 68 30 C68 48 40 66 40 66 Z" fill="#EF4444"/>
      <path d="M40 66 C40 66 12 48 12 30 C12 22 18 14 26 14 C31 14 36 17 40 22 C44 17 49 14 54 14 C62 14 68 22 68 30 C68 48 40 66 40 66 Z" fill="url(#heartGrad)"/>
      {/* Pulse line */}
      <path d="M18 36 L26 36 L30 28 L36 44 L42 32 L46 36 L52 36 L56 36" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      {/* Shine */}
      <ellipse cx="30" cy="24" rx="8" ry="5" fill="#fff" opacity="0.25" transform="rotate(-20 30 24)"/>
      <defs>
        <linearGradient id="heartGrad" x1="12" y1="14" x2="68" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#B91C1C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Laundry — Washing machine */
export function LaundryIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Body */}
      <rect x="10" y="10" width="60" height="62" rx="10" fill="#E2E8F0"/>
      <rect x="10" y="10" width="60" height="62" rx="10" fill="url(#washGrad)"/>
      {/* Top panel */}
      <rect x="10" y="10" width="60" height="18" rx="10" fill="#CBD5E1"/>
      <rect x="10" y="18" width="60" height="10" fill="#CBD5E1"/>
      {/* Knobs */}
      <circle cx="24" cy="18" r="4" fill="#94A3B8"/>
      <circle cx="24" cy="18" r="2" fill="#64748B"/>
      <circle cx="36" cy="18" r="4" fill="#EF4444"/>
      <circle cx="36" cy="18" r="2" fill="#DC2626"/>
      {/* Door circle */}
      <circle cx="40" cy="48" r="20" fill="#fff" stroke="#94A3B8" strokeWidth="2"/>
      <circle cx="40" cy="48" r="16" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5"/>
      <circle cx="40" cy="48" r="10" fill="#3B82F6" opacity="0.6"/>
      {/* Drum reflection */}
      <path d="M32 42 C36 38 44 38 48 42" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      {/* Handle */}
      <rect x="50" y="46" width="6" height="4" rx="2" fill="#64748B"/>
      <defs>
        <linearGradient id="washGrad" x1="10" y1="10" x2="70" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC"/>
          <stop offset="1" stopColor="#CBD5E1"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Salon — Pink scissors */
export function SalonIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Left blade */}
      <path d="M14 14 L60 60" stroke="#EC4899" strokeWidth="8" strokeLinecap="round"/>
      <path d="M14 14 L60 60" stroke="url(#scissorL)" strokeWidth="8" strokeLinecap="round"/>
      {/* Right blade */}
      <path d="M66 14 L20 60" stroke="#F472B6" strokeWidth="8" strokeLinecap="round"/>
      <path d="M66 14 L20 60" stroke="url(#scissorR)" strokeWidth="8" strokeLinecap="round"/>
      {/* Pivot */}
      <circle cx="40" cy="38" r="6" fill="#fff"/>
      <circle cx="40" cy="38" r="4" fill="#BE185D"/>
      {/* Handles */}
      <circle cx="16" cy="64" r="8" fill="#EC4899"/>
      <circle cx="16" cy="64" r="5" fill="#F9A8D4"/>
      <circle cx="64" cy="64" r="8" fill="#EC4899"/>
      <circle cx="64" cy="64" r="5" fill="#F9A8D4"/>
      <defs>
        <linearGradient id="scissorL" x1="14" y1="14" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6"/>
          <stop offset="1" stopColor="#BE185D"/>
        </linearGradient>
        <linearGradient id="scissorR" x1="66" y1="14" x2="20" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBCFE8"/>
          <stop offset="1" stopColor="#DB2777"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Food — Burger */
export function FoodIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Top bun */}
      <path d="M12 36 C12 22 28 14 40 14 C52 14 68 22 68 36 Z" fill="#F59E0B"/>
      <path d="M12 36 C12 22 28 14 40 14 C52 14 68 22 68 36 Z" fill="url(#bunTop)"/>
      {/* Sesame seeds */}
      <ellipse cx="32" cy="24" rx="4" ry="2.5" fill="#D97706" transform="rotate(-20 32 24)"/>
      <ellipse cx="46" cy="20" rx="4" ry="2.5" fill="#D97706" transform="rotate(15 46 20)"/>
      {/* Lettuce */}
      <path d="M10 40 Q20 36 30 40 Q40 44 50 40 Q60 36 70 40 L70 44 Q60 48 50 44 Q40 40 30 44 Q20 48 10 44 Z" fill="#16A34A"/>
      {/* Patty */}
      <rect x="12" y="44" width="56" height="10" rx="4" fill="#78350F"/>
      <rect x="12" y="44" width="56" height="4" rx="4" fill="#92400E"/>
      {/* Cheese */}
      <rect x="10" y="54" width="60" height="6" rx="2" fill="#FCD34D"/>
      {/* Bottom bun */}
      <path d="M12 60 Q12 72 40 72 Q68 72 68 60 Z" fill="#D97706"/>
      <path d="M12 60 Q12 72 40 72 Q68 72 68 60 Z" fill="url(#bunBot)"/>
      <defs>
        <linearGradient id="bunTop" x1="12" y1="14" x2="68" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24"/>
          <stop offset="1" stopColor="#D97706"/>
        </linearGradient>
        <linearGradient id="bunBot" x1="12" y1="60" x2="68" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B"/>
          <stop offset="1" stopColor="#B45309"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Pets — Brown dog face */
export function PetsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Head */}
      <ellipse cx="40" cy="42" rx="24" ry="22" fill="#D97706"/>
      <ellipse cx="40" cy="42" rx="24" ry="22" fill="url(#dogGrad)"/>
      {/* Ears */}
      <ellipse cx="20" cy="28" rx="10" ry="16" fill="#B45309" transform="rotate(-15 20 28)"/>
      <ellipse cx="60" cy="28" rx="10" ry="16" fill="#B45309" transform="rotate(15 60 28)"/>
      <ellipse cx="20" cy="28" rx="6" ry="11" fill="#D97706" transform="rotate(-15 20 28)"/>
      <ellipse cx="60" cy="28" rx="6" ry="11" fill="#D97706" transform="rotate(15 60 28)"/>
      {/* Snout */}
      <ellipse cx="40" cy="52" rx="14" ry="10" fill="#F3D5A3"/>
      {/* Nose */}
      <ellipse cx="40" cy="46" rx="7" ry="5" fill="#1C1917"/>
      <ellipse cx="38" cy="45" rx="2.5" ry="1.5" fill="#fff" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="30" cy="38" r="5" fill="#1C1917"/>
      <circle cx="50" cy="38" r="5" fill="#1C1917"/>
      <circle cx="31.5" cy="36.5" r="2" fill="#fff"/>
      <circle cx="51.5" cy="36.5" r="2" fill="#fff"/>
      {/* Mouth */}
      <path d="M34 54 C36 58 44 58 46 54" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <defs>
        <linearGradient id="dogGrad" x1="16" y1="20" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24"/>
          <stop offset="1" stopColor="#B45309"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Jobs — Brown briefcase */
export function JobsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Briefcase body */}
      <rect x="10" y="30" width="60" height="42" rx="10" fill="#92400E"/>
      <rect x="10" y="30" width="60" height="42" rx="10" fill="url(#briefGrad)"/>
      {/* Center band */}
      <rect x="10" y="46" width="60" height="10" fill="#78350F"/>
      {/* Handle */}
      <path d="M28 30 L28 22 Q28 16 40 16 Q52 16 52 22 L52 30" stroke="#6B2D05" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Clasp */}
      <rect x="35" y="44" width="10" height="12" rx="3" fill="#FCD34D"/>
      <rect x="37" y="48" width="6" height="4" rx="2" fill="#F59E0B"/>
      {/* Shine */}
      <rect x="14" y="33" width="20" height="6" rx="3" fill="#fff" opacity="0.15"/>
      <defs>
        <linearGradient id="briefGrad" x1="10" y1="30" x2="70" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B45309"/>
          <stop offset="1" stopColor="#78350F"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Education — Purple graduation cap */
export function EducationIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Cap top (mortarboard) */}
      <path d="M8 34 L40 18 L72 34 L40 50 Z" fill="#4C1D95"/>
      <path d="M8 34 L40 18 L72 34 L40 50 Z" fill="url(#capGrad)"/>
      {/* Center highlight */}
      <path d="M20 34 L40 26 L60 34 L40 42 Z" fill="#7C3AED" opacity="0.6"/>
      {/* Tassel string */}
      <line x1="72" y1="34" x2="72" y2="54" stroke="#F59E0B" strokeWidth="3"/>
      {/* Tassel */}
      <circle cx="72" cy="56" r="5" fill="#F59E0B"/>
      {[68,70,72,74,76].map((x, i) => (
        <line key={i} x1={x} y1="60" x2={x + (i-2)} y2="70" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Base of cap on head */}
      <path d="M26 44 L26 56 Q26 62 40 62 Q54 62 54 56 L54 44" stroke="#6D28D9" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <defs>
        <linearGradient id="capGrad" x1="8" y1="18" x2="72" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED"/>
          <stop offset="1" stopColor="#3B0764"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Grocery — Red basket with veggies */
export function GroceryIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Basket */}
      <path d="M14 40 L20 70 Q20 74 26 74 L54 74 Q60 74 60 70 L66 40 Z" fill="#EF4444"/>
      <path d="M14 40 L20 70 Q20 74 26 74 L54 74 Q60 74 60 70 L66 40 Z" fill="url(#basketGrad)"/>
      {/* Basket weave */}
      <path d="M18 50 L62 50" stroke="#B91C1C" strokeWidth="1.5" opacity="0.5"/>
      <path d="M16 60 L64 60" stroke="#B91C1C" strokeWidth="1.5" opacity="0.5"/>
      <path d="M30 40 L26 74" stroke="#B91C1C" strokeWidth="1.5" opacity="0.4"/>
      <path d="M40 40 L40 74" stroke="#B91C1C" strokeWidth="1.5" opacity="0.4"/>
      <path d="M50 40 L54 74" stroke="#B91C1C" strokeWidth="1.5" opacity="0.4"/>
      {/* Handle */}
      <path d="M24 40 C24 22 56 22 56 40" stroke="#B91C1C" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Carrot */}
      <path d="M38 18 C36 24 32 34 34 38 C36 42 44 40 44 36 C44 30 42 22 38 18 Z" fill="#F97316"/>
      <path d="M34 18 C34 12 40 8 42 14" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M40 16 C42 10 46 12 44 16" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Broccoli */}
      <circle cx="26" cy="32" r="8" fill="#16A34A"/>
      <circle cx="22" cy="36" r="6" fill="#15803D"/>
      <circle cx="30" cy="36" r="6" fill="#15803D"/>
      <rect x="25" y="38" width="4" height="10" rx="2" fill="#166534"/>
      <defs>
        <linearGradient id="basketGrad" x1="14" y1="40" x2="66" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#B91C1C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Pharmacy — Blue medicine bottle */
export function PharmacyIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Bottle body */}
      <rect x="24" y="30" width="32" height="44" rx="8" fill="#3B82F6"/>
      <rect x="24" y="30" width="32" height="44" rx="8" fill="url(#pharmaGrad)"/>
      {/* Label */}
      <rect x="26" y="40" width="28" height="24" rx="4" fill="#fff" opacity="0.9"/>
      {/* Cross on label */}
      <rect x="37" y="43" width="6" height="18" rx="3" fill="#3B82F6"/>
      <rect x="29" y="49" width="22" height="6" rx="3" fill="#3B82F6"/>
      {/* Cap */}
      <rect x="28" y="16" width="24" height="16" rx="6" fill="#1D4ED8"/>
      <rect x="28" y="16" width="24" height="8" rx="6" fill="#2563EB"/>
      {/* Pills */}
      <ellipse cx="52" cy="56" rx="6" ry="4" fill="#EF4444" transform="rotate(-30 52 56)"/>
      <ellipse cx="54" cy="62" rx="6" ry="4" fill="#FCD34D" transform="rotate(20 54 62)"/>
      {/* Shine */}
      <rect x="26" y="32" width="8" height="16" rx="4" fill="#fff" opacity="0.2"/>
      <defs>
        <linearGradient id="pharmaGrad" x1="24" y1="30" x2="56" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Fitness — Black kettlebell */
export function FitnessIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Ball */}
      <circle cx="40" cy="52" r="24" fill="#1F2937"/>
      <circle cx="40" cy="52" r="24" fill="url(#kettleGrad)"/>
      {/* Handle */}
      <path d="M28 30 C28 16 52 16 52 30" stroke="#374151" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M28 30 C28 16 52 16 52 30" stroke="url(#handleGrad)" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Handle highlight */}
      <path d="M30 26 C30 18 50 18 50 26" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
      {/* Shine on ball */}
      <circle cx="32" cy="44" r="6" fill="#fff" opacity="0.12"/>
      <circle cx="29" cy="41" r="3" fill="#fff" opacity="0.15"/>
      <defs>
        <linearGradient id="kettleGrad" x1="16" y1="28" x2="64" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#374151"/>
          <stop offset="1" stopColor="#030712"/>
        </linearGradient>
        <linearGradient id="handleGrad" x1="28" y1="16" x2="52" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4B5563"/>
          <stop offset="1" stopColor="#1F2937"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Travel — Orange suitcase */
export function TravelIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Suitcase body */}
      <rect x="12" y="28" width="56" height="46" rx="10" fill="#F97316"/>
      <rect x="12" y="28" width="56" height="46" rx="10" fill="url(#suitGrad)"/>
      {/* Handle */}
      <path d="M28 28 L28 18 Q28 12 40 12 Q52 12 52 18 L52 28" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Center stripe */}
      <rect x="12" y="46" width="56" height="10" fill="#EA580C" opacity="0.5"/>
      {/* Clasp */}
      <rect x="34" y="44" width="12" height="14" rx="4" fill="#C2410C"/>
      <circle cx="40" cy="52" r="3" fill="#FCD34D"/>
      {/* Horizontal stripes */}
      <rect x="16" y="32" width="48" height="3" rx="1.5" fill="#fff" opacity="0.2"/>
      <rect x="16" y="62" width="48" height="3" rx="1.5" fill="#fff" opacity="0.15"/>
      {/* Wheels */}
      <circle cx="24" cy="74" r="5" fill="#7C2D12"/>
      <circle cx="56" cy="74" r="5" fill="#7C2D12"/>
      <defs>
        <linearGradient id="suitGrad" x1="12" y1="28" x2="68" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C"/>
          <stop offset="1" stopColor="#C2410C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Electronics — Purple headphones */
export function ElectronicsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Headband arc */}
      <path d="M14 44 C14 22 66 22 66 44" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M14 44 C14 22 66 22 66 44" stroke="url(#headbandGrad)" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Left ear cup */}
      <rect x="8" y="42" width="16" height="24" rx="8" fill="#6D28D9"/>
      <rect x="8" y="42" width="16" height="24" rx="8" fill="url(#earCupL)"/>
      <rect x="11" y="46" width="10" height="16" rx="5" fill="#8B5CF6"/>
      {/* Right ear cup */}
      <rect x="56" y="42" width="16" height="24" rx="8" fill="#6D28D9"/>
      <rect x="56" y="42" width="16" height="24" rx="8" fill="url(#earCupR)"/>
      <rect x="59" y="46" width="10" height="16" rx="5" fill="#8B5CF6"/>
      {/* Shine */}
      <ellipse cx="14" cy="50" rx="4" ry="3" fill="#fff" opacity="0.2"/>
      <ellipse cx="62" cy="50" rx="4" ry="3" fill="#fff" opacity="0.2"/>
      <defs>
        <linearGradient id="headbandGrad" x1="14" y1="22" x2="66" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
        <linearGradient id="earCupL" x1="8" y1="42" x2="24" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6"/>
          <stop offset="1" stopColor="#4C1D95"/>
        </linearGradient>
        <linearGradient id="earCupR" x1="56" y1="42" x2="72" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6"/>
          <stop offset="1" stopColor="#4C1D95"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Home Services — Blue house with wrench */
export function HomeServicesIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* House */}
      <path d="M8 38 L40 10 L72 38 L72 72 L8 72 Z" fill="#3B82F6"/>
      <path d="M8 38 L40 10 L72 38 L72 72 L8 72 Z" fill="url(#houseGrad)"/>
      {/* Roof shade */}
      <path d="M8 38 L40 10 L72 38 Z" fill="#2563EB"/>
      {/* Door */}
      <rect x="30" y="50" width="20" height="22" rx="6" fill="#1D4ED8"/>
      <circle cx="46" cy="62" r="2" fill="#BFDBFE"/>
      {/* Window */}
      <rect x="12" y="44" width="14" height="14" rx="4" fill="#BFDBFE"/>
      <line x1="19" y1="44" x2="19" y2="58" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="12" y1="51" x2="26" y2="51" stroke="#93C5FD" strokeWidth="1.5"/>
      {/* Wrench badge */}
      <circle cx="58" cy="58" r="14" fill="#FEF3C7"/>
      <path d="M52 52 L60 60" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
      <path d="M58 48 C56 46 58 42 62 44 C60 43 59 45 60 47 L62 49 C64 50 62 54 60 52 L58 48 Z" fill="#F59E0B"/>
      <defs>
        <linearGradient id="houseGrad" x1="8" y1="10" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Beauty — Pink cosmetic bottle */
export function BeautyIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Bottle body */}
      <rect x="24" y="30" width="32" height="44" rx="10" fill="#EC4899"/>
      <rect x="24" y="30" width="32" height="44" rx="10" fill="url(#beautyGrad)"/>
      {/* Pump head */}
      <rect x="33" y="14" width="14" height="18" rx="5" fill="#DB2777"/>
      <rect x="36" y="8" width="8" height="8" rx="4" fill="#9D174D"/>
      {/* Pump nozzle */}
      <rect x="42" y="10" width="16" height="5" rx="2.5" fill="#9D174D"/>
      {/* Label heart */}
      <path d="M40 46 C40 46 32 40 32 35 C32 32 34 30 36 30 C38 30 39 31 40 33 C41 31 42 30 44 30 C46 30 48 32 48 35 C48 40 40 46 40 46 Z" fill="#fff" opacity="0.9"/>
      {/* Shine */}
      <rect x="26" y="32" width="8" height="20" rx="4" fill="#fff" opacity="0.2"/>
      <defs>
        <linearGradient id="beautyGrad" x1="24" y1="30" x2="56" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6"/>
          <stop offset="1" stopColor="#BE185D"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Entertainment — Popcorn */
export function EntertainmentIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Box */}
      <path d="M18 36 L22 72 L58 72 L62 36 Z" fill="#EF4444"/>
      <path d="M18 36 L22 72 L58 72 L62 36 Z" fill="url(#popcornBox)"/>
      {/* Box stripes */}
      <path d="M28 36 L24 72" stroke="#fff" strokeWidth="8" opacity="0.3"/>
      <path d="M40 36 L40 72" stroke="#fff" strokeWidth="8" opacity="0.3"/>
      <path d="M52 36 L56 72" stroke="#fff" strokeWidth="8" opacity="0.3"/>
      {/* Top flap */}
      <rect x="16" y="30" width="48" height="10" rx="4" fill="#DC2626"/>
      {/* Popcorn kernels */}
      <circle cx="30" cy="22" r="9" fill="#FEF3C7"/>
      <circle cx="40" cy="16" r="9" fill="#FEF3C7"/>
      <circle cx="50" cy="22" r="9" fill="#FEF3C7"/>
      <circle cx="25" cy="30" r="7" fill="#FEF3C7"/>
      <circle cx="55" cy="30" r="7" fill="#FEF3C7"/>
      {/* Kernel highlights */}
      <circle cx="28" cy="20" r="3" fill="#fff" opacity="0.5"/>
      <circle cx="38" cy="14" r="3" fill="#fff" opacity="0.5"/>
      <circle cx="48" cy="20" r="3" fill="#fff" opacity="0.5"/>
      <defs>
        <linearGradient id="popcornBox" x1="18" y1="36" x2="62" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#B91C1C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Books */
export function BooksIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Back book - green */}
      <rect x="36" y="16" width="28" height="52" rx="5" fill="#16A34A"/>
      <rect x="36" y="16" width="6" height="52" rx="3" fill="#15803D"/>
      {/* Middle book - orange */}
      <rect x="20" y="22" width="26" height="50" rx="5" fill="#F97316"/>
      <rect x="20" y="22" width="6" height="50" rx="3" fill="#EA580C"/>
      {/* Front book - blue */}
      <rect x="8" y="28" width="22" height="44" rx="5" fill="#3B82F6"/>
      <rect x="8" y="28" width="6" height="44" rx="3" fill="#2563EB"/>
      {/* Lines on front */}
      <rect x="17" y="36" width="10" height="2" rx="1" fill="#fff" opacity="0.5"/>
      <rect x="17" y="42" width="8" height="2" rx="1" fill="#fff" opacity="0.4"/>
      <rect x="17" y="48" width="10" height="2" rx="1" fill="#fff" opacity="0.3"/>
    </Icon>
  );
}

/** Stationery — Colored pencils */
export function StationeryIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Cup */}
      <path d="M20 40 L24 74 L56 74 L60 40 Z" fill="#60A5FA"/>
      <rect x="18" y="34" width="44" height="10" rx="5" fill="#3B82F6"/>
      {/* Pencils */}
      {[
        { x: 28, color: '#EF4444', dark: '#B91C1C' },
        { x: 36, color: '#F59E0B', dark: '#B45309' },
        { x: 44, color: '#10B981', dark: '#065F46' },
      ].map(({ x, color, dark }) => (
        <g key={x}>
          <rect x={x - 3} y="8" width="6" height="30" rx="3" fill={color}/>
          <polygon points={`${x-3},38 ${x+3},38 ${x},46`} fill="#FEF3C7"/>
          <rect x={x - 3} y="8" width="6" height="4" rx="3" fill={dark}/>
        </g>
      ))}
    </Icon>
  );
}

/** Sports — Soccer ball */
export function SportsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      <circle cx="40" cy="40" r="30" fill="#fff"/>
      <circle cx="40" cy="40" r="30" fill="url(#ballGrad)"/>
      {/* Pentagon patches */}
      <path d="M40 14 L48 22 L44 32 L36 32 L32 22 Z" fill="#1C1917"/>
      <path d="M60 30 L68 38 L64 48 L54 46 L52 36 Z" fill="#1C1917"/>
      <path d="M56 58 L60 68 L50 70 L44 62 L48 52 Z" fill="#1C1917"/>
      <path d="M24 58 L20 68 L30 70 L36 62 L32 52 Z" fill="#1C1917"/>
      <path d="M20 30 L12 38 L16 48 L26 46 L28 36 Z" fill="#1C1917"/>
      {/* Seams */}
      <line x1="40" y1="32" x2="44" y2="36" stroke="#fff" strokeWidth="1.5"/>
      <line x1="40" y1="32" x2="36" y2="36" stroke="#fff" strokeWidth="1.5"/>
      {/* Shine */}
      <ellipse cx="32" cy="28" rx="8" ry="5" fill="#fff" opacity="0.3" transform="rotate(-20 32 28)"/>
      <defs>
        <radialGradient id="ballGrad" cx="0.35" cy="0.3" r="0.7">
          <stop stopColor="#fff" stopOpacity="0.1"/>
          <stop offset="1" stopColor="#D1D5DB" stopOpacity="0.3"/>
        </radialGradient>
      </defs>
    </Icon>
  );
}

/** Music — Purple music note */
export function MusicIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Note stems */}
      <rect x="44" y="12" width="6" height="38" rx="3" fill="#7C3AED"/>
      <rect x="44" y="12" width="6" height="38" rx="3" fill="url(#noteGrad)"/>
      {/* Note beam */}
      <rect x="44" y="12" width="20" height="8" rx="4" fill="#6D28D9"/>
      {/* Right note head */}
      <ellipse cx="60" cy="44" rx="8" ry="6" fill="#7C3AED" transform="rotate(-20 60 44)"/>
      <rect x="64" y="20" width="6" height="30" rx="3" fill="#7C3AED"/>
      {/* Left note head */}
      <ellipse cx="40" cy="50" rx="8" ry="6" fill="#8B5CF6" transform="rotate(-20 40 50)"/>
      {/* Shine */}
      <ellipse cx="38" cy="48" rx="4" ry="3" fill="#fff" opacity="0.25" transform="rotate(-20 38 48)"/>
      <defs>
        <linearGradient id="noteGrad" x1="44" y1="12" x2="44" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Art & Craft — Paint palette */
export function ArtIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Palette */}
      <path d="M10 40 C10 24 22 12 40 12 C58 12 70 24 70 38 C70 46 64 52 56 52 L52 52 C48 52 46 54 46 58 C46 62 48 66 44 68 C32 70 10 58 10 40 Z" fill="#FEF3C7"/>
      <path d="M10 40 C10 24 22 12 40 12 C58 12 70 24 70 38 C70 46 64 52 56 52 L52 52 C48 52 46 54 46 58 C46 62 48 66 44 68 C32 70 10 58 10 40 Z" fill="url(#paletteGrad)"/>
      {/* Color dots */}
      <circle cx="24" cy="26" r="7" fill="#EF4444"/>
      <circle cx="40" cy="18" r="7" fill="#F59E0B"/>
      <circle cx="56" cy="26" r="7" fill="#3B82F6"/>
      <circle cx="60" cy="42" r="7" fill="#10B981"/>
      <circle cx="20" cy="44" r="7" fill="#8B5CF6"/>
      {/* Thumb hole */}
      <circle cx="44" cy="60" r="7" fill="rgba(0,0,0,0.08)"/>
      <circle cx="44" cy="60" r="5" fill="#FEF3C7"/>
      <defs>
        <linearGradient id="paletteGrad" x1="10" y1="12" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#FDE68A" stopOpacity="0.5"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Photography — Blue camera */
export function PhotographyIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Camera body */}
      <rect x="8" y="28" width="64" height="44" rx="10" fill="#3B82F6"/>
      <rect x="8" y="28" width="64" height="44" rx="10" fill="url(#camGrad)"/>
      {/* Viewfinder hump */}
      <rect x="26" y="18" width="28" height="14" rx="7" fill="#2563EB"/>
      {/* Flash */}
      <rect x="14" y="22" width="8" height="8" rx="3" fill="#FDE68A"/>
      {/* Lens outer */}
      <circle cx="40" cy="52" r="18" fill="#1D4ED8"/>
      <circle cx="40" cy="52" r="14" fill="#1E40AF"/>
      <circle cx="40" cy="52" r="10" fill="#1E3A8A"/>
      {/* Lens reflection */}
      <circle cx="40" cy="52" r="6" fill="#3B82F6" opacity="0.5"/>
      <circle cx="35" cy="47" r="3" fill="#fff" opacity="0.35"/>
      {/* Shutter button */}
      <circle cx="60" cy="34" r="5" fill="#1D4ED8"/>
      <circle cx="60" cy="34" r="3" fill="#2563EB"/>
      <defs>
        <linearGradient id="camGrad" x1="8" y1="28" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Real Estate — Blue house */
export function RealEstateIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* House body */}
      <rect x="14" y="38" width="52" height="36" rx="8" fill="#3B82F6"/>
      <rect x="14" y="38" width="52" height="36" rx="8" fill="url(#reGrad)"/>
      {/* Roof */}
      <path d="M6 40 L40 10 L74 40 Z" fill="#2563EB"/>
      <path d="M6 40 L40 10 L74 40 Z" fill="url(#reRoof)"/>
      {/* Door */}
      <rect x="32" y="54" width="16" height="20" rx="5" fill="#1D4ED8"/>
      <circle cx="44" cy="65" r="2" fill="#BFDBFE"/>
      {/* Windows */}
      <rect x="18" y="44" width="12" height="12" rx="4" fill="#BFDBFE"/>
      <line x1="24" y1="44" x2="24" y2="56" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="18" y1="50" x2="30" y2="50" stroke="#93C5FD" strokeWidth="1.5"/>
      <rect x="50" y="44" width="12" height="12" rx="4" fill="#BFDBFE"/>
      <line x1="56" y1="44" x2="56" y2="56" stroke="#93C5FD" strokeWidth="1.5"/>
      <line x1="50" y1="50" x2="62" y2="50" stroke="#93C5FD" strokeWidth="1.5"/>
      {/* Chimney */}
      <rect x="52" y="16" width="8" height="18" rx="3" fill="#1D4ED8"/>
      <defs>
        <linearGradient id="reGrad" x1="14" y1="38" x2="66" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
        <linearGradient id="reRoof" x1="6" y1="10" x2="74" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6"/>
          <stop offset="1" stopColor="#1E40AF"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Others — Colored circles */
export function OthersIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      <circle cx="28" cy="28" r="16" fill="#3B82F6"/>
      <circle cx="28" cy="28" r="16" fill="url(#othersB)"/>
      <circle cx="52" cy="28" r="16" fill="#10B981"/>
      <circle cx="28" cy="52" r="16" fill="#F59E0B"/>
      <circle cx="52" cy="52" r="16" fill="#EF4444"/>
      {/* Shine */}
      <ellipse cx="24" cy="23" rx="5" ry="3" fill="#fff" opacity="0.3"/>
      <ellipse cx="48" cy="23" rx="5" ry="3" fill="#fff" opacity="0.3"/>
      <defs>
        <linearGradient id="othersB" x1="12" y1="12" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Roommates — Two people */
export function RoommatesIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Back person */}
      <circle cx="50" cy="24" r="12" fill="#A78BFA"/>
      <path d="M34 74 C34 56 66 56 66 74" fill="#8B5CF6"/>
      {/* Front person */}
      <circle cx="30" cy="28" r="14" fill="#7C3AED"/>
      <circle cx="30" cy="28" r="14" fill="url(#roomGrad)"/>
      <path d="M10 74 C10 54 50 54 50 74" fill="#6D28D9"/>
      <path d="M10 74 C10 54 50 54 50 74" fill="url(#roomBody)"/>
      {/* Eye detail front */}
      <circle cx="25" cy="26" r="2.5" fill="#fff"/>
      <circle cx="35" cy="26" r="2.5" fill="#fff"/>
      <defs>
        <linearGradient id="roomGrad" x1="16" y1="14" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
        <linearGradient id="roomBody" x1="10" y1="54" x2="50" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED"/>
          <stop offset="1" stopColor="#4C1D95"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/* ══════════════════════════════════════════════════════════════════
   UI / NAVIGATION ICONS  (matching Image 1 reference)
══════════════════════════════════════════════════════════════════ */

/** Community / Group — Purple people */
export function CommunityIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Right person */}
      <circle cx="56" cy="26" r="11" fill="#A78BFA"/>
      <path d="M40 72 C40 56 72 56 72 72" fill="#8B5CF6"/>
      {/* Left person */}
      <circle cx="24" cy="26" r="11" fill="#A78BFA"/>
      <path d="M8 72 C8 56 40 56 40 72" fill="#8B5CF6"/>
      {/* Center person (largest) */}
      <circle cx="40" cy="22" r="14" fill="#7C3AED"/>
      <circle cx="40" cy="22" r="14" fill="url(#commGrad)"/>
      <path d="M18 74 C18 54 62 54 62 74" fill="#6D28D9"/>
      <defs>
        <linearGradient id="commGrad" x1="26" y1="8" x2="54" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Announcements / Megaphone */
export function AnnouncementsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Megaphone cone */}
      <path d="M36 28 L64 12 L64 56 L36 44 Z" fill="#EF4444"/>
      <path d="M36 28 L64 12 L64 56 L36 44 Z" fill="url(#megaGrad)"/>
      {/* Body */}
      <rect x="18" y="28" width="20" height="16" rx="5" fill="#DC2626"/>
      {/* Speaker circle */}
      <circle cx="66" cy="34" r="8" fill="#B91C1C"/>
      <circle cx="66" cy="34" r="5" fill="#EF4444"/>
      {/* Handle */}
      <path d="M22 44 L18 64" stroke="#B91C1C" strokeWidth="8" strokeLinecap="round"/>
      {/* Sound waves */}
      <path d="M68 24 C72 26 74 30 72 34" stroke="#FCA5A5" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M70 18 C76 21 80 28 76 36" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Shine */}
      <path d="M40 16 L60 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <defs>
        <linearGradient id="megaGrad" x1="36" y1="12" x2="64" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#B91C1C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Messages / Chat bubble */
export function MessagesIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Bubble */}
      <path d="M10 16 Q10 10 16 10 L64 10 Q70 10 70 16 L70 50 Q70 56 64 56 L30 56 L16 70 L18 56 L16 56 Q10 56 10 50 Z" fill="#C4B5FD"/>
      <path d="M10 16 Q10 10 16 10 L64 10 Q70 10 70 16 L70 50 Q70 56 64 56 L30 56 L16 70 L18 56 L16 56 Q10 56 10 50 Z" fill="url(#msgGrad)"/>
      {/* Dots */}
      <circle cx="28" cy="34" r="5" fill="#fff" opacity="0.9"/>
      <circle cx="40" cy="34" r="5" fill="#fff" opacity="0.9"/>
      <circle cx="52" cy="34" r="5" fill="#fff" opacity="0.9"/>
      <defs>
        <linearGradient id="msgGrad" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DDD6FE"/>
          <stop offset="1" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Settings / Gear */
export function SettingsIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Gear */}
      <path d="M40 8 L44 14 L50 12 L54 18 L60 18 L62 24 L68 26 L68 32 L74 36 L70 42 L74 48 L68 52 L68 58 L62 60 L60 66 L54 66 L50 72 L44 70 L40 76 L36 70 L30 72 L26 66 L20 66 L18 60 L12 58 L12 52 L6 48 L10 42 L6 36 L12 32 L12 26 L18 24 L20 18 L26 18 L30 12 L36 14 Z" fill="#94A3B8"/>
      <path d="M40 8 L44 14 L50 12 L54 18 L60 18 L62 24 L68 26 L68 32 L74 36 L70 42 L74 48 L68 52 L68 58 L62 60 L60 66 L54 66 L50 72 L44 70 L40 76 L36 70 L30 72 L26 66 L20 66 L18 60 L12 58 L12 52 L6 48 L10 42 L6 36 L12 32 L12 26 L18 24 L20 18 L26 18 L30 12 L36 14 Z" fill="url(#gearGrad)"/>
      <circle cx="40" cy="42" r="13" fill="#CBD5E1"/>
      <circle cx="40" cy="42" r="9" fill="#E2E8F0"/>
      <circle cx="40" cy="42" r="6" fill="#94A3B8" opacity="0.5"/>
      <defs>
        <linearGradient id="gearGrad" x1="6" y1="8" x2="74" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1"/>
          <stop offset="1" stopColor="#64748B"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Bookmarks */
export function BookmarkIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Bookmark ribbon */}
      <path d="M16 8 L64 8 Q68 8 68 12 L68 72 L40 56 L12 72 L12 12 Q12 8 16 8 Z" fill="#EF4444"/>
      <path d="M16 8 L64 8 Q68 8 68 12 L68 72 L40 56 L12 72 L12 12 Q12 8 16 8 Z" fill="url(#bookmarkGrad)"/>
      {/* Star */}
      <path d="M40 22 L43 32 L53 32 L45 38 L48 48 L40 42 L32 48 L35 38 L27 32 L37 32 Z" fill="#fff" opacity="0.95"/>
      {/* Shine */}
      <rect x="14" y="10" width="16" height="6" rx="3" fill="#fff" opacity="0.2"/>
      <defs>
        <linearGradient id="bookmarkGrad" x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#B91C1C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Ticket */
export function TicketIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Ticket body */}
      <path d="M8 26 Q8 18 16 18 L64 18 Q72 18 72 26 L72 32 Q66 32 66 38 Q66 44 72 44 L72 54 Q72 62 64 62 L16 62 Q8 62 8 54 L8 44 Q14 44 14 38 Q14 32 8 32 Z" fill="#EC4899"/>
      <path d="M8 26 Q8 18 16 18 L64 18 Q72 18 72 26 L72 32 Q66 32 66 38 Q66 44 72 44 L72 54 Q72 62 64 62 L16 62 Q8 62 8 54 L8 44 Q14 44 14 38 Q14 32 8 32 Z" fill="url(#ticketGrad)"/>
      {/* Dashed center line */}
      {[22,28,34,40,46,52,58].map(x => (
        <rect key={x} x={x} y="37" width="4" height="2" rx="1" fill="#fff" opacity="0.5"/>
      ))}
      {/* Star */}
      <path d="M40 26 L42 32 L48 32 L43 36 L45 42 L40 38 L35 42 L37 36 L32 32 L38 32 Z" fill="#fff" opacity="0.9"/>
      <defs>
        <linearGradient id="ticketGrad" x1="8" y1="18" x2="72" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6"/>
          <stop offset="1" stopColor="#BE185D"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Profile / Clipboard */
export function ProfileIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Clipboard */}
      <rect x="12" y="16" width="56" height="60" rx="8" fill="#FEF3C7"/>
      <rect x="12" y="16" width="56" height="60" rx="8" fill="url(#clipGrad)"/>
      {/* Clip */}
      <rect x="28" y="8" width="24" height="18" rx="6" fill="#D97706"/>
      <rect x="32" y="12" width="16" height="10" rx="4" fill="#F59E0B"/>
      {/* Lines */}
      <rect x="22" y="36" width="36" height="4" rx="2" fill="#D97706" opacity="0.5"/>
      <rect x="22" y="46" width="28" height="4" rx="2" fill="#D97706" opacity="0.4"/>
      <rect x="22" y="56" width="32" height="4" rx="2" fill="#D97706" opacity="0.3"/>
      <rect x="22" y="66" width="20" height="4" rx="2" fill="#D97706" opacity="0.25"/>
      <defs>
        <linearGradient id="clipGrad" x1="12" y1="16" x2="68" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.5"/>
          <stop offset="1" stopColor="#FDE68A" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Search / Magnifying glass */
export function SearchIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Glass body */}
      <circle cx="34" cy="34" r="22" fill="#BFDBFE"/>
      <circle cx="34" cy="34" r="22" fill="url(#searchGrad)"/>
      <circle cx="34" cy="34" r="17" fill="#EFF6FF"/>
      {/* Inner reflection */}
      <ellipse cx="28" cy="27" rx="7" ry="5" fill="#fff" opacity="0.6" transform="rotate(-20 28 27)"/>
      {/* Handle */}
      <path d="M51 51 L68 68" stroke="#7C3AED" strokeWidth="10" strokeLinecap="round"/>
      <path d="M51 51 L68 68" stroke="url(#handleSearchGrad)" strokeWidth="10" strokeLinecap="round"/>
      <defs>
        <linearGradient id="searchGrad" x1="12" y1="12" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD"/>
          <stop offset="1" stopColor="#3B82F6"/>
        </linearGradient>
        <linearGradient id="handleSearchGrad" x1="51" y1="51" x2="68" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Emergency / SOS */
export function EmergencyIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Red square */}
      <rect x="6" y="6" width="68" height="68" rx="18" fill="#EF4444"/>
      <rect x="6" y="6" width="68" height="68" rx="18" fill="url(#sosGrad)"/>
      {/* SOS text */}
      <text x="40" y="52" textAnchor="middle" fill="#fff" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="26" letterSpacing="-1">SOS</text>
      {/* Shine */}
      <rect x="10" y="10" width="40" height="16" rx="10" fill="#fff" opacity="0.15"/>
      <defs>
        <linearGradient id="sosGrad" x1="6" y1="6" x2="74" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F87171"/>
          <stop offset="1" stopColor="#B91C1C"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Login / Door */
export function LoginIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* Door frame */}
      <rect x="14" y="8" width="52" height="66" rx="6" fill="#D97706"/>
      <rect x="14" y="8" width="52" height="66" rx="6" fill="url(#doorFrame)"/>
      {/* Door panel */}
      <rect x="18" y="12" width="44" height="58" rx="5" fill="#F59E0B"/>
      <rect x="18" y="12" width="44" height="58" rx="5" fill="url(#doorPanel)"/>
      {/* Door panels */}
      <rect x="22" y="18" width="36" height="20" rx="4" fill="#FCD34D" opacity="0.5"/>
      <rect x="22" y="44" width="36" height="20" rx="4" fill="#FCD34D" opacity="0.5"/>
      {/* Knob */}
      <circle cx="54" cy="44" r="5" fill="#92400E"/>
      <circle cx="54" cy="44" r="3" fill="#B45309"/>
      {/* Keyhole */}
      <circle cx="54" cy="42" r="2" fill="#78350F"/>
      <path d="M52 44 L56 44 L55 48 L53 48 Z" fill="#78350F"/>
      {/* Shine */}
      <rect x="20" y="14" width="10" height="20" rx="3" fill="#fff" opacity="0.15"/>
      <defs>
        <linearGradient id="doorFrame" x1="14" y1="8" x2="66" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24"/>
          <stop offset="1" stopColor="#92400E"/>
        </linearGradient>
        <linearGradient id="doorPanel" x1="18" y1="12" x2="62" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A"/>
          <stop offset="1" stopColor="#D97706"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Home navigation icon */
export function HomeNavIcon({ size = 48, ...rest }) {
  return (
    <Icon size={size} {...rest}>
      {/* House */}
      <path d="M8 38 L40 10 L72 38 L66 38 L66 72 L14 72 L14 38 Z" fill="#7C3AED"/>
      <path d="M8 38 L40 10 L72 38 L66 38 L66 72 L14 72 L14 38 Z" fill="url(#homeNavGrad)"/>
      {/* Roof */}
      <path d="M8 38 L40 10 L72 38 Z" fill="#6D28D9"/>
      {/* Door */}
      <rect x="30" y="50" width="20" height="22" rx="5" fill="#EDE9FE"/>
      {/* Window */}
      <rect x="14" y="44" width="12" height="12" rx="3" fill="#C4B5FD"/>
      <rect x="54" y="44" width="12" height="12" rx="3" fill="#C4B5FD"/>
      {/* Chimney */}
      <rect x="52" y="14" width="6" height="16" rx="3" fill="#5B21B6"/>
      <defs>
        <linearGradient id="homeNavGrad" x1="8" y1="10" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA"/>
          <stop offset="1" stopColor="#4C1D95"/>
        </linearGradient>
      </defs>
    </Icon>
  );
}

/** Sell an item / Price tag (for post sheet) */
export function SellIcon({ size = 48, ...rest }) {
  return <BuySellIcon size={size} {...rest} />;
}

/** Offer a Ride (for post sheet) */
export function OfferRideIcon({ size = 48, ...rest }) {
  return <RidesIcon size={size} {...rest} />;
}

/** Find Roommate (for post sheet) */
export function FindRoommateIcon({ size = 48, ...rest }) {
  return <RoommatesIcon size={size} {...rest} />;
}

/** Create Event (for post sheet) */
export function CreateEventIcon({ size = 48, ...rest }) {
  return <EventsIcon size={size} {...rest} />;
}

/** Register Business / PG (for post sheet) */
export function RegisterBusinessIcon({ size = 48, ...rest }) {
  return <HomeNavIcon size={size} {...rest} />;
}

/** Community Post (for post sheet) */
export function CommunityPostIcon({ size = 48, ...rest }) {
  return <CommunityIcon size={size} {...rest} />;
}

/* ══════════════════════════════════════════════════════════════════
   DEFAULT EXPORT: named map for dynamic usage
══════════════════════════════════════════════════════════════════ */
export const ICON_MAP = {
  pg:           PGIcon,
  gym:          GymIcon,
  shops:        ShopsIcon,
  cafes:        CafesIcon,
  buysell:      BuySellIcon,
  rides:        RidesIcon,
  events:       EventsIcon,
  services:     ServicesIcon,
  hospital:     HospitalIcon,
  medical:      MedicalIcon,
  laundry:      LaundryIcon,
  salon:        SalonIcon,
  food:         FoodIcon,
  pets:         PetsIcon,
  jobs:         JobsIcon,
  education:    EducationIcon,
  grocery:      GroceryIcon,
  pharmacy:     PharmacyIcon,
  fitness:      FitnessIcon,
  travel:       TravelIcon,
  electronics:  ElectronicsIcon,
  homeservices: HomeServicesIcon,
  beauty:       BeautyIcon,
  entertainment:EntertainmentIcon,
  books:        BooksIcon,
  stationery:   StationeryIcon,
  sports:       SportsIcon,
  music:        MusicIcon,
  art:          ArtIcon,
  photography:  PhotographyIcon,
  realestate:   RealEstateIcon,
  others:       OthersIcon,
  roommates:    RoommatesIcon,
  community:    CommunityIcon,
  announcements:AnnouncementsIcon,
  messages:     MessagesIcon,
  settings:     SettingsIcon,
  bookmark:     BookmarkIcon,
  ticket:       TicketIcon,
  profile:      ProfileIcon,
  search:       SearchIcon,
  emergency:    EmergencyIcon,
  login:        LoginIcon,
  home:         HomeNavIcon,
};
