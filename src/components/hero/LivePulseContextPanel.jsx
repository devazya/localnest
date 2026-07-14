import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORY_ICON } from './nodeIcons';
import styles from './LivePulseContextPanel.module.css';

/**
 * SUGGESTION_COPY — shown when a pill lights up but has no live content
 * yet (empty feed_items for that category). Not fake activity data —
 * just an honest nudge, keyed by category so it still reads naturally.
 */
const SUGGESTION_COPY = {
  event:          'No events posted yet — be the first to add one.',
  activity:       'No sports activity yet — start a game and post it.',
  workshop:       'No workshops listed yet — host one for the neighbourhood.',
  community_post: 'Quiet here — start a discussion with your neighbours.',
  ride:           'No rides shared yet — post one if you\u2019re heading out.',
  offer:          'No deals live right now — check back soon.',
  featured_pick:  'Nothing featured yet — explore nearby businesses.',
  external:       'No alerts right now.',
  pg:             'No new PG listings yet — check back soon.',
};

const HEADING_FALLBACK = {
  event:          'Any events coming up?',
  activity:       'Fancy a game?',
  workshop:       'Want to learn something?',
  community_post: 'What\u2019s on your mind?',
  ride:           'Heading somewhere?',
  offer:          'Looking for a deal?',
  featured_pick:  'Discover local favourites',
  external:       'Nothing to report',
  pg:             'Looking for a PG?',
};

/**
 * LivePulseContextPanel — the "Local Pulse spotlight" card below the
 * whole network widget. Whenever the laser (in LocalityNetwork) reaches
 * a pill, this narrates whatever it just landed on — live title/subtitle
 * when there's real activity, or an honest suggestion + friendly hook
 * heading when that category is quiet. Copy is entirely driven by the
 * `node` prop (backend via feed_items); nothing here is fabricated.
 */
export default function LivePulseContextPanel({ node, onNavigate }) {
  if (!node) return null;
  const iconCfg = CATEGORY_ICON[node.category] || null;
  const Icon = node.icon || iconCfg?.Icon;
  const color = node.color || iconCfg?.color || '#6D4AFF';
  const hasContent = Boolean(node.title);

  const heading = hasContent ? node.title : (HEADING_FALLBACK[node.category] || `${node.label}?`);
  const description = hasContent ? node.subtitle : (SUGGESTION_COPY[node.category] || 'Nothing live here yet.');

  return (
    <div className={styles.wrap} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          className={styles.row}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={styles.left}>
            <span className={styles.iconDot} style={{ background: `${color}18`, color }}>
              {Icon && <Icon size={17} strokeWidth={2.2} />}
            </span>
            <div className={styles.textCol}>
              <span className={styles.heading}>{heading}</span>
              <span className={hasContent ? styles.description : styles.suggestion}>{description}</span>
              {hasContent && node.timeLabel && <span className={styles.time}>{node.timeLabel}</span>}
            </div>
          </div>
          <button
            className={styles.cta}
            onClick={() => onNavigate && node.route && onNavigate(node.route)}
          >
            {node.ctaLabel || 'Explore'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
