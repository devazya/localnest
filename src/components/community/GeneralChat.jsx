/**
 * GeneralChat.jsx — Community module
 * Premium chat feed — pixel-perfect recreation of the reference design.
 * Floating pastel bubbles · avatar-outside layout · reaction pills
 * floating bottom-right · message grouping · typing indicator.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import CommunityComposer from './CommunityComposer';
import AnimatedNumber from './AnimatedNumber';
import MentionText from './MentionText';
import { groupMessages, getPastelIdentity } from './utils';

const NEAR_BOTTOM_PX = 120;
const ACCENT = '#6D4AFF';
const BUBBLE_EASE = [0.22, 0.61, 0.36, 1];

// Deterministic reaction emoji per group index
const REACTION_EMOJIS = ['❤️', '👍', '🎉', '😂', '🔥', '🌟'];

export default function GeneralChat({ posts, user, onDelete, onPost, onlineCount = 0 }) {
  const [text, setText]               = useState('');
  const [submitting, setSub]          = useState(false);
  const [typingName, setTypingName]   = useState('');
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);
  const listRef    = useRef(null);
  const bottomRef  = useRef(null);
  const prevLenRef = useRef(posts.length);

  // Simulated typing indicator
  useEffect(() => {
    if (posts.length === 0) return;
    const names = ['Rohit Sharma', 'Sneha Iyer', 'Aman Verma', 'Priya M.', 'Vikram R.'];
    let t;
    const cycle = () => {
      t = setTimeout(() => {
        setTypingName(names[Math.floor(Math.random() * names.length)]);
        setTimeout(() => { setTypingName(''); cycle(); }, 2800 + Math.random() * 800);
      }, 6000 + Math.random() * 12000);
    };
    cycle();
    return () => clearTimeout(t);
  }, [posts.length]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    setUnseenCount(0);
  }, []);

  useEffect(() => { scrollToBottom('auto'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const added = posts.length - prevLenRef.current;
    prevLenRef.current = posts.length;
    if (added <= 0) return;
    if (isNearBottom) scrollToBottom('smooth');
    else setUnseenCount(n => n + added);
  }, [posts.length, isNearBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(dist < NEAR_BOTTOM_PX);
  };

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSub(true);
    await onPost(text.trim());
    setText(''); setSub(false);
    setIsNearBottom(true);
  };

  const allGroups = groupMessages(
    posts.map(m => m.is_anonymous ? { ...m, author_id: `anon-${m.id}` } : m)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 280, position: 'relative' }}>

      {/* ── Live header pill ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'linear-gradient(135deg, #F8F7FF, #EDE9FF)',
        borderRadius: 12, padding: '9px 14px', marginBottom: 16,
        border: '1px solid #E8E4FF', flexShrink: 0,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0,
          boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
          animation: 'livePulse 2s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 13, color: '#6D4AFF', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Live chat · General</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#22C55E', fontWeight: 600, fontFamily: 'var(--font-sans)', display: 'inline-flex', gap: 4 }}>
          <AnimatedNumber value={onlineCount} /> online
        </span>
      </div>

      {/* ── Message list ── */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8, paddingRight: 2 }}
      >
        {allGroups.map((group, gi) => {
          const first       = group.items[0];
          const isAnon      = first.is_anonymous;
          const profile     = isAnon ? null : group.profile;
          const identity    = isAnon
            ? { tint: '#F3F4F6', solid: '#9CA3AF', ring: 'rgba(156,163,175,0.3)' }
            : getPastelIdentity(group.authorId);
          const displayName = isAnon
            ? 'Anonymous'
            : (profile?.full_name || profile?.username || 'User');

          return (
            <div key={first.id} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>

              {/* Avatar — 44px, outside the bubble, top-aligned */}
              <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
                {isAnon
                  ? (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )
                  : <Avatar profile={profile} size={44} />
                }
              </div>

              {/* Bubble column — all messages from this group stacked.
                  alignItems: 'flex-start' + the bubble's own
                  width: fit-content are what make each bubble hug its
                  text instead of stretching to the full column width
                  (which made short messages look square). */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                {group.items.map((msg, mi) => {
                  const hasReaction  = msg.like_count > 0;
                  const reactionEmoji = REACTION_EMOJIS[gi % REACTION_EMOJIS.length];
                  const isMe         = user && msg.author_id === user.id;

                  return (
                    /* Wrapper gives room for the floating reaction pill below the bubble */
                    <div
                      key={msg.id}
                      style={{
                        position: 'relative',
                        paddingBottom: hasReaction ? 16 : 0,
                        alignSelf: 'flex-start',
                        maxWidth: '75%',
                      }}
                    >
                      {/* ── Message bubble ── */}
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{
                          y: -2,
                          boxShadow: '0 2px 6px rgba(30,30,60,0.05), 0 10px 28px rgba(30,30,60,0.11), inset 0 1px 0 rgba(255,255,255,0.9)',
                        }}
                        transition={{ duration: 0.25, ease: BUBBLE_EASE }}
                        style={{
                          display: 'inline-block', width: 'fit-content', maxWidth: '100%',
                          background: `linear-gradient(135deg, rgba(255,255,255,0.99) 0%, ${identity.tint}22 45%, rgba(255,255,255,0.97) 100%)`,
                          border: '1px solid rgba(255,255,255,0.8)',
                          boxShadow: '0 1px 3px rgba(30,30,60,0.04), 0 8px 20px rgba(30,30,60,0.07), inset 0 1px 0 rgba(255,255,255,0.85)',
                          borderRadius: 24,
                          padding: '14px 19px',
                          position: 'relative',
                        }}
                      >
                        {/* Username — only on first bubble in a group */}
                        {mi === 0 && (
                          <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: identity.solid,
                            marginBottom: 3,
                            fontFamily: 'var(--font-sans)',
                            letterSpacing: 0,
                            lineHeight: 1.3,
                          }}>
                            {displayName}
                          </div>
                        )}

                        {/* Message text */}
                        <div style={{
                          fontSize: 15,
                          fontWeight: 400,
                          color: '#1A1A1A',
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          <MentionText text={msg.title || msg.body} />
                        </div>

                        {/* Timestamp — bottom left */}
                        <div style={{
                          fontSize: 11.5,
                          fontWeight: 500,
                          color: '#A0A8B8',
                          marginTop: 5,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Delete own message */}
                        {isMe && (
                          <button
                            onClick={() => onDelete(msg.id)}
                            style={{
                              position: 'absolute', top: 8, right: 10,
                              background: 'none', border: 'none', fontSize: 11,
                              color: '#DC2626', cursor: 'pointer', opacity: 0.3, padding: 2, lineHeight: 1,
                            }}
                          >✕</button>
                        )}
                      </motion.div>

                      {/* ── Reaction pill — floating, bottom-right, overlaps bubble ── */}
                      {hasReaction && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, ease: BUBBLE_EASE }}
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            background: '#ffffff',
                            borderRadius: 999,
                            padding: '4px 10px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: '#6B7280',
                            boxShadow: '0 1px 2px rgba(30,30,60,0.06), 0 6px 16px rgba(30,30,60,0.10)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontFamily: 'var(--font-sans)',
                            border: '1px solid rgba(255,255,255,0.9)',
                            zIndex: 2,
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ fontSize: 13 }}>{reactionEmoji}</span>
                          <span>{msg.like_count}</span>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Typing indicator ── */}
        <AnimatePresence>
          {typingName && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 57, paddingTop: 2 }}
            >
              <div style={{
                display: 'flex', gap: 3, alignItems: 'center',
                background: 'rgba(255,255,255,0.88)',
                borderRadius: 999, padding: '7px 14px',
                boxShadow: '0 4px 12px rgba(40,40,80,0.07)',
                border: '1px solid rgba(255,255,255,0.75)',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#A0A8B8' }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#A0A8B8', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>
                {typingName} is typing…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── New messages pill ── */}
      <AnimatePresence>
        {!isNearBottom && unseenCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            onClick={() => scrollToBottom('smooth')}
            style={{
              position: 'absolute', left: '50%', bottom: 78, transform: 'translateX(-50%)',
              background: ACCENT, color: '#fff', border: 'none', borderRadius: 999,
              padding: '8px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              boxShadow: `0 8px 20px -6px ${ACCENT}66`,
              display: 'flex', alignItems: 'center', gap: 6, zIndex: 5,
              fontFamily: 'var(--font-sans)',
            }}
          >
            ↓ {unseenCount} New Message{unseenCount > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Composer ── */}
      <div style={{
        flexShrink: 0, paddingTop: 10,
        paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 10px)',
        borderTop: '1.5px solid rgba(240,239,255,0.8)', marginTop: 4,
      }}>
        <CommunityComposer
          user={user} text={text} setText={setText}
          onSubmit={submit} submitting={submitting} accent={ACCENT}
        />
      </div>
    </div>
  );
}
