/**
 * Community.jsx — LocalNest Community Hub
 * Thin page container: owns all shared state and Supabase wiring, and
 * composes the modular components under src/components/community/.
 *
 * Behavior and appearance are unchanged from the previous monolithic
 * implementation — this file was split for maintainability only.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';
import { useAuth } from '../context/AuthContext';

import { CHANNELS, PAGE_SIZE, DISCUSSION_CHANNEL_SLUGS } from '../components/community/constants';
import { getChannelMeta, isToday, isThisWeek, isThisMonth, sortDiscussions, buildDiscoveryGroups } from '../components/community/utils';
import { usePresenceCount, usePresenceCounts } from '../hooks/usePresence';
import {
  fetchDiscoveryDiscussions,
  fetchDiscussionById,
  createDiscussion as createDiscussionRow,
  touchDiscussionActivity,
  sweepArchivedDiscussions,
  subscribeToDiscussions,
} from '../services/discussions';

import CommunityLayout from '../components/community/CommunityLayout';
import CommunityHeader from '../components/community/CommunityHeader';
import CommunityDrawer from '../components/community/CommunityDrawer';
import ChannelNavigation from '../components/community/ChannelNavigation';
import CommunityFilters from '../components/community/CommunityFilters';
import FilterSheet from '../components/community/FilterSheet';
import SearchOverlay from '../components/community/SearchOverlay';
import CreatePostModal from '../components/community/CreatePostModal';
import ChannelPlaceholder from '../components/community/ChannelPlaceholder';
import GeneralExperience from '../components/community/GeneralExperience';
import DiscussionSection from '../components/community/DiscussionSection';
import CommunityChatScreen from '../components/community/CommunityChatScreen';
import DiscussionRoom from '../components/community/DiscussionRoom';
import CreateDiscussionSheet from '../components/community/CreateDiscussionSheet';
import NeighbourhoodUpdates from '../components/community/NeighbourhoodUpdates';
import ActivityCenter from '../components/activity/ActivityCenter';
import { useActivityCenter } from '../hooks/useActivityCenter';

const POST_SELECT = `id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,downvote_count,comment_count,post_type,metadata,is_removed,report_count,created_at,updated_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`;

export default function Community({ onNavigate, autoOpen }) {
  const { user: authUser } = useAuth();
  const [user, setUser]                       = useState(authUser || null);
  const [profile, setProfile]                 = useState(null);
  const [channels, setChannels]               = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [posts, setPosts]                     = useState([]);
  const [initialLoad, setInitialLoad]         = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [hasMore, setHasMore]                 = useState(true);
  const [page, setPage]                       = useState(0);
  const [sort, setSort]                       = useState('newest');
  const [search]                              = useState('');
  const [showModal, setShowModal]             = useState(false);
  const [showDrawer, setShowDrawer]           = useState(false);
  const [showSearch, setShowSearch]           = useState(false);
  const [showFilters, setShowFilters]         = useState(false);
  const [advFilters, setAdvFilters]           = useState({ time: 'all', verifiedOnly: false });
  const [userVotes, setUserVotes]             = useState({});
  const [savedPosts, setSavedPosts]           = useState({});
  const [unreadCounts, setUnreadCounts]       = useState({});
  const [activityChannels, setActivityChannels] = useState([]);
  const [viewAnyway, setViewAnyway]           = useState({});
  const [showChatScreen, setShowChatScreen]   = useState(false);
  const [showActivityCenter, setShowActivityCenter] = useState(false);
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);

  // Discussion Room messages — lifted up here (instead of living inside
  // DiscussionRoom's own local state) so they SURVIVE leaving and
  // re-entering a room. DiscussionRoom unmounts on back/leave; keeping the
  // map here, in a component that stays mounted for the whole Community
  // session, is what stops messages from vanishing on return. Keyed by
  // discussion id. No schema/table change — still fully client-side.
  const [discussionMessagesById, setDiscussionMessagesById] = useState({});

  // ─ Universal Creator auto-open (Segment 7.1) ─
  // When the Universal Creator routes here with an autoOpen signal,
  // fire the correct existing modal/sheet. No new composer code needed.
  const [autoOpenUpdateModal, setAutoOpenUpdateModal] = useState(false);

  useEffect(() => {
    if (!autoOpen) return;
    if (autoOpen === 'discussion') {
      setShowCreateDiscussion(true);
    } else if (autoOpen === 'neighbourhood-update') {
      // Switch to the neighbourhood-updates channel. If channels are already
      // loaded we can switch immediately; if not, the second effect below
      // handles it once channels arrive.
      const nuChannel = channels.find(c => c.slug === 'neighbourhood-updates');
      if (nuChannel) { setActiveChannelId(nuChannel.id); setAutoOpenUpdateModal(true); }
      else setAutoOpenUpdateModal(true); // channel switch happens in effect below
    } else if (autoOpen === 'community-post') {
      setShowModal(true);
    }
  // eslint-disable-next-line
  }, [autoOpen]);

  // When channels load and autoOpen is waiting for neighbourhood-updates channel
  useEffect(() => {
    if (autoOpen !== 'neighbourhood-update' || channels.length === 0) return;
    const nuChannel = channels.find(c => c.slug === 'neighbourhood-updates');
    if (nuChannel && activeChannelId !== nuChannel.id) setActiveChannelId(nuChannel.id);
  // eslint-disable-next-line
  }, [channels, autoOpen]);
  // Discussions (Segment 3) — the reusable Discussion Ecosystem. Supabase is
  // the only source of truth; nothing here is hardcoded. `allDiscussions`
  // holds every ACTIVE discussion across every Community channel so both a
  // single channel's list and General's cross-channel discovery hub
  // (Trending / Recently Active / Popular) can be derived from one fetch
  // plus one realtime subscription. Member counts are NOT stored here —
  // they come live from Supabase Realtime Presence (see getMemberCount
  // below) so the UI never shows fake numbers.
  const [allDiscussions, setAllDiscussions]   = useState([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [discussionSort, setDiscussionSort]   = useState('recent_activity');
  const loaderRef = useRef(null);

  // ─ Auth ─
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => { if (authUser) setUser(authUser); }, [authUser]);

  // ─ Profile (for admin/trust score) ─
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from('profiles').select('id,is_admin,trust_score,full_name,username,avatar_url').eq('id', user.id).single()
      .then(({ data }) => setProfile(data || null));
  }, [user]);

  const isAdmin = !!profile?.is_admin;

  // Real personal-notification badge for the bell (Activity Center, Segment 8).
  // Kept mounted (not just while the overlay is open) so the badge stays live
  // via realtime even when the user hasn't opened the Activity screen yet.
  const { unreadCount: activityUnreadCount } = useActivityCenter(user?.id);

  // ─ Load channels ─
  useEffect(() => {
    supabase.from('channels').select('id,name,slug,description,icon,sort_order,is_default').order('sort_order')
      .then(({ data }) => {
        const allowed = new Set(CHANNELS.map(c => c.slug));
        let chs = (data || []).filter(c => allowed.has(c.slug));
        if (chs.length === 0) {
          chs = CHANNELS.map((c, i) => ({ id: i + 1, ...c, sort_order: i, is_default: c.slug === 'general' }));
        }
        setChannels(chs);
        if (!activeChannelId) {
          const def = chs.find(c => c.is_default) || chs[0];
          if (def) setActiveChannelId(def.id);
        }
      });
  // eslint-disable-next-line
  }, []);

  // ─ Discussions (Segment 3): initial load + realtime + auto-archive sweep ─
  useEffect(() => {
    let cancelled = false;
    setDiscussionsLoading(true);
    fetchDiscoveryDiscussions({ limit: 100 })
      .then((rows) => { if (!cancelled) setAllDiscussions(rows); })
      .catch((err) => console.error('Failed to load discussions:', err))
      .finally(() => { if (!cancelled) setDiscussionsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToDiscussions({
      onInsert: async (row) => {
        // Realtime payloads only carry raw table columns (no joined
        // profile) — hydrate before adding so cards can show the creator.
        try {
          const full = await fetchDiscussionById(row.id);
          setAllDiscussions(prev => (prev.some(d => d.id === full.id) ? prev : [full, ...prev]));
        } catch {
          setAllDiscussions(prev => (prev.some(d => d.id === row.id) ? prev : [row, ...prev]));
        }
      },
      onUpdate: (row) => {
        setAllDiscussions(prev => {
          const next = prev.map(d => (d.id === row.id ? { ...d, ...row } : d));
          // Archived discussions disappear from Active Discussions.
          return next.filter(d => d.status !== 'archived');
        });
      },
    });
    return unsubscribe;
  }, []);

  // 24h without activity → archived. No server cron wired up yet, so this
  // lazy sweep runs on mount and every few minutes while Community is open.
  useEffect(() => {
    sweepArchivedDiscussions().catch(() => {});
    const id = setInterval(() => { sweepArchivedDiscussions().catch(() => {}); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ─ Seed initial activity strip from most recent posts (real data, not mock) ─
  useEffect(() => {
    if (channels.length === 0) return;
    let cancelled = false;
    supabase.from('community_posts')
      .select('channel_id, created_at')
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const seen = new Set();
        const slugs = [];
        for (const row of data) {
          const ch = channels.find(c => c.id === row.channel_id);
          if (ch && !seen.has(ch.slug)) { seen.add(ch.slug); slugs.push(ch.slug); }
        }
        if (slugs.length > 0) setActivityChannels(slugs);
        else setActivityChannels(channels.slice(0, 3).map(c => c.slug));
      });
    return () => { cancelled = true; };
  }, [channels]);

  // ─ Query builder ─
  const buildQuery = useCallback((fromIdx) => {
    if (!activeChannelId) return null;
    let q = supabase.from('community_posts')
      .select(POST_SELECT)
      .eq('channel_id', activeChannelId);
    if (search) { const s = search.replace(/[%_\\]/g, '\\$&'); q = q.or(`title.ilike.%${s}%,body.ilike.%${s}%`); }
    if (advFilters.verifiedOnly) q = q.eq('profiles.is_verified', true);
    if (sort === 'newest')              q = q.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    else if (sort === 'most_liked')     q = q.order('like_count', { ascending: false });
    else if (sort === 'most_commented') q = q.order('comment_count', { ascending: false });
    else                                q = q.order('like_count', { ascending: false }).order('comment_count', { ascending: false });
    return q.range(fromIdx, fromIdx + PAGE_SIZE - 1);
  }, [activeChannelId, search, sort, advFilters.verifiedOnly]);

  // ─ Fetch posts ─
  const fetchPosts = useCallback(async (reset = false) => {
    const fromIdx = reset ? 0 : page * PAGE_SIZE;
    if (reset) { setRefreshing(true); setInitialLoad(true); }
    const q = buildQuery(fromIdx);
    if (!q) return;
    const { data, error } = await q;
    if (!error) {
      let incoming = data || [];
      if (advFilters.time !== 'all') {
        incoming = incoming.filter(p =>
          advFilters.time === 'today' ? isToday(p.created_at) :
          advFilters.time === 'week'  ? isThisWeek(p.created_at) :
          advFilters.time === 'month' ? isThisMonth(p.created_at) : true
        );
      }
      if (reset) { setPosts(incoming); setPage(1); }
      else { setPosts(prev => { const ids = new Set(prev.map(p => p.id)); return [...prev, ...incoming.filter(p => !ids.has(p.id))]; }); setPage(p => p + 1); }
      setHasMore(incoming.length === PAGE_SIZE);
      if (activeChannelId) setUnreadCounts(prev => ({ ...prev, [activeChannelId]: 0 }));
    }
    setInitialLoad(false); setRefreshing(false);
  }, [buildQuery, page, activeChannelId, advFilters.time]);

  useEffect(() => {
    if (!activeChannelId) return;
    setPage(0); setHasMore(true); setPosts([]); setInitialLoad(true);
  // eslint-disable-next-line
  }, [activeChannelId, sort, search, advFilters.time, advFilters.verifiedOnly]);

  useEffect(() => {
    if (!activeChannelId || page !== 0) return;
    fetchPosts(true);
  // eslint-disable-next-line
  }, [activeChannelId, sort, search, page, advFilters.time, advFilters.verifiedOnly]);

  // ─ Votes & saved ─
  useEffect(() => {
    if (!user || posts.length === 0) return;
    const ids = posts.map(p => p.id);
    supabase.from('community_votes').select('post_id,vote').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => { const m = {}; (data||[]).forEach(r => { m[r.post_id] = r.vote; }); setUserVotes(p => ({ ...p, ...m })); });
    supabase.from('community_saved').select('post_id').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => { const m = {}; (data||[]).forEach(s => { m[s.post_id] = true; }); setSavedPosts(p => ({ ...p, ...m })); });
  }, [user, posts]);

  // ─ Realtime ─
  useEffect(() => {
    if (channels.length === 0) return;
    const subs = channels.map(ch =>
      supabase.channel(`comm:${ch.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${ch.id}` }, async (payload) => {
          const chMeta = getChannelMeta(ch.slug);
          if (chMeta) setActivityChannels(prev => prev.includes(chMeta.slug) ? prev : [chMeta.slug, ...prev]);
          if (ch.id === activeChannelId) {
            if (user && payload.new.author_id === user.id) return;
            const { data } = await supabase.from('community_posts')
              .select(POST_SELECT)
              .eq('id', payload.new.id).single();
            if (data) setPosts(prev => prev.some(p => p.id === data.id) ? prev : [data, ...prev]);
          } else {
            setUnreadCounts(prev => ({ ...prev, [ch.id]: (prev[ch.id] || 0) + 1, [ch.slug]: (prev[ch.slug] || 0) + 1 }));
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${ch.id}` }, (payload) => {
          if (ch.id === activeChannelId) setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${ch.id}` }, (payload) => {
          if (ch.id === activeChannelId && payload.old?.id) setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        })
        .subscribe()
    );
    return () => subs.forEach(s => supabase.removeChannel(s));
  }, [channels, activeChannelId, user]);

  // ─ Infinite scroll ─
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !refreshing && !initialLoad) fetchPosts(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, refreshing, initialLoad, fetchPosts]);

  // ─ Handlers ─
  const handleSelect = (id) => {
    const ch = channels.find(c => c.id === id);
    if (ch?.slug === 'ride-sharing') {
      // Ride Sharing has its own dedicated, fully-built page (live ride board,
      // join/leave, seats, realtime) — route there instead of the generic
      // discussion feed used by other channels.
      onNavigate?.('rideshare');
      return;
    }
    setActiveChannelId(id);
    if (ch) setUnreadCounts(prev => ({ ...prev, [id]: 0, [ch.slug]: 0 }));
  };

  const handleJumpToChannelSlug = (slug) => {
    const ch = channels.find(c => c.slug === slug);
    if (ch) handleSelect(ch.id);
  };

  const handleVote = async (postId, vote) => {
    if (!user) return;
    const current = userVotes[postId];
    if (current === vote) {
      // toggle off
      setUserVotes(p => { const n = { ...p }; delete n[postId]; return n; });
      setPosts(p => p.map(x => x.id === postId ? { ...x, like_count: vote === 1 ? Math.max(0, (x.like_count||0) - 1) : x.like_count, downvote_count: vote === -1 ? Math.max(0, (x.downvote_count||0) - 1) : x.downvote_count } : x));
      await supabase.from('community_votes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      const weight = Math.max(1, profile?.trust_score || 1);
      setUserVotes(p => ({ ...p, [postId]: vote }));
      setPosts(p => p.map(x => {
        if (x.id !== postId) return x;
        let like = x.like_count || 0, down = x.downvote_count || 0;
        if (current === 1) like = Math.max(0, like - 1);
        if (current === -1) down = Math.max(0, down - 1);
        if (vote === 1) like += weight; else down += weight;
        return { ...x, like_count: like, downvote_count: down };
      }));
      await supabase.from('community_votes').upsert({ post_id: postId, user_id: user.id, vote }, { onConflict: 'post_id,user_id' });
    }
  };

  const handleSave = async (postId, isSaved) => {
    if (!user) return;
    if (isSaved) {
      setSavedPosts(p => { const n = { ...p }; delete n[postId]; return n; });
      await supabase.from('community_saved').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      setSavedPosts(p => ({ ...p, [postId]: true }));
      await supabase.from('community_saved').upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' });
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    setPosts(p => p.filter(x => x.id !== postId));
    await supabase.from('community_posts').delete().eq('id', postId);
  };

  const handleReport = async (postId, reason, details) => {
    if (!user) return;
    await supabase.from('community_reports').insert({ post_id: postId, reporter_id: user.id, reason, details: details || null });
    setPosts(p => p.map(x => x.id === postId ? { ...x, report_count: (x.report_count || 0) + 1 } : x));
  };

  const handleRestore = async (postId) => {
    if (!isAdmin) return;
    await supabase.from('community_posts').update({ is_removed: false }).eq('id', postId);
    setPosts(p => p.map(x => x.id === postId ? { ...x, is_removed: false } : x));
  };

  const handleViewAnyway = (postId) => setViewAnyway(v => ({ ...v, [postId]: true }));

  const handlePostCreated = (p) => {
    setPosts(prev => [p, ...prev]);
    const ch = channels.find(c => c.id === p.channel_id);
    if (ch) {
      const chMeta = getChannelMeta(ch.slug);
      if (chMeta) setActivityChannels(prev => prev.includes(chMeta.slug) ? prev : [chMeta.slug, ...prev]);
      if (ch.id !== activeChannelId) setActiveChannelId(ch.id);
    }
  };

  const handlePostEdited = (id, upd) => setPosts(prev => prev.map(p => p.id === id ? { ...p, ...upd } : p));

  const handleChatPost = async (text) => {
    if (!user || !activeChannelId) return;
    const { data } = await supabase.from('community_posts')
      .insert({ channel_id: activeChannelId, author_id: user.id, title: text, body: null, is_anonymous: false, post_type: 'post' })
      .select(POST_SELECT)
      .single();
    if (data) setPosts(prev => [...prev, data]);
  };

  const activeChannel  = channels.find(c => c.id === activeChannelId);
  const activeSlug     = activeChannel?.slug || '';
  const activeName     = activeChannel?.name || 'Community';
  const activeMeta     = getChannelMeta(activeSlug);
  const isChat              = activeMeta?.type === 'chat';
  const isGeneral           = activeSlug === 'general';
  const isNeighbourhoodUpdates = activeSlug === 'neighbourhood-updates';
  const isDiscussionChannel = !isGeneral && !isNeighbourhoodUpdates && DISCUSSION_CHANNEL_SLUGS.includes(activeSlug);

  // Pass up to 8 recent chat messages as an array so CommunityChatCard
  // can cycle through them every 2 s like a live ticker.
  const latestChatMessage = useMemo(() => {
    if (!isGeneral || posts.length === 0) return [];
    return posts
      .slice(-8)          // last 8 posts
      .reverse()          // newest first
      .map(p => {
        const name = p.is_anonymous ? 'Anonymous' : (p.profiles?.full_name || p.profiles?.username || 'Someone');
        const text = p.title || p.body || '';
        return text ? { name, text } : null;
      })
      .filter(Boolean);
  }, [isGeneral, posts]);

  const activeDiscussion = allDiscussions.find(d => d.id === activeDiscussionId) || null;

  const handleCreateDiscussion = async ({ title, community_channel, category, description }) => {
    if (!user) { onNavigate?.('auth'); return; }
    setCreatingDiscussion(true);
    try {
      const row = await createDiscussionRow({ title, description, community_channel, category, creator_id: user.id });
      setAllDiscussions(prev => [row, ...prev.filter(d => d.id !== row.id)]);
      setShowCreateDiscussion(false);
      // Auto-navigate into the newly created discussion (Segment 7.2)
      setTimeout(() => setActiveDiscussionId(row.id), 120);
    } catch (err) {
      console.error('Failed to create discussion:', err);
    } finally {
      setCreatingDiscussion(false);
    }
  };

  // Every new message updates last_activity_at (sorting / Trending /
  // Recently Active / Auto Archive), AND is appended to this discussion's
  // entry in discussionMessagesById so it's still there if the room is
  // closed and reopened later in the same session.
  const handleDiscussionMessage = (discussionId, message) => {
    const now = new Date().toISOString();
    setAllDiscussions(prev => prev.map(d => (d.id === discussionId ? { ...d, last_activity_at: now, status: 'active' } : d)));
    if (message) {
      setDiscussionMessagesById(prev => {
        const existing = prev[discussionId] || activeDiscussion?.seedMessages || [];
        return { ...prev, [discussionId]: [...existing, message] };
      });
    }
    touchDiscussionActivity(discussionId).catch((err) => console.error('Failed to update discussion activity:', err));
  };

  // ─ Presence (real online counts — Segment 2) ─
  // Neighbourhood Chat is a single permanent room ('general'). The current
  // user only counts as present while the chat screen is actually open —
  // viewing the preview card observes the live count without joining it.
  const generalOnlineCount = usePresenceCount('general', user?.id, showChatScreen);

  // Every Discussion card needs a live count even before it's been opened,
  // so we watch all of them at once (read-only — joining happens only once
  // a room is actually opened, inside DiscussionRoom itself).
  const discussionRoomKeys = useMemo(() => allDiscussions.map(d => `discussion:${d.id}`), [allDiscussions]);
  const discussionCounts = usePresenceCounts(discussionRoomKeys);
  const getMemberCount = useCallback((id) => discussionCounts[`discussion:${id}`] ?? 0, [discussionCounts]);

  // Single Community channel's discussion list (Sports, Ride Sharing,
  // Events, Marketplace, Jobs, Help, Lost & Found — General uses the
  // discovery groups below instead).
  const channelDiscussions = useMemo(
    () => allDiscussions.filter(d => d.community_channel === activeSlug),
    [allDiscussions, activeSlug]
  );
  const sortedChannelDiscussions = useMemo(
    () => sortDiscussions(channelDiscussions, discussionSort, getMemberCount),
    [channelDiscussions, discussionSort, getMemberCount]
  );

  // General's discovery hub — Trending / Recently Active / Popular, pulled
  // from every Community channel. The discussion still lives in its own
  // channel; General only surfaces it here.
  const discoveryGroups = useMemo(
    () => buildDiscoveryGroups(allDiscussions, getMemberCount),
    [allDiscussions, getMemberCount]
  );

  const getUnread = (slug) => unreadCounts[slug] || 0;
  const totalUnread = useMemo(() => Object.entries(unreadCounts).filter(([k]) => isNaN(Number(k))).reduce((a, [, v]) => a + v, 0), [unreadCounts]);

  // ─ What's Happening Nearby — navigation always follows the currently
  // displayed notification's own destination data, never a fixed handler.
  const handleHighlightSelect = (item) => {
    if (!item) return;
    if (item.destinationType === 'discussion') {
      const exists = allDiscussions.find(d => d.id === item.destination);
      if (exists) { setActiveDiscussionId(item.destination); return; }
    }
    // page / ride / pg / marketplace / event / job → app-level navigation
    onNavigate?.(item.destination);
  };

  const notifItems = CHANNELS
    .filter(ch => activityChannels.includes(ch.slug) && getUnread(ch.slug) > 0)
    .map(ch => ({ icon: ch.icon, channel: ch.name, text: 'has new activity', count: getUnread(ch.slug) }));

  return (
    <CommunityLayout>
      <AnimatePresence>
        {showDrawer && <CommunityDrawer isAdmin={isAdmin} onClose={() => setShowDrawer(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <SearchOverlay
            onClose={() => setShowSearch(false)}
            posts={posts}
            onJumpToChannel={handleJumpToChannelSlug}
            onOpenDiscussion={(id) => setActiveDiscussionId(id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && <FilterSheet onClose={() => setShowFilters(false)} filters={advFilters} setFilters={setAdvFilters} />}
      </AnimatePresence>

      <CommunityHeader
        onOpenDrawer={() => setShowDrawer(true)}
        onOpenSearch={() => setShowSearch(true)}
        onOpenActivity={() => setShowActivityCenter(true)}
        activityUnreadCount={activityUnreadCount}
        user={user}
        onNavigate={onNavigate}
        onPostClick={() => setShowModal(true)}
      />

      <AnimatePresence>
        {showActivityCenter && user && (
          <ActivityCenter userId={user.id} onClose={() => setShowActivityCenter(false)} />
        )}
      </AnimatePresence>

      <ChannelNavigation
        channels={channels}
        activeChannelId={activeChannelId}
        getUnread={getUnread}
        onSelect={handleSelect}
      />

      {!isChat && !isNeighbourhoodUpdates && (
        <CommunityFilters
          sort={sort}
          setSort={setSort}
          advFilters={advFilters}
          onOpenFilterSheet={() => setShowFilters(true)}
        />
      )}

      {/* ── Channel content ── */}
      {isGeneral ? (
        <GeneralExperience
          onlineCount={generalOnlineCount}
          latestMessage={latestChatMessage}
          onJoinChat={() => setShowChatScreen(true)}
          tickerDiscussions={discoveryGroups.trending.length > 0 ? discoveryGroups.trending : discoveryGroups.recentlyActive}
          onNavigate={(dest, id) => {
            if (dest === 'general-chat') { setShowChatScreen(true); return; }
            if (dest === 'discussion' && id) { setActiveDiscussionId(id); return; }
            onNavigate?.(dest);
          }}
          trending={{ items: discoveryGroups.trending, loading: discussionsLoading }}
          recentlyActive={{ items: discoveryGroups.recentlyActive, loading: discussionsLoading }}
          popular={{ items: discoveryGroups.popular, loading: discussionsLoading }}
          getChannelMeta={getChannelMeta}
          getMemberCount={getMemberCount}
          onJoinDiscussion={(id) => setActiveDiscussionId(id)}
          onCreateDiscussion={() => setShowCreateDiscussion(true)}
          viewerId={user?.id}
        />
      ) : isDiscussionChannel ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <DiscussionSection
            mode="channel"
            channelSlug={activeSlug}
            channelMeta={activeMeta}
            discussions={sortedChannelDiscussions}
            loading={discussionsLoading}
            sort={discussionSort}
            onSortChange={setDiscussionSort}
            getChannelMeta={getChannelMeta}
            getMemberCount={getMemberCount}
            onJoin={(id) => setActiveDiscussionId(id)}
            onCreate={() => setShowCreateDiscussion(true)}
          />
        </div>
      ) : isNeighbourhoodUpdates ? (
        <NeighbourhoodUpdates
          channel={activeChannel}
          user={user}
          isAdmin={isAdmin}
          autoOpen={autoOpenUpdateModal}
        />
      ) : (
        <ChannelPlaceholder activeMeta={activeMeta} activeName={activeName} />
      )}

      <AnimatePresence>
        {showChatScreen && (
          <CommunityChatScreen
            onBack={() => setShowChatScreen(false)}
            posts={posts}
            initialLoad={initialLoad}
            user={user}
            onDelete={handleDelete}
            onPost={handleChatPost}
            onlineCount={generalOnlineCount}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeDiscussion && (
          <DiscussionRoom
            key={activeDiscussion.id}
            discussion={activeDiscussion}
            messages={discussionMessagesById[activeDiscussion.id] || activeDiscussion.seedMessages || []}
            user={user}
            onBack={() => setActiveDiscussionId(null)}
            onLeave={() => setActiveDiscussionId(null)}
            onMessage={handleDiscussionMessage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateDiscussion && (
          <CreateDiscussionSheet
          onClose={() => setShowCreateDiscussion(false)}
          onCreate={handleCreateDiscussion}
          defaultChannelSlug={activeSlug}
          submitting={creatingDiscussion}
            user={user}
              />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <CreatePostModal onClose={() => setShowModal(false)} onCreated={handlePostCreated} channels={channels} currentChannelId={activeChannelId} user={user} isAdmin={isAdmin} />
        )}
      </AnimatePresence>
    </CommunityLayout>
  );
}
