/**
 * FeedEmptyState.jsx (home/shared)
 * Elegant empty state — no placeholder cards, ever.
 */
export default function FeedEmptyState({
  headline = 'Nothing happening nearby yet.',
  subtitle = 'Check back later or explore your neighbourhood.',
}) {
  return (
    <div style={{ margin: '0 20px', padding: '32px 20px', borderRadius: 20, background: '#F8F7FF', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🧭</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0D0820', marginBottom: 4 }}>{headline}</div>
      <div style={{ fontSize: 12.5, color: '#9CA3AF', lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  );
}
