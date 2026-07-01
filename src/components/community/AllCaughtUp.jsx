/**
 * AllCaughtUp.jsx — Community module
 * End-of-feed indicator.
 */

import { motion } from 'framer-motion';

export default function AllCaughtUp() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 999, padding: '9px 22px', boxShadow: '0 2px 16px rgba(109,74,255,0.08)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6D4AFF' }}>You're all caught up</span>
      </div>
    </motion.div>
  );
}
