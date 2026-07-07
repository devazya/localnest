/**
 * DiscussionRoom.jsx — Community module (Segment 2)
 * Full-screen temporary discussion room. Premium bubble design matching
 * the reference: username inside bubble, timestamp inside bubble,
 * floating reaction pill, 44px avatar outside, 24px radius throughout.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import CommunityComposer from './CommunityComposer';
import SportIcon from './SportIcon';
import SeenBySheet from './SeenBySheet';
import { timeAgo, groupMessages, getPastelIdentity } from './utils';
import { CHANNEL_EMOJI, getRoomAtmosphere } from './constants';
import { usePresence } from '../../hooks/usePresence';
import AnimatedNumber from './AnimatedNumber';
import MentionText from './MentionText';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../context/AuthContext';
import {
  getOrCreateDiscussionConversation,
  ensureConversationMembership,
  fetchDiscussionMessages,
  sendDiscussionMessage,
  subscribeToDiscussionMessages,
  subscribeToDiscussionReactions,
  fetchProfile,
  canEditMessage,
  editDiscussionMessage,
  deleteDiscussionMessage,
  toggleDiscussionReaction,
} from '../../services/discussionMessages';

// ── NEW: Reusable hero component driven by discussionThemes.js config ─────────
import DiscussionHero from './DiscussionHero';

const NEAR_BOTTOM_PX = 120;
const BUBBLE_EASE = [0.22, 0.61, 0.36, 1];
// Part 5 — reaction picker options (long-press).
const REACTION_PICKER_EMOJIS = ['❤️', '😂', '🔥', '👏', '😮', '😢', '👍', '🎉'];
const QUICK_LIKE_EMOJI = '❤️';

// Part 3 — long messages never fill the whole screen by default.
const LONG_MESSAGE_CHAR_LIMIT = 480; // roughly 8-10 lines at this bubble width
const DOUBLE_TAP_MS = 300;
const LONG_PRESS_MS = 450;

const ACTION_PILLS = {
  general:        [{ label: 'Create Poll', icon: '📊' }],
  sports:         [{ label: 'Join Voice', icon: '🎙️' }, { label: 'Create Poll', icon: '📊' }],
  events:         [{ label: 'Create Poll', icon: '📊' }, { label: 'Share Details', icon: '🔗' }],
  'ride-sharing': [{ label: 'Find Ride', icon: '🚗' }, { label: 'Create Poll', icon: '📊' }],
  default:        [{ label: 'Create Poll', icon: '📊' }],
};

const POLL_PREFIX = '__POLL__';
const POLL_OPTION_EMOJIS = ['1\u20e3', '2\u20e3', '3\u20e3', '4\u20e3'];

export default function DiscussionRoom({ discussion, user, onBack, onLeave, onMessage }) {
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unseenCount, setUnseenCount]   = useState(0);
  const [seenProfiles, setSeenProfiles] = useState({});
  const [showSeenBy, setShowSeenBy]     = useState(false);

  // ── Poll creation (Create Poll pill) ──
  const [showPollSheet, setShowPollSheet] = useState(false);
  const [pollQuestion, setPollQuestion]   = useState('');
  const [pollOptions, setPollOptions]     = useState(['', '']);
  const [pollSubmitting, setPollSubmitting] = useState(false);

  // ── Persisted messages (Supabase-backed) ──
  // Fixes the "messages disappear on refresh" bug: this room's chat now
  // lives in the generic conversations/messages tables (context_type =
  // 'community', context_id = discussion.id) instead of only in memory.
  const [messages, setMessages]       = useState([]);
  const [conversationId, setConvId]   = useState(null);
  const [messagesLoading, setMsgLoad] = useState(true);

  // Part 3 — which long messages the user has expanded ("Read more").
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  // Part 4 — press-and-hold on your own message opens Edit/Delete/Cancel.
  // Part 5 — long-press on any message opens the reaction picker. Both
  // live in one combined bottom sheet, keyed by the target message.
  const [actionSheetMsg, setActionSheetMsg] = useState(null);
  const [editingMsg, setEditingMsg]         = useState(null); // { id, text }

  const listRef    = useRef(null);
  const bottomRef  = useRef(null);
  const prevLenRef = useRef(0);
  const pressTimerRef = useRef(null);
  const lastTapRef    = useRef({}); // messageId -> timestamp, for double-tap

  const { profile: myProfile } = useAuth();
  const { onlineCount, roomMembers } = usePresence(`discussion:${discussion.id}`, { userId: user?.id, active: true });
  const atmosphere = getRoomAtmosphere(discussion.community_channel);
  const pills      = ACTION_PILLS[discussion.community_channel] || ACTION_PILLS.default;

  const readingCount = onlineCount;
  // Real typing indicator (replaces the old fake formula derived from
  // onlineCount, which showed "typing" constantly and looked scripted).
  // Driven by an actual broadcast channel: composer sends a lightweight
  // 'typing' event as the user types, listeners clear it out after a
  // short idle window.
  const [typingUsers, setTypingUsers] = useState({}); // userId -> last-seen ms
  const typingChannelRef = useRef(null);
  const typingTimeoutsRef = useRef({});
  const lastTypingSentRef = useRef(0);

  useEffect(() => {
    const channel = supabase.channel(`typing:${discussion.id}`, { config: { broadcast: { self: false } } });
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload?.userId || payload.userId === user?.id) return;
      setTypingUsers(prev => ({ ...prev, [payload.userId]: Date.now() }));
      clearTimeout(typingTimeoutsRef.current[payload.userId]);
      typingTimeoutsRef.current[payload.userId] = setTimeout(() => {
        setTypingUsers(prev => { const n = { ...prev }; delete n[payload.userId]; return n; });
      }, 2500);
    });
    channel.subscribe();
    typingChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [discussion.id, user?.id]);

  // Debounced sender — called from the composer on every keystroke, but
  // only actually broadcasts at most once every 1.5s.
  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;
    typingChannelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: user?.id } });
  }, [user?.id]);

  const typingCount = Object.keys(typingUsers).length;

  // ── 1) Initial load: get/create the room's conversation, join it, fetch
  //       every existing message (oldest → newest). Runs whenever the
  //       discussion or signed-in user changes — including on every page
  //       refresh, since that remounts DiscussionRoom from scratch.
  useEffect(() => {
    if (!user?.id) { setMessages([]); setConvId(null); setMsgLoad(false); return; }
    let cancelled = false;
    setMsgLoad(true);
    (async () => {
      try {
        const convId = await getOrCreateDiscussionConversation(discussion.id, user.id);
        await ensureConversationMembership(convId, user.id);
        const rows = await fetchDiscussionMessages(convId);
        if (cancelled) return;
        setConvId(convId);
        setMessages(rows.map(r => ({
          id: r.id,
          author_id: r.sender_id,
          profiles: r.profiles,
          title: r.message,
          created_at: r.created_at,
          edited_at: r.edited_at,
          deleted_at: r.deleted_at,
          reactions: r.reactions || {},
        })));
      } catch (err) {
        console.error('Failed to load discussion messages:', err);
      } finally {
        if (!cancelled) setMsgLoad(false);
      }
    })();
    return () => { cancelled = true; };
  }, [discussion.id, user?.id]);

  // ── 2) Realtime: append-only. New rows are added if not already present
  //       (covers our own optimistic-free flow — sendDiscussionMessage's
  //       response already adds it, so this mainly covers OTHER users'
  //       messages); existing messages are never replaced or cleared here.
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToDiscussionMessages(conversationId, {
      onInsert: async (row) => {
        setMessages(prev => (prev.some(m => m.id === row.id) ? prev : [...prev, {
          id: row.id,
          author_id: row.sender_id,
          profiles: row.sender_id === user?.id
            ? { id: user.id, full_name: myProfile?.full_name, username: myProfile?.username, avatar_url: myProfile?.avatar_url }
            : null,
          title: row.message,
          created_at: row.created_at,
          edited_at: row.edited_at,
          deleted_at: row.deleted_at,
          reactions: {},
        }]));
        if (row.sender_id !== user?.id) {
          try {
            const profile = await fetchProfile(row.sender_id);
            setMessages(prev => prev.map(m => (m.id === row.id ? { ...m, profiles: profile } : m)));
          } catch { /* profile fetch is best-effort; message still shows with fallback name */ }
        }
      },
      // Covers both edits and delete-for-everyone (a soft-delete update) —
      // syncs instantly for every viewer, not just the sender.
      onUpdate: (row) => {
        setMessages(prev => prev.map(m => (m.id === row.id ? {
          ...m,
          title: row.message,
          edited_at: row.edited_at,
          deleted_at: row.deleted_at,
        } : m)));
      },
    });
    return unsubscribe;
  }, [conversationId, user?.id, myProfile]);

  // Part 5 — realtime reaction sync. message_reactions has no
  // conversation_id column, so we filter to messages currently rendered.
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToDiscussionReactions(conversationId, (payload) => {
      const row = payload.new?.message_id ? payload.new : payload.old;
      if (!row) return;
      setMessages(prev => {
        if (!prev.some(m => m.id === row.message_id)) return prev;
        return prev.map(m => {
          if (m.id !== row.message_id) return m;
          const reactions = { ...m.reactions };
          // Remove this user from every emoji bucket first (a user can only
          // hold one reaction at a time), then re-add on INSERT/UPDATE.
          Object.keys(reactions).forEach(emoji => {
            reactions[emoji] = reactions[emoji].filter(id => id !== row.user_id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          });
          if (payload.eventType !== 'DELETE') {
            (reactions[payload.new.emoji] ||= []).push(payload.new.user_id);
          }
          return { ...m, reactions };
        });
      });
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    const missing = roomMembers.filter(id => id !== user?.id && !seenProfiles[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    supabase.from('profiles').select('id,full_name,username,avatar_url').in('id', missing)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setSeenProfiles(prev => {
          const next = { ...prev };
          data.forEach(row => { next[row.id] = row; });
          return next;
        });
      });
    return () => { cancelled = true; };
  }, [roomMembers, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const viewers = useMemo(
    () => roomMembers.filter(id => id !== user?.id).map(id => seenProfiles[id]).filter(Boolean),
    [roomMembers, user?.id, seenProfiles]
  );

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    setUnseenCount(0);
  }, []);

  useEffect(() => { scrollToBottom('auto'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const added = messages.length - prevLenRef.current;
    prevLenRef.current = messages.length;
    if (added <= 0) return;
    if (isNearBottom) scrollToBottom('smooth');
    else setUnseenCount(n => n + added);
  }, [messages.length, isNearBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(dist < NEAR_BOTTOM_PX);
  };

  // ── 3) Send: persist to Supabase FIRST, then reflect locally with the
  //       real row (real id, real created_at) — no more fake local-only
  //       message that vanished on refresh.
  const submit = async () => {
    if (!text.trim() || !user || !conversationId) return;
    const content = text.trim();

    // Part 4 — editing an existing message instead of sending a new one.
    if (editingMsg) {
      const { id } = editingMsg;
      setEditingMsg(null);
      setText('');
      try {
        const row = await editDiscussionMessage(id, user.id, content);
        setMessages(prev => prev.map(m => (m.id === id ? { ...m, title: row.message, edited_at: row.edited_at } : m)));
      } catch (err) {
        console.error('Failed to edit discussion message:', err);
      }
      return;
    }

    setSubmitting(true);
    setText('');
    try {
      const row = await sendDiscussionMessage(conversationId, user.id, content);
      setMessages(prev => (prev.some(m => m.id === row.id) ? prev : [...prev, {
        id: row.id,
        author_id: row.sender_id,
        profiles: row.profiles || {
          id: user.id,
          full_name: myProfile?.full_name,
          username: myProfile?.username,
          avatar_url: myProfile?.avatar_url,
        },
        title: row.message,
        created_at: row.created_at,
        edited_at: row.edited_at,
        deleted_at: row.deleted_at,
        reactions: row.reactions || {},
      }]));
      setIsNearBottom(true);
    } catch (err) {
      console.error('Failed to send discussion message:', err);
      setText(content); // restore so the user doesn't lose what they typed
    } finally {
      setSubmitting(false);
    }
    // Still bumps last_activity_at / status for sorting + auto-archive.
    // Message payload no longer needed upstream — persistence now lives here.
    onMessage?.(discussion.id, null);
  };

  const cancelEdit = () => { setEditingMsg(null); setText(''); };

  // ── Poll creation ──
  const openPollSheet = () => { setPollQuestion(''); setPollOptions(['', '']); setShowPollSheet(true); };

  const handlePillClick = (label) => {
    if (label === 'Create Poll') openPollSheet();
  };

  const updatePollOption = (i, value) => setPollOptions(prev => prev.map((o, idx) => (idx === i ? value : o)));
  const addPollOption = () => setPollOptions(prev => (prev.length < 4 ? [...prev, ''] : prev));
  const removePollOption = (i) => setPollOptions(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));

  const submitPoll = async () => {
    const question = pollQuestion.trim();
    const options  = pollOptions.map(o => o.trim()).filter(Boolean);
    if (!question || options.length < 2 || !user || !conversationId) return;
    setPollSubmitting(true);
    try {
      const content = POLL_PREFIX + JSON.stringify({ question, options: options.slice(0, 4) });
      const row = await sendDiscussionMessage(conversationId, user.id, content);
      setMessages(prev => (prev.some(m => m.id === row.id) ? prev : [...prev, {
        id: row.id,
        author_id: row.sender_id,
        profiles: row.profiles || {
          id: user.id,
          full_name: myProfile?.full_name,
          username: myProfile?.username,
          avatar_url: myProfile?.avatar_url,
        },
        title: row.message,
        created_at: row.created_at,
        edited_at: row.edited_at,
        deleted_at: row.deleted_at,
        reactions: row.reactions || {},
      }]));
      setIsNearBottom(true);
      setShowPollSheet(false);
      onMessage?.(discussion.id, null);
    } catch (err) {
      console.error('Failed to create poll:', err);
    } finally {
      setPollSubmitting(false);
    }
  };

  const startEdit = (msg) => {
    setActionSheetMsg(null);
    setEditingMsg({ id: msg.id, text: msg.title });
    setText(msg.title);
  };

  const handleDelete = async (msg) => {
    if (!user) return;
    setActionSheetMsg(null);
    try {
      const row = await deleteDiscussionMessage(msg.id, user.id);
      setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, title: row.message, deleted_at: row.deleted_at } : m)));
    } catch (err) {
      console.error('Failed to delete discussion message:', err);
    }
  };

  const handleReact = async (msg, emoji) => {
    if (!user) return;
    // Optimistic update — the realtime subscription will reconcile it.
    setMessages(prev => prev.map(m => {
      if (m.id !== msg.id) return m;
      const reactions = { ...m.reactions };
      Object.keys(reactions).forEach(e => {
        reactions[e] = reactions[e].filter(id => id !== user.id);
        if (reactions[e].length === 0) delete reactions[e];
      });
      const alreadyHadThis = (m.reactions[emoji] || []).includes(user.id);
      if (!alreadyHadThis) (reactions[emoji] ||= []).push(user.id);
      return { ...m, reactions };
    }));
    try {
      await toggleDiscussionReaction(msg.id, user.id, emoji);
    } catch (err) {
      console.error('Failed to react to message:', err);
    }
  };

  // Double tap → quick like. Long press → reaction picker (+ Edit/Delete/
  // Cancel underneath, if it's your own message).
  const handleBubblePress = (msg) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[msg.id] || 0;
    if (now - lastTap < DOUBLE_TAP_MS) {
      lastTapRef.current[msg.id] = 0;
      handleReact(msg, QUICK_LIKE_EMOJI);
    } else {
      lastTapRef.current[msg.id] = now;
    }
  };

  const startPressTimer = (msg) => {
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => setActionSheetMsg(msg), LONG_PRESS_MS);
  };
  const clearPressTimer = () => clearTimeout(pressTimerRef.current);

  const toggleExpanded = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const groups    = groupMessages(messages);
  const lastMsgId = messages[messages.length - 1]?.id;

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500, background: '#EEEEFF',
        backgroundImage: atmosphere.bg,
        display: 'flex', flexDirection: 'column', height: '100dvh',
        willChange: 'transform',
        contain: 'layout paint',
      }}
    >
      {/* ── Hero header — driven entirely by DiscussionHero + discussionThemes.js ──
          Rendered in its own stacking layer with a higher z-index than the
          chat list below it, so the pinned card (which bleeds out of the
          hero's bottom edge) visually sits ON TOP of scrolled messages. */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <DiscussionHero
          discussion={discussion}
          themeKey={discussion.community_channel}
          onlineCount={onlineCount}
          readingCount={readingCount}
          typingCount={typingCount}
          pills={pills}
          onBack={onBack}
          onLeave={onLeave}
          onPillClick={handlePillClick}
        />
      </div>

      {/* ── Message area — a rounded "sheet" that slides up underneath the
          pinned card and hero, so its own solid background occludes
          messages as they scroll past that point (the "disappear behind
          the pinned card" effect). ── */}
      <div style={{
        flex: 1, minHeight: 0, padding: '30px 14px 0', display: 'flex', flexDirection: 'column', position: 'relative',
        marginTop: -30, zIndex: 1, background: '#EEEEFF', backgroundImage: atmosphere.bg,
        borderRadius: '26px 26px 0 0',
        boxShadow: '0 -10px 24px -8px rgba(20,10,50,0.18)',
      }}>
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8, paddingRight: 2 }}
        >
          {messagesLoading && messages.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9CA3AF', padding: '12px 0', fontFamily: 'var(--font-sans)' }}>
              Loading messages…
            </div>
          )}
          {groups.map((group, gi) => {
            const identity    = getPastelIdentity(group.authorId);
            const displayName = group.profile?.full_name || group.profile?.username || 'User';

            return (
              <div key={group.items[0].id} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>

                {/* Avatar — 44px, outside bubble */}
                <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
                  <Avatar profile={group.profile} size={44} />
                </div>

                {/* Bubble column — alignItems: 'flex-start' is the Part 2
                    fix: without it, flex stretch made every bubble take the
                    full column width (near-square for short text) instead
                    of shrinking to fit its content, iMessage/Instagram-style. */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  {group.items.map((msg, mi) => {
                    const reactionEntries = Object.entries(msg.reactions || {}).filter(([, ids]) => ids.length > 0);
                    const hasReaction   = reactionEntries.length > 0;
                    const isLastMsg     = msg.id === lastMsgId;
                    const isDeleted     = !!msg.deleted_at;

                    // Part 3 — collapse very long messages by default.
                    const isLong     = !isDeleted && (msg.title || '').length > LONG_MESSAGE_CHAR_LIMIT;
                    const isExpanded = expandedIds.has(msg.id);
                    const displayText = isLong && !isExpanded
                      ? `${msg.title.slice(0, LONG_MESSAGE_CHAR_LIMIT)}…`
                      : msg.title;

                    // Poll messages are stored as a plain-text message with
                    // a __POLL__ prefix + JSON payload (question/options) —
                    // no new table needed. Votes reuse the existing single-
                    // reaction-per-user system: option N maps to emoji N,
                    // so handleReact already enforces "one vote per person".
                    let poll = null;
                    if (!isDeleted && (msg.title || '').startsWith(POLL_PREFIX)) {
                      try { poll = JSON.parse(msg.title.slice(POLL_PREFIX.length)); } catch { poll = null; }
                    }
                    const pollTotalVotes = poll
                      ? poll.options.reduce((sum, _, i) => sum + ((msg.reactions?.[POLL_OPTION_EMOJIS[i]] || []).length), 0)
                      : 0;
                    const myPollVoteIdx = poll
                      ? poll.options.findIndex((_, i) => (msg.reactions?.[POLL_OPTION_EMOJIS[i]] || []).includes(user?.id))
                      : -1;

                    return (
                      <div key={msg.id} style={{ position: 'relative', paddingBottom: hasReaction ? 16 : 0, alignSelf: 'flex-start', maxWidth: '84%' }}>

                        {/* Bubble */}
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{
                            y: -2,
                            boxShadow: '0 2px 6px rgba(30,30,60,0.05), 0 10px 28px rgba(30,30,60,0.11), inset 0 1px 0 rgba(255,255,255,0.9)',
                          }}
                          transition={{ duration: 0.25, ease: BUBBLE_EASE }}
                          onPointerDown={() => { if (!isDeleted) startPressTimer(msg); }}
                          onPointerUp={clearPressTimer}
                          onPointerLeave={clearPressTimer}
                          onClick={() => { if (!isDeleted) handleBubblePress(msg); }}
                          style={{
                            display: 'inline-block', width: 'fit-content', maxWidth: '100%',
                            background: `linear-gradient(135deg, ${identity.tint} 0%, rgba(255,255,255,0.97) 65%)`,
                            border: `1px solid ${identity.solid}33`,
                            borderLeft: `3px solid ${identity.solid}`,
                            boxShadow: '0 1px 3px rgba(30,30,60,0.04), 0 8px 20px rgba(30,30,60,0.07), inset 0 1px 0 rgba(255,255,255,0.85)',
                            borderRadius: 24,
                            padding: '10px 18px',
                            position: 'relative',
                            cursor: isDeleted ? 'default' : 'pointer',
                          }}
                        >
                          {/* Username — only on first bubble */}
                          {mi === 0 && (
                            <div style={{
                              fontSize: 14, fontWeight: 600, color: identity.solid,
                              marginBottom: 1, fontFamily: 'var(--font-sans)', letterSpacing: 0, lineHeight: 1.25,
                            }}>
                              {displayName}
                            </div>
                          )}

                          {/* Message */}
                          {isDeleted ? (
                            <div style={{
                              fontSize: 14.5, fontStyle: 'italic', color: '#9CA3AF',
                              lineHeight: 1.45, fontFamily: 'var(--font-sans)',
                            }}>
                              This message was deleted
                            </div>
                          ) : poll ? (
                            <div style={{ minWidth: 200 }}>
                              <div style={{
                                fontSize: 14.5, fontWeight: 700, color: '#1A1A1A',
                                marginBottom: 8, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                <span>📊</span>{poll.question}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {poll.options.map((opt, i) => {
                                  const emoji = POLL_OPTION_EMOJIS[i];
                                  const voteCount = (msg.reactions?.[emoji] || []).length;
                                  const pct = pollTotalVotes > 0 ? Math.round((voteCount / pollTotalVotes) * 100) : 0;
                                  const isMine = myPollVoteIdx === i;
                                  return (
                                    <button
                                      key={i}
                                      onClick={(e) => { e.stopPropagation(); handleReact(msg, emoji); }}
                                      style={{
                                        position: 'relative', textAlign: 'left', border: `1.5px solid ${isMine ? identity.solid : 'rgba(0,0,0,0.08)'}`,
                                        borderRadius: 12, padding: '8px 10px', background: '#fff', cursor: 'pointer',
                                        overflow: 'hidden', fontFamily: 'var(--font-sans)',
                                      }}
                                    >
                                      <div style={{
                                        position: 'absolute', inset: 0, width: `${pct}%`,
                                        background: `${identity.solid}22`, transition: 'width 0.3s ease',
                                      }} />
                                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                        <span style={{ fontSize: 13.5, fontWeight: isMine ? 700 : 500, color: '#1A1A1A' }}>
                                          {isMine ? '✓ ' : ''}{opt}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', flexShrink: 0 }}>
                                          {voteCount > 0 ? `${pct}%` : ''}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, fontFamily: 'var(--font-sans)' }}>
                                {pollTotalVotes} vote{pollTotalVotes !== 1 ? 's' : ''}
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              fontSize: 15, fontWeight: 400, color: '#1A1A1A',
                              lineHeight: 1.45, wordBreak: 'break-word', fontFamily: 'var(--font-sans)',
                            }}>
                              <MentionText text={displayText} />
                              {isLong && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleExpanded(msg.id); }}
                                  style={{
                                    display: 'block', marginTop: 4, background: 'none', border: 'none', padding: 0,
                                    fontSize: 13, fontWeight: 600, color: identity.solid, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                  }}
                                >
                                  {isExpanded ? 'Show less' : 'Read more…'}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Timestamp (+ Edited) */}
                          <div style={{
                            fontSize: 11.5, fontWeight: 500, color: '#A0A8B8',
                            marginTop: 3, fontFamily: 'var(--font-sans)',
                          }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.edited_at && !isDeleted && ' • Edited'}
                          </div>
                        </motion.div>

                        {/* Reaction pill(s) */}
                        {hasReaction && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, ease: BUBBLE_EASE }}
                            style={{
                              position: 'absolute', bottom: -6, right: -6,
                              background: '#fff', borderRadius: 999, padding: '4px 10px',
                              fontSize: 12.5, fontWeight: 600, color: '#6B7280',
                              boxShadow: '0 1px 2px rgba(30,30,60,0.06), 0 6px 16px rgba(30,30,60,0.10)',
                              display: 'flex', alignItems: 'center', gap: 4,
                              border: '1px solid rgba(255,255,255,0.9)', zIndex: 2,
                              fontFamily: 'var(--font-sans)', cursor: 'pointer',
                            }}
                            onClick={() => setActionSheetMsg(msg)}
                          >
                            {reactionEntries.map(([emoji, ids]) => (
                              <span key={emoji} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <span style={{ fontSize: 13 }}>{emoji}</span>
                                {ids.length > 1 && <span>{ids.length}</span>}
                              </span>
                            ))}
                          </motion.div>
                        )}

                        {/* Read receipts — only under the very last message */}
                        {isLastMsg && viewers.length > 0 && (
                          <button
                            onClick={() => setShowSeenBy(true)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            }}
                          >
                            <div style={{ display: 'flex' }}>
                              {viewers.slice(0, 3).map((v, i) => (
                                <div key={v.id} style={{ marginLeft: i === 0 ? 0 : -8, width: 17, height: 17, borderRadius: '50%', border: '1.5px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                                  <Avatar profile={v} size={17} disablePreview />
                                </div>
                              ))}
                            </div>
                            <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'var(--font-sans)' }}>
                              {viewers.length <= 3
                                ? `Seen by ${viewers.map(v => v.full_name || v.username).join(', ')}`
                                : `Seen by ${viewers.slice(0, 2).map(v => v.full_name || v.username).join(', ')} and ${viewers.length - 2} others`}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Scroll-to-bottom chevron */}
        {!isNearBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            style={{
              position: 'absolute', right: 8, bottom: unseenCount > 0 ? 54 : 12,
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: atmosphere.accent, color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 16px -4px ${atmosphere.accent}88`, zIndex: 5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        )}

        <AnimatePresence>
          {!isNearBottom && unseenCount > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              onClick={() => scrollToBottom('smooth')}
              style={{
                position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)',
                background: atmosphere.accent, color: '#fff', border: 'none', borderRadius: 999,
                padding: '8px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                boxShadow: `0 8px 20px -6px ${atmosphere.accent}66`,
                display: 'flex', alignItems: 'center', gap: 6, zIndex: 5,
                fontFamily: 'var(--font-sans)',
              }}
            >
              ↓ {unseenCount} New Message{unseenCount > 1 ? 's' : ''}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Composer */}
        <div style={{
          flexShrink: 0, padding: '10px 0 calc(env(safe-area-inset-bottom, 0px) + 12px)',
          borderTop: '1.5px solid rgba(240,239,255,0.8)', marginTop: 4,
          background: 'linear-gradient(180deg, rgba(238,238,255,0) 0%, #EEEEFF 40%)',
        }}>
          {editingMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 14px', marginBottom: 6, fontSize: 12.5, fontFamily: 'var(--font-sans)',
              color: '#6B7280',
            }}>
              <span>Editing message</span>
              <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: atmosphere.accent, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                Cancel
              </button>
            </div>
          )}
          <div style={{ borderRadius: 20, boxShadow: '0 -4px 18px -6px rgba(45,15,120,0.14), 0 10px 24px -8px rgba(45,15,120,0.22)' }}>
            <CommunityComposer user={user} text={text} setText={setText} onSubmit={submit} submitting={submitting} accent={atmosphere.accent} onTyping={handleTyping} />
          </div>
        </div>
      </div>

      <SeenBySheet
        open={showSeenBy}
        onClose={() => setShowSeenBy(false)}
        viewers={viewers.map(v => ({ ...v, seenLabel: 'Online now' }))}
        creatorId={discussion.creator_id}
      />

      {/* Part 4 + 5 — combined bottom sheet: reaction picker for everyone,
          plus Edit / Delete for Everyone / Cancel if it's your own message. */}
      <AnimatePresence>
        {actionSheetMsg && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActionSheetMsg(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,40,0.35)', zIndex: 600 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 601,
                background: '#fff', borderRadius: '22px 22px 0 0', padding: '18px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              }}
            >
              {/* Reaction picker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px 16px' }}>
                {REACTION_PICKER_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { handleReact(actionSheetMsg, emoji); setActionSheetMsg(null); }}
                    style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', padding: 4 }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Edit / Delete — only for your own, non-deleted message */}
              {actionSheetMsg.author_id === user?.id && !actionSheetMsg.deleted_at && (
                <div style={{ borderTop: '1px solid #F0EFFF', paddingTop: 6 }}>
                  {canEditMessage(actionSheetMsg) && (
                    <button
                      onClick={() => startEdit(actionSheetMsg)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 8px', background: 'none', border: 'none', fontSize: 15.5, fontWeight: 500, color: '#1A1A1A', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(actionSheetMsg)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 8px', background: 'none', border: 'none', fontSize: 15.5, fontWeight: 500, color: '#E24C4C', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                  >
                    Delete for Everyone
                  </button>
                </div>
              )}

              <button
                onClick={() => setActionSheetMsg(null)}
                style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 6, padding: '12px 8px', background: '#F5F4FF', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
