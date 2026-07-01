/**
 * DiscussionHeader.jsx — Community module (Segment 3)
 * Reusable section header: emoji or channel icon + title, with an optional
 * "Create Discussion" action. Used for a single channel's discussion list
 * AND for each row of General's discovery hub (Trending / Recently Active /
 * Popular).
 */
import { motion } from 'framer-motion';

export default function DiscussionHeader({ icon = '🗨️', iconSrc, title, onCreate }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {iconSrc
          ? <img src={iconSrc} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
          : <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{title}</span>
      </div>
      {onCreate && (
        <motion.button
          onClick={onCreate}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg, #6D4AFF, #9B6AFF)',
            color: '#fff', border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 12.5, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.28)', flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1, fontWeight: 400 }}>+</span> Create Discussion
        </motion.button>
      )}
    </div>
  );
}
