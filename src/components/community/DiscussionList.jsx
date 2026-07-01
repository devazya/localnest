/**
 * DiscussionList.jsx — Community module (Segment 3)
 * Renders a list of DiscussionCards, or that list's own empty state.
 * Reused for a single channel's discussions AND for each row inside
 * General's discovery hub — every Community channel gets its own copy via
 * `emptyTitle`/`emptySubtitle` (never a generic "No Posts").
 */
import { AnimatePresence, motion } from 'framer-motion';
import DiscussionCard from './DiscussionCard';

function DiscussionListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[0, 1].map(i => (
        <div key={i} className="skeleton" style={{ height: 112, borderRadius: 24 }} />
      ))}
    </div>
  );
}

export default function DiscussionList({
  discussions,
  loading,
  getChannelMeta,
  getMemberCount,
  onJoin,
  showChannelBadge = false,
  emptyTitle = 'No discussions yet',
  emptySubtitle = 'Start the first one.',
}) {
  if (loading) return <DiscussionListSkeleton />;

  if (!discussions || discussions.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '36px 20px', background: '#fff', borderRadius: 20,
        border: '1px solid rgba(109,74,255,0.06)', boxShadow: '0 2px 16px rgba(109,74,255,0.06)',
      }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🗨️</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0D0820', marginBottom: 4 }}>{emptyTitle}</div>
        <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>{emptySubtitle}</div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {discussions.map(d => (
        <DiscussionCard
          key={d.id}
          discussion={d}
          channelMeta={getChannelMeta?.(d.community_channel)}
          memberCount={getMemberCount?.(d.id) ?? 0}
          showChannelBadge={showChannelBadge}
          onJoin={() => onJoin(d.id)}
        />
      ))}
    </AnimatePresence>
  );
}
