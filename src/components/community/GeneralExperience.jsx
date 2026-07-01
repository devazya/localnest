/**
 * GeneralExperience.jsx — Community module (Segment 2 + Segment 3)
 * Composes the General-channel-specific content: the "What's Happening
 * Nearby" highlight, the Neighbourhood Chat preview card, and the
 * Discussion discovery hub (Trending / Recently Active / Popular, pulled
 * from every Community channel). Kept as its own small component so
 * Community.jsx and the individual pieces stay focused.
 */

import LiveHighlightCard from './LiveHighlightCard';
import CommunityChatCard from './CommunityChatCard';
import DiscussionSection from './DiscussionSection';

export default function GeneralExperience({
  onlineCount,
  latestMessage,
  onJoinChat,
  onSelectHighlight,
  highlightDiscussions,
  trending,
  recentlyActive,
  popular,
  getChannelMeta,
  getMemberCount,
  onJoinDiscussion,
  onCreateDiscussion,
}) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <LiveHighlightCard onSelect={onSelectHighlight} discussions={highlightDiscussions} />
      <CommunityChatCard onlineCount={onlineCount} latest={latestMessage} onJoin={onJoinChat} />
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
