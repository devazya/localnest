/**
 * LiveActivityPlaceholder.jsx — Community module (Segment 1)
 * Reserves the vertical space planned for the future Live Activity Strip
 * (Segment 2) so the layout never shifts when that feature lands.
 * Presentation only — no data, no logic.
 */

import { motion } from 'framer-motion';

export default function LiveActivityPlaceholder() {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid rgba(109,74,255,0.07)', padding: '12px 16px', flexShrink: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #F8F7FF 0%, #F1EEFF 100%)',
          border: '1.5px dashed rgba(109,74,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#9B6AFF', animation: 'livePulse 2s ease-in-out infinite' }} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6D4AFF', fontFamily: 'var(--font-display)' }}>Live Activity</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Coming in Segment 2</div>
        </div>
      </motion.div>
    </div>
  );
}
