/**
 * BadgeRow.jsx — Trust & Reputation System (Segment 5.2)
 * Featured badges rendered as lifted, colour-coded icon+label tiles
 * (matches the reference design exactly — each badge gets its own
 * accent colour from BADGE_CATALOG), plus a "+N More" tile that opens
 * the full badge sheet. Reusable anywhere a compact badge summary is
 * needed (profile, preview sheet).
 */
export default function BadgeRow({ badges = [], onViewAll, size = 'md' }) {
  if (!badges.length) return null;
  const featured = badges.slice(0, 3);
  const remaining = badges.length - featured.length;
  const sm = size === 'sm';

  const liftShadow = '0 8px 16px -6px rgba(76,29,149,0.18), 0 1.5px 3px rgba(76,29,149,0.06)';

  const tileStyle = {
    display: 'flex', alignItems: 'center', gap: sm ? 8 : 10,
    background: '#fff', border: '1px solid #F0EEFF', borderRadius: 16,
    padding: sm ? '8px 10px' : '11px 13px', flex: '1 1 0', minWidth: 0,
    boxShadow: liftShadow,
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {featured.map(b => (
        <div key={b.key} title={b.label} style={tileStyle}>
          <div style={{
            width: sm ? 30 : 36, height: sm ? 30 : 36, borderRadius: '50%',
            background: b.iconBg || '#F5F4FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: sm ? 14 : 17, flexShrink: 0,
            boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          }}>
            {b.icon}
          </div>
          <span style={{ fontSize: sm ? 11.5 : 12.5, fontWeight: 700, color: '#0D0820', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {b.label}
          </span>
        </div>
      ))}
      {remaining > 0 && (
        <button
          onClick={onViewAll}
          style={{
            ...tileStyle, flex: '0 0 auto', minWidth: sm ? 56 : 66, cursor: onViewAll ? 'pointer' : 'default',
            border: '1.5px solid #EDE7FF', background: '#F8F6FF', flexDirection: 'column', gap: 2,
            justifyContent: 'center', textAlign: 'center',
          }}
        >
          <span style={{ fontSize: sm ? 14 : 17, fontWeight: 800, color: '#6D4AFF', lineHeight: 1 }}>+{remaining}</span>
          <span style={{ fontSize: sm ? 9.5 : 10.5, fontWeight: 600, color: '#9CA3AF' }}>More</span>
        </button>
      )}
    </div>
  );
}
