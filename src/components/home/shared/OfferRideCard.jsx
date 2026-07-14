/**
 * OfferRideCard
 * ---------------------------------------------------------------------
 * Secondary glass card beneath the primary Compare Rides CTA — invites
 * the user into the (not-yet-built) Ride Listing flow. Intentionally
 * lower visual weight than CompareButton: this is a secondary path, not
 * a competing primary action.
 */
import { motion } from 'framer-motion';
import GlassSurface from '../../shared/GlassSurface';
import styles from './OfferRideCard.module.css';

export default function OfferRideCard({ onPress }) {
  return (
    <GlassSurface level={1} className={styles.card}>
      <div className={styles.textCol}>
        <div className={styles.title}>Heading somewhere?</div>
        <div className={styles.subtitle}>Offer empty seats to neighbours and split travel costs.</div>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onPress}
        className={styles.button}
      >
        Offer a Ride
      </motion.button>
    </GlassSurface>
  );
}
