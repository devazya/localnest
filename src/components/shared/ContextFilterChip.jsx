/**
 * ContextFilterChip.jsx
 * One chip in the Context Filter row (§9.6.1). Visually reuses the same
 * accent-secondary/accent token pair as Friend's suggestion chips (§9.4)
 * so "this is the selected one" reads as an already-learned pattern rather
 * than a new visual language — but stays a distinct component because its
 * ARIA role (`tab`, nested in a second `tablist`) differs from a plain chip.
 */
import { motion } from 'framer-motion';
import styles from './ContextFilterChip.module.css';

export default function ContextFilterChip({ filter, selected, onSelect, tabIndex, itemRef, onKeyDown }) {
  return (
    <motion.button
      ref={itemRef}
      type="button"
      role="tab"
      id={`s1-filter-tab-${filter.id}`}
      aria-selected={selected}
      aria-controls="s1-content-feed"
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onClick={() => onSelect(filter.id)}
      className={styles.chip}
      animate={{ backgroundColor: selected ? 'var(--s1-accent-secondary)' : 'rgba(255,255,255,0)' }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        color: selected ? 'var(--s1-accent)' : 'var(--s1-text-secondary)',
        fontWeight: selected ? 600 : 500,
        boxShadow: selected ? '0 3px 10px rgba(109, 74, 255, 0.14)' : 'none',
      }}
    >
      {filter.emoji && <span className={styles.chipEmoji} aria-hidden="true">{filter.emoji}</span>}
      {filter.label}
    </motion.button>
  );
}
