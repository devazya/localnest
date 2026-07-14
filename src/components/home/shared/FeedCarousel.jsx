/**
 * FeedCarousel.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Reusable horizontally-scrolling card row. ~2.2 cards visible on a
 * 390–430px mobile viewport at the default cardWidth (172) + gap (14) +
 * 20px side padding. Reusable by any future section (Let's Play, Local
 * Finds, Activities, Workshops, ...) — pass any render-prop children.
 */
export default function FeedCarousel({ children, cardWidth = 172 }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 8,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x proximity',
      }}
    >
      {children}
      <div style={{ width: 6, flexShrink: 0 }} />
    </div>
  );
}
