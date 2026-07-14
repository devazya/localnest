/**
 * LocationChip
 * ---------------------------------------------------------------------
 * Premium pill representing a labelled saved location (Home / Work / any
 * future label). Two states: configured (shows the saved place name) and
 * unconfigured ("Set Home" / "Set Work"). Always a tap target that opens
 * the Address Search sheet — never a plain button, per Smart Ride spec.
 */
import { motion } from 'framer-motion';
import styles from './LocationChip.module.css';

const ICON = { Home: '🏠', Work: '🏢' };

export default function LocationChip({ label, placeName, onPress }) {
  const configured = !!placeName;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onPress}
      className={styles.chip}
      aria-label={configured ? `${label}: ${placeName}` : `Set ${label} address`}
    >
      <span className={styles.icon} aria-hidden="true">{ICON[label] || '📍'}</span>
      <span className={styles.textCol}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{configured ? placeName : `Set ${label}`}</span>
      </span>
    </motion.button>
  );
}
