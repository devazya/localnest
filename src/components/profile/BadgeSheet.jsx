/**
 * BadgeSheet.jsx — Trust & Reputation System (Segment 5.2)
 * "View All" bottom sheet listing every earned badge with its description.
 */
import { motion, AnimatePresence } from 'framer-motion';

export default function BadgeSheet({ open, badges = [], onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(13,8,32,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201, maxHeight: '75vh', overflowY: 'auto',
              background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 22px calc(24px + env(safe-area-inset-bottom))',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.18)', maxWidth: 480, margin: '0 auto',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 4, background: '#E5E7EB', margin: '4px auto 18px' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0D0820', marginBottom: 4 }}>Badges</div>
            <div style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 18 }}>Earned through real contributions to the neighbourhood.</div>

            {badges.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No badges yet — get involved to earn your first one.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {badges.map(b => (
                  <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FAFAFF', borderRadius: 14, border: '1px solid #F0EEFF' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: '#F5F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {b.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0D0820' }}>{b.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
