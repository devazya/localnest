/**
 * DiscussionFilters.jsx — Community module (Segment 3)
 * Sort row for a single channel's discussion list: Recently Active (default),
 * Newest, Most Members, Trending. Search is explicitly out of scope.
 */
import { motion } from 'framer-motion';
import { DISCUSSION_SORT_OPTIONS } from './constants';

export default function DiscussionFilters({ sort, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="hscr">
      {DISCUSSION_SORT_OPTIONS.map(opt => (
        <motion.button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          whileTap={{ scale: 0.94 }}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: sort === opt.key ? 700 : 500,
            border: sort === opt.key ? '1.5px solid rgba(109,74,255,0.28)' : '1.5px solid #E5E7EB',
            background: sort === opt.key ? '#F3F0FF' : '#fff',
            color: sort === opt.key ? '#6D4AFF' : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}
