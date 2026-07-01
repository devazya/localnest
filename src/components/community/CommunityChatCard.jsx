/**
 * CommunityChatCard.jsx — Community module (Segment 2)
 * Preview card for the permanent neighbourhood chat — pinned above
 * Discussions, never auto-opens. Component/file name kept as
 * "CommunityChatCard" per architecture decisions; only the user-facing
 * label reads "Neighbourhood Chat".
 */

import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

export default function CommunityChatCard({ onlineCount = 0, latest, onJoin }) {
  return (
    <div style={{ padding: '14px 14px 0' }}>
      <motion.button
        onClick={onJoin}
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
          borderRadius: 24, padding: '18px 20px',
          background: 'linear-gradient(160deg, #FFFFFF 0%, #FAF9FF 100%)',
          border: '1.5px solid rgba(109,74,255,0.12)',
          boxShadow: '0 8px 28px rgba(109,74,255,0.10)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #6D4AFF, #9B6AFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(109,74,255,0.3)',
          }}>
            <span style={{ fontSize: 20 }}>💬</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Neighbourhood Chat</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>General conversations happening across your locality</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'livePulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16A34A', display: 'inline-flex', gap: 4 }}><AnimatedNumber value={onlineCount} /> online</span>
          </div>
        </div>

        {latest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F7FF', borderRadius: 14, padding: '9px 12px' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6D4AFF', flexShrink: 0 }}>{latest.name}</span>
            <span style={{ fontSize: 12.5, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{latest.text}"</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6D4AFF' }}>Join Chat →</span>
        </div>
      </motion.button>
    </div>
  );
}
