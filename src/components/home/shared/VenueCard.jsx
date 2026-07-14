/**
 * VenueCard.jsx (home/shared)
 * ---------------------------------------------------------------------
 * One bookable venue+sport card for the Let's Play carousel. Larger and
 * richer than the generic FeedCard (venue name, sport, locality, rating,
 * price/hr, a subtly color-coded booking-status chip, Book Now CTA) —
 * intentionally its own component rather than overloading FeedCard,
 * since none of feed_items' generic fields (badge/typeLabel/ctaLabel)
 * map cleanly onto price-per-hour + slot-availability semantics.
 *
 * Reuses the universal SaveButton exactly as FeedCard/Shops do — no new
 * save implementation. Tapping the card (or Book Now) only navigates;
 * see LetsPlaySection for the "future booking page" hookup.
 */
import { motion } from 'framer-motion';
import SaveButton from '../../shared/SaveButton';

const STATUS_STYLE = {
  open:         { label: 'Open',           fg: '#059669', bg: 'rgba(5,150,105,0.10)' },
  limited:      { label: 'Few Slots Left', fg: '#D97706', bg: 'rgba(217,119,6,0.10)' },
  full:         { label: 'Fully Booked',   fg: '#DC2626', bg: 'rgba(220,38,38,0.10)' },
  cancelled:    { label: 'Cancelled',      fg: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  closed:       { label: 'Closed',         fg: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  coming_soon:  { label: 'Coming Soon',    fg: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
};

export default function VenueCard({ item, userId, isSaved, onSaveChange, onOpen, width = 236 }) {
  const status = item.bookingStatus ? STATUS_STYLE[item.bookingStatus] : null;
  const disabled = item.bookingStatus === 'full' || item.bookingStatus === 'cancelled' || item.bookingStatus === 'closed';
  const ctaLabel = disabled
    ? (STATUS_STYLE[item.bookingStatus]?.label || 'Unavailable')
    : (item.bookingStatus === 'coming_soon' ? 'Notify Me' : 'Book Now');

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
        scrollSnapAlign: 'start',
        background: '#ffffff',
        borderRadius: 26,
        overflow: 'hidden',
        boxShadow: '0 10px 32px rgba(109,74,255,0.12), 0 2px 8px rgba(109,74,255,0.06)',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image / gradient fallback ── */}
      <div style={{ height: 168, position: 'relative', overflow: 'hidden' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EDE9FE,#F5F3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 48 }}>{item.sportIcon || '🏟️'}</span>
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.34) 100%)', pointerEvents: 'none' }} />

        {/* Top-left: sport badge + indoor/outdoor */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', borderRadius: 99, padding: '5px 11px' }}>
            <span style={{ fontSize: 12 }}>{item.sportIcon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{item.sportLabel}</span>
          </div>
          {item.indoor != null && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', borderRadius: 99, padding: '5px 10px' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff' }}>{item.indoor ? 'Indoor' : 'Outdoor'}</span>
            </div>
          )}
        </div>

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
          {item.venueName}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
          {item.locality && <span>📍 {item.locality}</span>}
          {item.rating > 0 && (
            <>
              <span>·</span>
              <span style={{ color: '#0D0820', fontWeight: 600 }}>★ {Number(item.rating).toFixed(1)}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6D4AFF' }}>
            {item.pricePerHour != null ? `₹${item.pricePerHour}/hr` : 'Price on request'}
          </div>
          {status && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: status.fg, background: status.bg, borderRadius: 99, padding: '3px 10px' }}>
              {status.label}
            </span>
          )}
        </div>

        {/* Social layer — only rendered when a real signal exists (see
            services/venues.js buildSocialProof). Never fabricated. */}
        {item.socialProof && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#7C3AED' }}>
            <span>🔥</span>
            <span>{item.socialProof}</span>
          </div>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); onOpen?.(item); }}
          style={{
            marginTop: 6,
            background: disabled ? '#F3F0FF' : 'linear-gradient(135deg,#6D4AFF,#8B5CF6)',
            color: disabled ? '#B7ADDB' : '#ffffff',
            border: 'none',
            borderRadius: 14,
            padding: '10px 0',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </motion.div>
  );
}
