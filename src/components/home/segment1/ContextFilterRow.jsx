/**
 * ContextFilterRow.jsx — §9.6.1
 * Sits directly below the Primary Module row. Shows the active module's
 * filter set; exactly one active at a time. Switching modules swaps the
 * entire content of this row (§16 filter lists) — it never merges sets.
 *
 * A second, nested `tablist` (`aria-label="{Module} filters"`) per §12 —
 * distinct from the Primary Module tablist above it.
 */
import ContextFilterChip from '../../shared/ContextFilterChip';
import { useRovingTabs } from '../../../hooks/useRovingTabs';
import styles from './ContextFilterRow.module.css';

export default function ContextFilterRow({ module, activeFilter, onSelect }) {
  const ids = module.contextFilters.map((f) => f.id);
  const { getTabProps } = useRovingTabs(ids, activeFilter, onSelect);

  return (
    <div className={styles.tray}>
      <div
        id="s1-filters-panel"
        role="tablist"
        aria-label={`${module.label} filters`}
        className={`${styles.row} hscr`}
      >
        {module.contextFilters.map((f) => (
          <ContextFilterChip
            key={f.id}
            filter={f}
            selected={f.id === activeFilter}
            onSelect={onSelect}
            {...getTabProps(f.id)}
          />
        ))}
      </div>
    </div>
  );
}
