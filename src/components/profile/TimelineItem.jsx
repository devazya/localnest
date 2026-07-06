/**
 * TimelineItem.jsx — Trust & Reputation System (Segment 5.2)
 * Single row inside ContributionTimeline. Icon + title + short
 * description + relative time. Taps navigate to the related content
 * when a link is available. Visual polish only — same data, same click
 * behaviour, larger icon and a real card feel (background + shadow on
 * hover/press) so each row reads as tappable.
 */
import { motion } from 'framer-motion';

export default function TimelineItem({ item, onClick, isLast }) {
  const clickable = !!(item.link && onClick);

  return (
    <motion.button
      whileTap={clickable ? { scale: 0.985 } : undefined}
      onClick={clickable ? () => onClick(item.link) : undefined}
      disabled={!clickable}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #F3F1FF',
        borderRadius: 16, padding: '14px 14px', cursor: clickable ? 'pointer' : 'default',
        marginBottom: isLast ? 0 : 8,
        boxShadow: '0 4px 10px -4px rgba(45,15,120,0.1)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, background: '#F5F4FF',
        border: '1.5px solid #EDE9FF', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>
        {item.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: '#0D0820', lineHeight: 1.35 }}>
          <span style={{ fontWeight: 700 }}>{item.action}</span>{' '}
          <span style={{ fontWeight: 600 }}>{item.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{item.desc}</span>
          <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{item.relativeTime}</span>
        </div>
      </div>

      {clickable && (
        <svg style={{ opacity: 0.3, flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </motion.button>
  );
}
