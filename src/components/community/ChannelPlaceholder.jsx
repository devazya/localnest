/**
 * ChannelPlaceholder.jsx — Community module (Segment 1 foundation fix)
 * Clean, premium placeholder shown inside every channel's content area.
 * No feed, no chat, no discussions — just a calm "more is coming" state
 * so Segment 2 has a finished shell to build the real experience into.
 * Presentation only.
 */

import { motion } from 'framer-motion';

export default function ChannelPlaceholder({ activeMeta, activeName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 28px',
        margin: '14px 14px calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 14px)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFAFF 100%)',
        borderRadius: 22,
        border: '1px solid rgba(109,74,255,0.08)',
        boxShadow: '0 4px 24px rgba(109,74,255,0.06)',
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #F4F2FF 0%, #EDE9FF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
      }}>
        {activeMeta?.icon
          ? <img src={activeMeta.icon} alt="" style={{ width: 42, height: 42, objectFit: 'contain' }} />
          : <span style={{ fontSize: 30 }}>💬</span>}
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
        {activeName}
      </div>
      <div style={{ fontSize: 13.5, color: '#9CA3AF', maxWidth: 280, lineHeight: 1.55 }}>
        This space is being built. The full {activeName.toLowerCase()} experience is coming in the next update.
      </div>
    </motion.div>
  );
}
