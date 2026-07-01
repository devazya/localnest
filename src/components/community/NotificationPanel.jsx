/**
 * NotificationPanel.jsx — Community module
 * Dropdown panel showing per-channel activity notifications.
 */

import { motion } from 'framer-motion';

export default function NotificationPanel({ onClose, items }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.16 }}
      style={{ position: 'absolute', top: 50, right: 16, width: 300, maxHeight: 380, overflowY: 'auto', background: '#fff', borderRadius: 18, boxShadow: '0 16px 48px rgba(13,8,32,0.22)', border: '1px solid rgba(109,74,255,0.08)', zIndex: 250 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #F4F3FF', fontWeight: 700, fontSize: 14, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Notifications</div>
      {items.length === 0 ? (
        <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>You're all caught up</div>
      ) : items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: i < items.length - 1 ? '1px solid #F8F7FF' : 'none' }}>
          <img src={it.icon} alt="" style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.4 }}><strong style={{ color: '#0D0820' }}>{it.channel}</strong> {it.text}</div>
            <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 3 }}>{it.count} new</div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
