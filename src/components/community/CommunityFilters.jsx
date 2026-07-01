/**
 * CommunityFilters.jsx — Community module
 * Sort chips (Newest / Trending / Most Liked / Most Comments) plus the
 * advanced-filter trigger button. Only existing implementation moved.
 */

import { motion } from 'framer-motion';
import { SORT_OPTIONS } from './constants';

export default function CommunityFilters({ sort, setSort, advFilters, onOpenFilterSheet }) {
  const hasActiveFilters = advFilters.time !== 'all' || advFilters.verifiedOnly;

  return (
    <div style={{ background: '#fff', padding: '9px 16px 11px', borderBottom: '1px solid rgba(109,74,255,0.07)', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto' }} className="hscr">
        {SORT_OPTIONS.map(opt => (
          <motion.button key={opt.key} onClick={() => setSort(opt.key)} whileTap={{ scale: 0.94 }}
            style={{ flexShrink: 0, padding: '6px 15px', borderRadius: 999, fontSize: 12.5, fontWeight: sort === opt.key ? 700 : 500, border: sort === opt.key ? '1.5px solid rgba(109,74,255,0.28)' : '1.5px solid #E5E7EB', background: sort === opt.key ? '#F3F0FF' : '#fff', color: sort === opt.key ? '#6D4AFF' : '#6B7280', cursor: 'pointer', transition: 'all 0.15s' }}>
            {opt.label}
          </motion.button>
        ))}
        <button onClick={onOpenFilterSheet} style={{ marginLeft: 'auto', flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: hasActiveFilters ? '#F3F0FF' : '#F8F8FF', border: hasActiveFilters ? '1.5px solid #6D4AFF' : '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={hasActiveFilters ? '#6D4AFF' : '#6B7280'} strokeWidth="2.2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          {hasActiveFilters && <div style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#6D4AFF' }} />}
        </button>
      </div>
    </div>
  );
}
