/**
 * TimelineItem.jsx — Trust & Reputation System (Segment 5.2)
 * Single row inside ContributionTimeline. Icon + title + short
 * description + relative time. Taps navigate to the related content
 * when a link is available.
 */
export default function TimelineItem({ item, onClick, isLast }) {
  const clickable = !!(item.link && onClick);

  return (
    <button
      onClick={clickable ? () => onClick(item.link) : undefined}
      disabled={!clickable}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        width: '100%', textAlign: 'left', background: 'none', border: 'none',
        padding: '10px 2px', cursor: clickable ? 'pointer' : 'default',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11, background: '#F5F4FF',
          border: '1.5px solid #EDE9FF', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, flexShrink: 0,
        }}>
          {item.icon}
        </div>
        {!isLast && <div style={{ width: 1.5, flex: 1, minHeight: 14, background: '#F0EEFF', marginTop: 4 }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
        <div style={{ fontSize: 13.5, color: '#0D0820', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 700 }}>{item.action}</span>{' '}
          <span style={{ fontWeight: 600 }}>{item.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500 }}>{item.desc}</span>
          <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{item.relativeTime}</span>
        </div>
      </div>

      {clickable && (
        <svg style={{ opacity: 0.25, flexShrink: 0, marginTop: 8 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}
