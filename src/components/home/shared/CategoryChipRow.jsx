/**
 * CategoryChipRow.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Horizontally-scrolling, dynamically-sourced category selector. Built
 * for Let's Play's sport chips but deliberately generic (id/label/icon
 * in, onSelect id out) so Local Finds / Neighbourhood Picks can reuse it
 * without a new component. Never hardcodes its own options — the
 * caller always supplies `categories` fetched from Supabase; the only
 * thing this component owns is the "All" chip and the selection UI.
 */
import { motion } from 'framer-motion';

export default function CategoryChipRow({ categories, selectedId, onSelect, allLabel = 'All' }) {
  const chips = [{ id: 'all', label: allLabel, icon: null }, ...categories];

  return (
    <div
      role="tablist"
      aria-label="Filter by category"
      className="hscr"
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 12,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {chips.map((chip) => {
        const selected = chip.id === selectedId;
        return (
          <motion.button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(chip.id)}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: selected ? '#6D4AFF' : '#F5F3FF',
              color: selected ? '#ffffff' : '#4A4060',
            }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              borderRadius: 99,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {chip.icon && <span aria-hidden="true">{chip.icon}</span>}
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}
