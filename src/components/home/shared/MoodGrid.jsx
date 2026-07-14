/**
 * MoodGrid.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Lays out mood cards 3-per-row (2 rows for the 6 approved moods) on
 * the primary 390–430px target, per the approved design brief. Each
 * card fades in with a small upward motion, staggered.
 */
import { motion } from 'framer-motion';
import MoodCard from './MoodCard';

export default function MoodGrid({ moods, selectedSlug, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="Select a mood"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        padding: '0 20px',
      }}
    >
      {moods.map((mood, i) => (
        <motion.div
          key={mood.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
        >
          <MoodCard
            mood={mood}
            selected={mood.slug === selectedSlug}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </div>
  );
}
