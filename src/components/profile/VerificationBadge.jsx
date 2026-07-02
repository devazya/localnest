/**
 * VerificationBadge.jsx — Trust & Reputation System (Segment 5.2)
 * Reusable verification indicator. Supports every verification type the
 * segment names — types without live data today (society, pg_owner)
 * simply never get passed in until that data exists.
 */
const TYPE_META = {
  resident: { icon: '🧑‍🤝‍🧑', label: 'Verified Resident', color: '#6D4AFF' },
  business: { icon: '🏢', label: 'Verified Business',  color: '#0EA5E9' },
  shop:     { icon: '🛍️', label: 'Verified Shop',      color: '#F59E0B' },
  gym:      { icon: '💪', label: 'Verified Gym',        color: '#16A34A' },
  society:  { icon: '🏘️', label: 'Verified Society',   color: '#7C3AED' },
  pg_owner: { icon: '🏡', label: 'Verified PG Owner',   color: '#DB2777' },
};

export default function VerificationBadge({ type, label, size = 'md' }) {
  const meta = TYPE_META[type] || TYPE_META.resident;
  const font = size === 'sm' ? 11 : 12.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: font, fontWeight: 700, color: meta.color,
      background: `${meta.color}14`, border: `1px solid ${meta.color}30`,
      padding: size === 'sm' ? '3px 9px' : '5px 11px', borderRadius: 999,
    }}>
      <span style={{ fontSize: font + 2 }}>{meta.icon}</span>
      {label || meta.label}
    </span>
  );
}

export { TYPE_META as VERIFICATION_TYPE_META };
