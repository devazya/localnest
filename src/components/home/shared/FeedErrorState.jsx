/**
 * FeedErrorState.jsx (home/shared)
 * Inline retry card — a failed fetch never breaks the page, it just
 * shows this in place of the carousel.
 */
export default function FeedErrorState({ onRetry }) {
  return (
    <div style={{ margin: '0 20px', padding: '24px 20px', borderRadius: 20, background: '#FEF2F2', textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C', marginBottom: 4 }}>Couldn't load this right now.</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Check your connection and try again.</div>
      <button
        onClick={onRetry}
        style={{ background: '#ffffff', border: '1.5px solid #FCA5A5', borderRadius: 12, padding: '8px 18px', fontSize: 12.5, fontWeight: 700, color: '#B91C1C', cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  );
}
