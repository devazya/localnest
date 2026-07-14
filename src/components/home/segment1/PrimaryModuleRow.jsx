/**
 * PrimaryModuleRow.jsx — §9.6
 * Exactly five modules (Neibo, Neara, Stay, Marketplace, Vroom). Tapping one
 * never navigates — it only updates `activeModule`, which the Context
 * Filter row and Dynamic Content Feed read directly below (§9.6, §15
 * acceptance checklist: "never changes the URL/route").
 *
 * `role="tablist"` / `role="tab"` / `aria-selected` with roving tabIndex —
 * this is the textbook ARIA Tabs case since a tap changes displayed content
 * in place rather than navigating (§12).
 */
import PrimaryModuleItem from '../../shared/PrimaryModuleItem';
import { useRovingTabs } from '../../../hooks/useRovingTabs';
import styles from './PrimaryModuleRow.module.css';

export default function PrimaryModuleRow({ modules, activeModule, onSelect }) {
  const ids = modules.map((m) => m.id);
  const { getTabProps } = useRovingTabs(ids, activeModule, onSelect);

  return (
    <div
      id="s1-modules-panel"
      role="tablist"
      aria-label="Home sections"
      className={`${styles.row} hscr`}
    >
      {modules.map((m) => (
        <PrimaryModuleItem
          key={m.id}
          module={m}
          selected={m.id === activeModule}
          onSelect={onSelect}
          {...getTabProps(m.id)}
        />
      ))}
    </div>
  );
}
