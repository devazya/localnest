/**
 * FilterSheet.jsx — Community module
 * Advanced filter bottom sheet (time posted, verified-only toggle).
 */

import { motion } from 'framer-motion';

export default function FilterSheet({ onClose, filters, setFilters }) {
  const TIME_OPTS = [
    { key: 'all', label: 'Any time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: '24px 24px 0 0', padding: '14px 20px 32px', boxShadow: '0 -12px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} /></div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Filters</div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Time Posted</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {TIME_OPTS.map(t => (
            <button key={t.key} onClick={() => setFilters(f => ({ ...f, time: t.key }))}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: filters.time === t.key ? 700 : 500, border: filters.time === t.key ? '1.5px solid #6D4AFF' : '1.5px solid #E5E7EB', background: filters.time === t.key ? '#F3F0FF' : '#fff', color: filters.time === t.key ? '#6D4AFF' : '#6B7280', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Show</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
          <div onClick={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))} style={{ width: 42, height: 24, borderRadius: 999, background: filters.verifiedOnly ? '#6D4AFF' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: filters.verifiedOnly ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
          </div>
          <span style={{ fontSize: 13.5, color: '#4B5563' }}>Verified members only</span>
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFilters({ time: 'all', verifiedOnly: false })} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Reset</button>
          <button onClick={onClose} style={{ flex: 2, padding: '13px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6D4AFF, #9B6AFF)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 18px rgba(109,74,255,0.32)' }}>Apply</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
