/**
 * EmptyState.jsx — Community module
 * Empty feed state (no posts / no search results).
 */

import { motion } from 'framer-motion';

export default function EmptyState({ chMeta, activeName, search, onPost, onClear }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '52px 24px', background: '#fff', borderRadius: 20, boxShadow: '0 2px 20px rgba(109,74,255,0.07)', border: '1px solid rgba(109,74,255,0.06)' }}>
      {chMeta?.icon ? <img src={chMeta.icon} alt="" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 16px' }} /> : <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>}
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', marginBottom: 8, fontFamily: 'var(--font-display)' }}>{search ? 'No matching discussions' : 'No discussions yet'}</div>
      <div style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 22 }}>{search ? 'Try different keywords' : 'Be the first to start one.'}</div>
      {search
        ? <button onClick={onClear} style={{ background: '#F3F0FF', color: '#6D4AFF', border: 'none', padding: '12px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Clear Search</button>
        : <button onClick={onPost} style={{ background: 'linear-gradient(135deg, #6D4AFF, #9B6AFF)', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 18px rgba(109,74,255,0.32)' }}>Create Post</button>}
    </motion.div>
  );
}
