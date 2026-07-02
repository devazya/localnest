/**
 * ContributionStats.jsx — Trust & Reputation System (Segment 5.2)
 * Premium statistic-card grid: Neighbourhood Updates, Discussions,
 * Comments, Marketplace Listings, Events Joined, Ride Participation,
 * Helpful Votes Received.
 */
import AnimatedNumber from '../community/AnimatedNumber';

const STAT_META = [
  { key: 'updates',            icon: '📢', label: 'Updates' },
  { key: 'discussionsStarted', icon: '🏸', label: 'Discussions' },
  { key: 'comments',           icon: '💬', label: 'Comments' },
  { key: 'marketplaceListings',icon: '🛒', label: 'Listings' },
  { key: 'eventsJoined',       icon: '🎉', label: 'Events Joined' },
  { key: 'ridesJoined',        icon: '🚗', label: 'Rides' },
  { key: 'helpfulVotes',       icon: '❤️', label: 'Helpful Votes' },
];

export default function ContributionStats({ stats = {} }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 10 }}>
      {STAT_META.map(m => (
        <div key={m.key} style={{
          background: '#FAFAFF', border: '1px solid #F0EEFF', borderRadius: 16,
          padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <span style={{ fontSize: 18 }}>{m.icon}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0D0820' }}>
            <AnimatedNumber value={stats[m.key] || 0} />
          </span>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{m.label}</span>
        </div>
      ))}
    </div>
  );
}
