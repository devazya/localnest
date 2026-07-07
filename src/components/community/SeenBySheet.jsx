/**
 * SeenBySheet.jsx — Community module
 * Bottom sheet listing everyone who's seen the latest message in a
 * Discussion Room / General chat — Instagram-DM style. Backed by live
 * Realtime Presence (who's currently in the room) rather than a
 * per-message reads table, since no such table exists in the schema and
 * this segment does not add one.
 */
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';

export default function SeenBySheet({ open, onClose, viewers = [], creatorId }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,35,0.35)', zIndex: 800 }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 801,
              background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)',
              maxHeight: '70vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(20,10,50,0.18)',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E2F5', margin: '4px auto 14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0D0820' }}>Seen by</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{viewers.length}</div>
              </div>
              <button onClick={onClose} style={{
                width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#F4F3FA',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {viewers.map(v => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <Avatar profile={v} size={40} disablePreview />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0D0820' }}>{v.full_name || v.username || 'User'}</div>
                    <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{v.seenLabel || 'Online now'}</div>
                  </div>
                  {v.id === creatorId && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6D4AFF', background: '#EDE9FF', borderRadius: 999, padding: '3px 10px' }}>Creator</span>
                  )}
                </div>
              ))}
              {viewers.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', padding: '24px 0' }}>No one else has viewed this yet.</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
