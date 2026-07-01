/**
 * DiscussionSection.jsx — Community module (Segment 3)
 * One reusable discussion engine, two presentations:
 *
 *  - mode="channel": a single Community channel's own discussions
 *    (Sports, Ride Sharing, Events, Marketplace, Jobs, Help, Lost & Found,
 *    and General's own discussions too) — with sorting and Create.
 *
 *  - mode="discovery": General as the discovery hub — Trending / Recently
 *    Active / Popular discussions pulled from EVERY channel. The actual
 *    discussion still lives inside its own channel; this only surfaces it.
 */

import DiscussionHeader from './DiscussionHeader';
import DiscussionFilters from './DiscussionFilters';
import DiscussionList from './DiscussionList';
import { DISCUSSION_EMPTY_COPY } from './constants';

export default function DiscussionSection({
  mode = 'channel',

  // channel mode
  channelSlug,
  channelMeta,
  discussions,
  loading,
  sort,
  onSortChange,

  // discovery mode
  trending,
  recentlyActive,
  popular,

  // shared
  getChannelMeta,
  getMemberCount,
  onJoin,
  onCreate,
}) {
  if (mode === 'discovery') {
    return (
      <div style={{ padding: '4px 14px calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 18px)' }}>
        <div style={{ marginBottom: 26 }}>
          <DiscussionHeader icon="🔥" title="Trending Discussions" onCreate={onCreate} />
          <DiscussionList
            discussions={trending?.items}
            loading={trending?.loading}
            getChannelMeta={getChannelMeta}
            getMemberCount={getMemberCount}
            onJoin={onJoin}
            showChannelBadge
            emptyTitle="Nothing trending yet"
            emptySubtitle="Start a discussion in any channel to kick things off."
          />
        </div>

        <div style={{ marginBottom: 26 }}>
          <DiscussionHeader icon="🕐" title="Recently Active Discussions" />
          <DiscussionList
            discussions={recentlyActive?.items}
            loading={recentlyActive?.loading}
            getChannelMeta={getChannelMeta}
            getMemberCount={getMemberCount}
            onJoin={onJoin}
            showChannelBadge
            emptyTitle="No recent activity"
            emptySubtitle="Discussions you join will show up here."
          />
        </div>

        <div>
          <DiscussionHeader icon="⭐" title="Popular Discussions" />
          <DiscussionList
            discussions={popular?.items}
            loading={popular?.loading}
            getChannelMeta={getChannelMeta}
            getMemberCount={getMemberCount}
            onJoin={onJoin}
            showChannelBadge
            emptyTitle="No popular discussions yet"
            emptySubtitle="The busiest discussions across LocalNest will appear here."
          />
        </div>
      </div>
    );
  }

  const empty = DISCUSSION_EMPTY_COPY[channelSlug] || { title: 'No discussions yet', subtitle: 'Start the first one.' };

  return (
    <div style={{ padding: '20px 14px calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 18px)' }}>
      <DiscussionHeader iconSrc={channelMeta?.icon} title={`${channelMeta?.name || 'Discussions'}`} onCreate={onCreate} />

      <div style={{ marginBottom: 14 }}>
        <DiscussionFilters sort={sort} onChange={onSortChange} />
      </div>

      <DiscussionList
        discussions={discussions}
        loading={loading}
        getChannelMeta={getChannelMeta}
        getMemberCount={getMemberCount}
        onJoin={onJoin}
        emptyTitle={empty.title}
        emptySubtitle={empty.subtitle}
      />
    </div>
  );
}
