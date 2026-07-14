/**
 * CompareButton
 * ---------------------------------------------------------------------
 * Large full-width primary CTA used by Smart Ride ("Compare Rides") and
 * reusable anywhere else Home needs a matching premium primary action.
 * Disabled state is a real disabled button (keyboard/AT correct), not
 * just a dimmed style.
 */
import { motion } from 'framer-motion';
import styles from './CompareButton.module.css';

export default function CompareButton({ children, disabled = false, onPress }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onPress}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={styles.button}
      data-disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
