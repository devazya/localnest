/**
 * TrustLevel.jsx — Trust & Reputation System (Segment 5.2)
 * Small reusable label: "Trusted Resident", "Helpful Neighbour", etc.
 * Never Level / XP / Points — just the trust label.
 */
export default function TrustLevel({ label, size = 'md', light = false }) {
  const font = size === 'sm' ? 11.5 : 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: font, fontWeight: 700, letterSpacing: 0.2,
      color: light ? 'rgba(255,255,255,0.92)' : '#6D4AFF',
      background: light ? 'rgba(255,255,255,0.16)' : '#F3F0FF',
      padding: size === 'sm' ? '4px 10px' : '5px 12px',
      borderRadius: 999,
      backdropFilter: light ? 'blur(6px)' : undefined,
    }}>
      {label}
    </span>
  );
}
