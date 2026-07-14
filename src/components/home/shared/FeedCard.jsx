/**
 * FeedCard.jsx (home/shared)
 * ---------------------------------------------------------------------
 * ONE reusable card for every feed_items source_type (event, activity,
 * workshop, community_post, ride, offer, featured_pick, external).
 * Per-type differences (badge text, CTA label, save-item-type, icon
 * fallback, navigation target) are resolved entirely through config
 * (services/feedItems.js FEED_TYPE_CONFIG + the `routeFor` prop) — this
 * component itself has no source_type branching, so a brand new feed
 * type needs zero changes here.
 *
 * Uses the universal SaveButton (components/shared/SaveButton) exactly
 * as it's used in Shops.jsx — no new save implementation.
 */
import { motion } from 'framer-motion';
import SaveButton from '../../shared/SaveButton';

const BADGE_COLORS = {
  LIVE:     { bg: '#EF4444', fg: '#ffffff' },
  TRENDING: { bg: '#F59E0B', fg: '#ffffff' },
  NEW:      { bg: '#22C55E', fg: '#ffffff' },
  TODAY:    { bg: '#6D4AFF', fg: '#ffffff' },
  FEATURED: { bg: '#0D0820', fg: '#ffffff' },
};

export default function FeedCard({ item, userId, isSaved, onSaveChange, onOpen, width = 172 }) {
  const badgeText = item.badge || (item.timeLabel === 'Now' ? 'LIVE' : null);
  const badgeColor = BADGE_COLORS[badgeText] || { bg: 'rgba(0,0,0,0.55)', fg: '#ffffff' };

  const distanceOrLocality = item.locality || item.city;
  const metaParts = [distanceOrLocality, item.timeLabel].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen?.(item)}
      role="button"
      tabIndex={0}
      style={{
        flexShrink: 0,
        width,
        background: '#ffffff',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(109,74,255,0.10), 0 2px 8px rgba(109,74,255,0.05)',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image / gradient fallback ── */}
      <div style={{ height: 150, position: 'relative', overflow: 'hidden' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EDE9FE,#F5F3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 44 }}>{item.emojiFallback}</span>
          </div>
        )}

        {/* soft gradient overlay for legibility of any future overlaid text */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)', pointerEvents: 'none' }} />

        {badgeText && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: badgeColor.bg, color: badgeColor.fg, borderRadius: 99, padding: '4px 10px', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6 }}>
            {badgeText}
          </div>
        )}

        {item.saveType && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <SaveButton
              userId={userId}
              itemType={item.saveType}
              itemId={item.saveId}
              saved={isSaved}
              size="sm"
              onChange={(saved) => onSaveChange?.(item, saved)}
            />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#6D4AFF', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {item.typeLabel}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.title}
        </div>
        {item.subtitle && (
          <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {item.subtitle}
          </div>
        )}
        {metaParts.length > 0 && (
          <div style={{ fontSize: 10.5, color: '#9CA3AF', marginBottom: 4 }}>
            {metaParts.join(' · ')}
          </div>
        )}
        <div style={{ marginTop: 'auto', background: '#EDE9FE', borderRadius: 12, padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6D4AFF' }}>
          {item.ctaLabel}
        </div>
      </div>
    </motion.div>
  );
}
