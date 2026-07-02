/**
 * BadgeRow.jsx — Trust & Reputation System (Segment 5.2)
 * 3 featured badges + "View All" trigger. Reusable anywhere a compact
 * badge summary is needed (profile, preview sheet).
 */
export default function BadgeRow({ badges = [], onViewAll, size = 'md' }) {
  if (!badges.length) return null;
  const featured = badges.slice(0, 3);
  const remaining = badges.length - featured.length;
  const dim = size === 'sm' ? 30 : 38;
  const font = size === 'sm' ? 15 : 18;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {featured.map(b => (
        <div key={b.key} title={b.label} style={{
          width: dim, height: dim, borderRadius: dim / 2.6, background: '#F5F4FF',
          border: '1.5px solid #EDE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: font, flexShrink: 0,
        }}>
          {b.icon}
        </div>
      ))}
      {(remaining > 0 || onViewAll) && (
        <button onClick={onViewAll} style={{
          background: 'none', border: 'none', cursor: onViewAll ? 'pointer' : 'default',
          fontSize: 12, fontWeight: 700, color: '#6D4AFF', padding: '4px 8px',
        }}>
          {remaining > 0 ? `+${remaining} · View All` : 'View All'}
        </button>
      )}
    </div>
  );
}
