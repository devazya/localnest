/**
 * GeneralExperience.jsx — Community module (Segment 3.2)
 * Composes the General-channel-specific content:
 *   1. LIVE NOW ticker (replaces old "What's Happening Nearby" card)
 *   2. Neighbourhood Chat preview card
 *   3. Discussion discovery hub (Trending / Recently Active / Popular)
 *
 * Segment 3.2 changes:
 *   - LiveHighlightCard removed → LiveNowTicker replaces it
 *   - LiveNowTicker receives real data for dynamic population
 */

import LiveNowTicker from './LiveNowTicker';
import CommunityChatCard from './CommunityChatCard';
import DiscussionSection from './DiscussionSection';
import ResidentSuggestionRail from './ResidentSuggestionRail';

export default function GeneralExperience({
  onlineCount,
  latestMessage,
  onJoinChat,
  // ticker data props
  tickerDiscussions,
  rideCount,
  pgCount,
  eventCount,
  onNavigate,
  // discussion section props
  trending,
  recentlyActive,
  popular,
  getChannelMeta,
  getMemberCount,
  onJoinDiscussion,
  onCreateDiscussion,
  viewerId,
}) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <LiveNowTicker
        discussions={tickerDiscussions || []}
        onlineCount={onlineCount}
        rideCount={rideCount || 0}
        pgCount={pgCount || 0}
        eventCount={eventCount || 0}
        onNavigate={onNavigate}
        onJoinChat={onJoinChat}
      />
      <CommunityChatCard onlineCount={onlineCount} latest={latestMessage} onJoin={onJoinChat} />
      <ResidentSuggestionRail viewerId={viewerId} />
      <DiscussionSection
        mode="discovery"
        trending={trending}
        recentlyActive={recentlyActive}
        popular={popular}
        getChannelMeta={getChannelMeta}
        getMemberCount={getMemberCount}
        onJoin={onJoinDiscussion}
        onCreate={onCreateDiscussion}
      />
    </div>
  );
}
