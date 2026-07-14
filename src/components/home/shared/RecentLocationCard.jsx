/**
 * RecentLocationCard
 * ---------------------------------------------------------------------
 * One row in the recent-destinations list inside the Address Search
 * sheet. Reused for both "Recent Places" and live "Suggestions" — the
 * only difference is the leading glyph and subLabel text, both passed
 * in by the caller so this stays presentation-only.
 */
import { motion } from 'framer-motion';
import styles from './RecentLocationCard.module.css';

export default function RecentLocationCard({ icon = '📍', title, subLabel, onPress }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className={styles.row}
    >
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <span className={styles.textCol}>
        <span className={styles.title}>{title}</span>
        {subLabel && <span className={styles.sub}>{subLabel}</span>}
      </span>
    </motion.button>
  );
}
