/**
 * MentionAutocomplete.jsx — Social Interaction Layer (Segment 5.3)
 * Floating suggestion list shown above the composer while the user is
 * mid-typing an `@mention`. Purely presentational + a debounced search —
 * the composer owns the text state and calls onSelect with the chosen
 * username to splice into the input.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import { searchResidents } from '../../services/social';

export default function MentionAutocomplete({ query, excludeId, onSelect }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const open = query !== null && query !== undefined;

  useEffect(() => {
    if (!open) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchResidents(query, excludeId, 6);
      if (!cancelled) { setResults(r); setLoading(false); }
    }, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, excludeId, open]);

  return (
    <AnimatePresence>
      {open && (query.length > 0 ? results.length > 0 || loading : true) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          style={{
            background: '#fff', borderRadius: 16, border: '1.5px solid #EDE9FF',
            boxShadow: '0 -8px 28px rgba(109,74,255,0.14)', marginBottom: 8,
            maxHeight: 220, overflowY: 'auto', padding: 6,
          }}
        >
          {loading && results.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12.5, color: '#9CA3AF' }}>Searching…</div>
          )}
          {!loading && results.length === 0 && query.length > 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12.5, color: '#9CA3AF' }}>No residents found</div>
          )}
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.username)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 10px', borderRadius: 12, background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
              onMouseDown={e => e.preventDefault()} // keep composer focus
            >
              <Avatar profile={p} size={30} disablePreview />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.full_name || p.username}
                </div>
                {p.username && <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>@{p.username}</div>}
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
