/**
 * NeighbourhoodPickCard.jsx (home/shared)
 * ---------------------------------------------------------------------
 * One curated business card for Neighbourhood Picks. Distinct from
 * VenueCard (Let's Play) and FeedCard (Happening Around) because its
 * fields (editorial badge, open/closed, one-line highlight) don't map
 * onto either — but visually shares the same premium language (large
 * photo, rounded corners, soft shadow) on purpose.
 *
 * Editorial-only, never advertising: the badge pill renders whatever
 * free-text `item.badge` the editor set in curated_picks (e.g. "Editor's
 * Pick", "Trending") — this component never renders "Sponsored",
 * "Advertisement", "Paid" or "Promoted", and never invents a badge when
 * `item.badge` is empty (the tag simply doesn't show).
 *
 * Reuses the universal SaveButton exactly as FeedCard/VenueCard do.
 */
import { motion } from 'framer-motion';
import SaveButton from '../../shared/SaveButton';

export default function NeighbourhoodPickCard({ item, userId, isSaved, onSaveChange, onOpen, width = 236 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen?.(item)}
      role="button"
      tabIndex={0}
      style={{
        flexShrink: 0,
        width,
        scrollSnapAlign: 'start',
        background: '#ffffff',
        borderRadius: 26,
        overflow: 'hidden',
        boxShadow: '0 10px 32px rgba(13,8,32,0.08), 0 2px 8px rgba(13,8,32,0.04)',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image / icon fallback ── */}
      <div style={{ height: 168, position: 'relative', overflow: 'hidden' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 44 }}>{item.categoryIcon || '📍'}</span>
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.30) 100%)', pointerEvents: 'none' }} />

        {/* Top-left: editorial tag — only when curated_picks.badge is set */}
        {item.badge && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(13,8,32,0.62)', backdropFilter: 'blur(6px)', borderRadius: 99, padding: '5px 11px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', letterSpacing: 0.2 }}>✦ {item.badge}</span>
          </div>
        )}

        {/* Top-right: universal SaveButton */}
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
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0820', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {item.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {item.categoryLabel && <span>{item.categoryLabel}</span>}
          {item.locality && <><span>·</span><span>{item.locality}</span></>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          {item.rating > 0 && (
            <span style={{ color: '#0D0820', fontWeight: 600 }}>★ {Number(item.rating).toFixed(1)}</span>
          )}
          {item.openNow != null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: item.openNow ? '#059669' : '#9CA3AF', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.openNow ? '#059669' : '#D1D5DB', display: 'inline-block' }} />
              {item.openNow ? 'Open' : 'Closed'}
            </span>
          )}
        </div>

        {item.highlight && (
          <div style={{ fontSize: 12, color: '#6D4AFF', fontWeight: 600, marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {item.highlight}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen?.(item); }}
          style={{
            marginTop: 8,
            background: '#F5F3FF',
            color: '#6D4AFF',
            border: 'none',
            borderRadius: 14,
            padding: '10px 0',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
          }}
        >
          View Place
        </button>
      </div>
    </motion.div>
  );
}
