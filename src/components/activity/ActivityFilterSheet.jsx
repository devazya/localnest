/**
 * ActivityFilterSheet.jsx — Activity Center & Settings (Segment 8)
 * Bottom sheet that filters the Activity feed client-side (mirrors
 * community/FilterSheet.jsx's presentation, applied to activities instead
 * of community posts).
 */
import { motion } from 'framer-motion';
import { COLORS, PRIMARY_GRADIENT, FILTER_CATEGORIES, FILTER_TIME_RANGES } from './constants';

const DEFAULT_FILTERS = { show: 'all', categories: [], time: 'today' };

function RadioRow({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
      <span style={{ fontSize: 13.5, color: COLORS.textPrimary }}>{label}</span>
      <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${COLORS.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {active && <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.primary }} />}
      </span>
    </button>
  );
}

function CheckRow({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
      <span style={{ fontSize: 13.5, color: COLORS.textPrimary }}>{label}</span>
      <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${COLORS.primary}`, background: active ? COLORS.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
      </span>
    </button>
  );
}

export default function ActivityFilterSheet({ onClose, filters, onChange }) {
  const toggleCategory = (cat) => {
    const set = new Set(filters.categories);
    set.has(cat) ? set.delete(cat) : set.add(cat);
    onChange({ ...filters, categories: Array.from(set) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(13,8,32,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 560, background: COLORS.surface, borderRadius: '24px 24px 0 0', padding: '14px 20px 30px', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Filters</span>
          <button onClick={() => onChange(DEFAULT_FILTERS)} style={{ background: 'none', border: 'none', color: COLORS.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Reset</button>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Show</div>
        <RadioRow label="All Activity" active={filters.show === 'all'} onClick={() => onChange({ ...filters, show: 'all' })} />
        <RadioRow label="Unread Only" active={filters.show === 'unread'} onClick={() => onChange({ ...filters, show: 'unread' })} />
        <RadioRow label="Mentions Only" active={filters.show === 'mentions'} onClick={() => onChange({ ...filters, show: 'mentions' })} />

        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, margin: '14px 0 4px' }}>Categories</div>
        {FILTER_CATEGORIES.map((cat) => (
          <CheckRow key={cat} label={cat} active={filters.categories.includes(cat)} onClick={() => toggleCategory(cat)} />
        ))}

        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, margin: '14px 0 4px' }}>Time</div>
        {FILTER_TIME_RANGES.map((t) => (
          <RadioRow key={t.key} label={t.label} active={filters.time === t.key} onClick={() => onChange({ ...filters, time: t.key })} />
        ))}

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: 18, padding: '13px 0', borderRadius: 12, border: 'none', backgroundImage: PRIMARY_GRADIENT, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 18px rgba(109,74,255,0.32)' }}
        >
          Apply Filters
        </button>
      </motion.div>
    </motion.div>
  );
}

export { DEFAULT_FILTERS };
