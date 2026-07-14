/**
 * PrimaryModuleItem.jsx
 * One entry in the Primary Module Row (§9.6) — icon circle + label.
 * Renders the plain-data icon descriptors from data/homeModules.js.
 *
 * Semantics: `role="tab"`, `aria-selected`, roving `tabIndex` — the parent
 * row owns arrow-key navigation (§12). `onSelect` only ever updates state;
 * it never routes (§9.6 — "the row is a content selector, not navigation").
 */
import { motion } from 'framer-motion';
import styles from './PrimaryModuleItem.module.css';

function IconGlyph({ icon, color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {icon.map((p, i) => {
        if (p.tag === 'circle') {
          return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.filled ? color : 'none'} stroke={p.stroked ? color : 'none'} strokeWidth="1.8" />;
        }
        return (
          <path
            key={i}
            d={p.d}
            fill={p.filled ? color : 'none'}
            stroke={p.stroked ? color : 'none'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

export default function PrimaryModuleItem({ module, selected, onSelect, tabIndex, itemRef, onKeyDown }) {
  return (
    <motion.button
      ref={itemRef}
      type="button"
      role="tab"
      id={`s1-module-tab-${module.id}`}
      aria-selected={selected}
      aria-controls={`s1-filters-panel`}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onClick={() => onSelect(module.id)}
      className={styles.item}
      whileTap={{ scale: 0.92 }}
      animate={selected ? { scale: 1.04 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <span
        id={`s1-module-pill-${module.id}`}
        className={styles.pill}
        data-selected={selected || undefined}
      >
        <span
          className={styles.circle}
          style={{
            background: selected ? 'var(--s1-surface, #fff)' : module.circleFill,
          }}
        >
          <IconGlyph icon={module.icon} color={selected ? 'var(--s1-accent)' : module.iconTone} />
        </span>
        <span className={styles.label} data-selected={selected || undefined}>{module.label}</span>
      </span>
    </motion.button>
  );
}
