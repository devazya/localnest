/**
 * FeedSkeleton.jsx (home/shared)
 * Premium loading placeholder matching FeedCard's real dimensions —
 * image block + badge chip + two text lines + CTA pill, with a soft
 * shimmer sweep. Reusable by any future carousel-based section.
 */
export default function FeedSkeleton({ count = 3, cardWidth = 172 }) {
  return (
    <>
      <style>{`
        @keyframes feedSkeletonShimmer {
          0%   { background-position: -160% 0; }
          100% { background-position: 160% 0; }
        }
        .feed-skeleton-shimmer {
          background: linear-gradient(90deg, rgba(109,74,255,0.06) 25%, rgba(109,74,255,0.13) 37%, rgba(109,74,255,0.06) 63%);
          background-size: 400% 100%;
          animation: feedSkeletonShimmer 1.6s ease-in-out infinite;
        }
      `}</style>
      <div style={{ display: 'flex', gap: 14, overflowX: 'hidden', paddingLeft: 20, paddingRight: 20, paddingBottom: 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: cardWidth, borderRadius: 24, overflow: 'hidden', background: '#ffffff', boxShadow: '0 8px 28px rgba(109,74,255,0.08)' }}>
            <div className="feed-skeleton-shimmer" style={{ height: 150 }} />
            <div style={{ padding: '12px 14px 16px' }}>
              <div className="feed-skeleton-shimmer" style={{ width: '80%', height: 13, borderRadius: 6, marginBottom: 8 }} />
              <div className="feed-skeleton-shimmer" style={{ width: '55%', height: 10, borderRadius: 6, marginBottom: 14 }} />
              <div className="feed-skeleton-shimmer" style={{ width: '100%', height: 30, borderRadius: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
