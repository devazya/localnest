/**
 * HighlightCard.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Single full-bleed image card for the Home "Highlight" spotlight reel.
 * Visually descended from Explore.jsx's "Must Try" carousel card
 * (full-bleed photo, top-left genre badge, bottom gradient, bold name)
 * but deliberately simpler:
 *   - corners are ~30% less round (20px vs the 28px reference)
 *   - no rating, no distance/location anywhere on the card
 *   - no SaveButton (per project convention: SaveButton isn't wired
 *     into new modules until core Home UI is finalized)
 * The synced description line lives OUTSIDE this component, in
 * HighlightSection, so it can be plain text with no pill/container.
 *
 * Purely presentational — HighlightSection's carousel track owns all
 * click/focus behaviour (tap a peeking side card to bring it to
 * center, tap the centered card to navigate) so this component takes
 * no onClick of its own.
 *
 * `lifted` (default true) gates the drop shadow entirely: peeking side
 * cards get NO shadow (`none`) so nothing can bleed into the white gap
 * between cards. The centered card gets a small, tightly-contained
 * shadow (blur kept below the track's card gap) so it reads as lifted
 * without any haze reaching its neighbours.
 */
const GENRE_BADGE_COLORS = {
  movies: '#7C3AED',
  cafe: '#B45309',
  sports: '#059669',
  deals: '#DC2626',
  nightlife: '#6D4AFF',
};

export default function HighlightCard({ item, width, lifted = true }) {
  const badgeColor = GENRE_BADGE_COLORS[item.genre] || '#6D4AFF';

  return (
    <div
      style={{
        width,
        flexShrink: 0,
        borderRadius: 20, // ~30% less round than the 28px Explore reference
        overflow: 'hidden',
        position: 'relative',
        height: 340,
        boxShadow: lifted ? '0 8px 12px rgba(17,17,17,0.18)' : 'none',
      }}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block', pointerEvents: 'none' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' }} />
      )}

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 48%, transparent 75%)' }} />

      {item.badgeLabel && (
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: badgeColor, color: '#fff',
          fontSize: 9, fontWeight: 800, letterSpacing: 0.8, padding: '5px 11px', borderRadius: 99,
          textTransform: 'uppercase', boxShadow: `0 2px 10px ${badgeColor}66`,
        }}>
          {item.badgeLabel}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 18px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>
          {item.title}
        </div>
      </div>
    </div>
  );
}
