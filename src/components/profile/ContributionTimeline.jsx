/**
 * ContributionTimeline.jsx — Trust & Reputation System (Segment 5.2)
 * GitHub-style activity timeline — the centrepiece of the Overview tab.
 * Purely presentational: receives merged, newest-first items from
 * reputation.fetchContributionTimeline() and renders them. Loading /
 * empty states handled here so the parent stays simple.
 */
import TimelineItem from './TimelineItem';

export default function ContributionTimeline({ items = [], loading, onItemClick }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 2px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: '#F5F4FF', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
              <div style={{ width: '70%', height: 10, borderRadius: 4, background: '#F5F4FF' }} />
              <div style={{ width: '40%', height: 8, borderRadius: 4, background: '#FAFAFF' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div style={{
        background: '#FAFAFA', border: '1.5px dashed #E5E7EB', borderRadius: 14,
        padding: '22px 16px', textAlign: 'center', fontSize: 12.5, color: '#9CA3AF',
      }}>
        No activity yet — contributions to the neighbourhood will show up here.
      </div>
    );
  }

  return (
    <div>
      {items.map((item, i) => (
        <TimelineItem
          key={item.id}
          item={item}
          isLast={i === items.length - 1}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}
