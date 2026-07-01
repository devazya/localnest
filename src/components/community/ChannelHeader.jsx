/**
 * ChannelHeader.jsx — Community module
 * The collapsible channel-name bar directly under the top bar
 * (icon, name, chevron, description, LIVE pill for chat channels).
 */

import { motion } from 'framer-motion';

export default function ChannelHeader({ activeMeta, activeName, isChat, collapsedHeader, onToggleCollapsed }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid rgba(109,74,255,0.07)', padding: '10px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <button onClick={onToggleCollapsed} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        {activeMeta?.icon ? <img src={activeMeta.icon} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> : <span style={{ fontSize: 22 }}>💬</span>}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{activeName}</span>
            <motion.svg animate={{ rotate: collapsedHeader ? -90 : 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2"><path d="m6 9 6 6 6-6"/></motion.svg>
          </div>
          {!collapsedHeader && !isChat && <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{activeMeta?.desc}</div>}
        </div>
      </button>
      {isChat && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #22C55E, #16A34A)', borderRadius: 999, padding: '5px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'livePulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>LIVE</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>56</span>
        </div>
      )}
    </div>
  );
}
