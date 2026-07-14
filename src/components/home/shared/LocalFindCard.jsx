/**
 * LocalFindCard.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Card for the Local Finds Promotions Engine (services/campaigns.js).
 * Distinct from FeedCard: campaigns carry commercial fields FeedCard
 * doesn't model (discount badge, coupon code, sponsored disclosure,
 * merchant branding), so this is its own component — but it reuses the
 * same visual language (radius, shadow, motion) and the same universal
 * SaveButton, no new save implementation.
 *
 * "Premium, not ad-feed" per the Local Finds brief: the Sponsored badge
 * only renders when the row is actually flagged is_sponsored — never
 * fabricated, never shown for ordinary merchant promotions or affiliate
 * offers just because they're commercial.
 */
import { motion } from 'framer-motion';
import SaveButton from '../../shared/SaveButton';

export default function LocalFindCard({ item, userId, isSaved, onSaveChange, onOpen, width = 172 }) {
  const metaParts = [item.merchantName, item.locality || item.city].filter(Boolean);

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
            <span style={{ fontSize: 40 }}>🏷️</span>
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)', pointerEvents: 'none' }} />

        {item.discountLabel && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#6D4AFF', color: '#ffffff', borderRadius: 99, padding: '4px 10px', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.4 }}>
            {item.discountLabel}
          </div>
        )}

        {item.logoUrl && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '2px solid #ffffff', background: '#ffffff' }}>
            <img src={item.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

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
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {item.isSponsored && (
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Sponsored
          </div>
        )}
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.title}
        </div>
        {metaParts.length > 0 && (
          <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {metaParts.join(' · ')}
          </div>
        )}
        {item.expiryLabel && (
          <div style={{ fontSize: 10.5, color: '#EF4444', fontWeight: 600, marginBottom: 4 }}>
            {item.expiryLabel}
          </div>
        )}
        <div style={{ marginTop: 'auto', background: '#EDE9FE', borderRadius: 12, padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6D4AFF' }}>
          {item.ctaLabel}
        </div>
      </div>
    </motion.div>
  );
}
