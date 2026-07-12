/**
 * FriendSection.jsx — §8, §9.5, §9.4, §10
 * "This is not a chatbot embedded in a homepage. It is the neighborhood
 * itself, given a voice." The orb is visually unchanged from the existing
 * placeholder spec — flat matte black, zero gradient/glow/ring — only the
 * framing changes: the "Coming Soon" capsule reads as a neighbour who
 * hasn't woken up yet, not a locked feature, and orb taps are inert by
 * design (no navigation) — the real Friend feature ships later.
 *
 * Card is branded "✨ LocalNest AI" with a BETA pill, per the target
 * design — the underlying feature is still the Friend orb described
 * above, just surfaced with the product-facing name and iconography.
 *
 * Chip row: §9.4 flags the brief's literal horizontal-scroll spec as
 * causing clipped chips at 390-430px, and recommends a 2×2 wrap grid
 * instead — implemented here as that recommendation. Chips are content
 * ("things the neighbourhood is already talking about"), not query
 * prompts, so a tap only gives tactile feedback (§9.4) — this build does
 * not wire chips to a destination, since the spec doesn't define one and
 * inventing a new AI-query flow would be outside the orb's stated
 * "inert until it ships" framing (flagged in the build notes).
 *
 * §7 Emotional Design (night): the chip set shortens from 4 to 2 late at
 * night — a content decision, not a layout change.
 */
import { motion } from 'framer-motion';
import GlassSurface from '../../shared/GlassSurface';
import styles from './FriendSection.module.css';

const DAY_CHIPS = [
  { icon: '🔍', label: 'Find badminton players', tint: '#E4EEFF', fg: '#3B7DE0' },
  { icon: '🌶️', label: 'Best biryani nearby', tint: '#FFE9DC', fg: '#E0682F' },
  { icon: '🏠', label: 'Show PG under ₹10k', tint: '#F1E4D4', fg: '#9C6A2E' },
  { icon: '🛒', label: 'Grocery offers nearby', tint: '#E9E9EF', fg: '#5B5B66' },
];
const NIGHT_CHIPS = [
  { icon: '🌙', label: 'Late-night food open', tint: '#E9E4FF', fg: '#6D4AFF' },
  { icon: '🤫', label: 'Quiet hours nearby', tint: '#E9E9EF', fg: '#5B5B66' },
];

export default function FriendSection() {
  const hour = new Date().getHours();
  const isNight = hour >= 23 || hour < 5;
  const chips = isNight ? NIGHT_CHIPS : DAY_CHIPS;

  return (
    <GlassSurface level={2} className={styles.section}>
      <div className={styles.left}>
        <div className={styles.heading}>
          <span className={styles.titleRow}>
            <span className={styles.title}>✨ LocalNest AI</span>
            <span className={styles.betaBadge}>BETA</span>
          </span>
          <span className={styles.subtitle}>Your neighbourhood assistant</span>
        </div>
        <div className={styles.chipRow}>
          {chips.map((c) => (
            <motion.span
              key={c.label}
              className={styles.chip}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              role="button"
              tabIndex={0}
            >
              <span className={styles.chipIcon} style={{ background: c.tint, color: c.fg }} aria-hidden="true">{c.icon}</span>
              {c.label}
            </motion.span>
          ))}
        </div>
      </div>

      <FriendOrb />
    </GlassSurface>
  );
}

function FriendOrb() {
  return (
    <motion.div
      className={styles.orbColumn}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      role="button"
      tabIndex={0}
      aria-label="LocalNest AI orb, coming soon, not yet available"
    >
      <span className={styles.sparkle} style={{ top: 2, left: 4 }} aria-hidden="true">✨</span>
      <span className={styles.sparkle} style={{ top: 18, right: 0 }} aria-hidden="true">✨</span>
      <span className={styles.sparkle} style={{ bottom: 30, left: -2 }} aria-hidden="true">✨</span>
      <div className={styles.orb} aria-hidden="true" />
      <span className={styles.orbCaption} aria-hidden="true">AI Orb</span>
      <span className={styles.comingSoon}>Coming Soon</span>
    </motion.div>
  );
}
