/**
 * DiscussionRoom.jsx — Community module (Segment 2)
 * Full-screen temporary discussion room. Reuses the same visual language
 * and composer as the permanent chat, but each discussion owns its own
 * message list. Discussions are not part of the Supabase schema yet
 * (no backend/schema changes in this segment), so messages live in local
 * component state for the duration of the session.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Avatar from './Avatar';
import CommunityComposer from './CommunityComposer';
import { timeAgo } from './utils';
import { CHANNEL_EMOJI } from './constants';
import { usePresenceCount } from '../../hooks/usePresence';
import AnimatedNumber from './AnimatedNumber';
import MentionText from './MentionText';

export default function DiscussionRoom({ discussion, user, onBack, onLeave, onMessage }) {
  const [messages, setMessages] = useState(() => discussion.seedMessages || []);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  // Being inside the room IS joining it — track presence for as long as
  // this component stays mounted (back/leave both unmount it, which
  // decrements the real online count automatically).
  const onlineCount = usePresenceCount(`discussion:${discussion.id}`, user?.id, true);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    setMessages(prev => [...prev, {
      id: `local-${Date.now()}`,
      author_id: user.id,
      profiles: { full_name: user.user_metadata?.full_name, username: user.email, avatar_url: user.user_metadata?.avatar_url },
      title: text.trim(),
      created_at: new Date().toISOString(),
    }]);
    setText('');
    setSubmitting(false);
    onMessage?.(discussion.id);
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#EEEEFF', display: 'flex', flexDirection: 'column', height: '100dvh' }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '0 14px', height: 60,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: '50%', background: '#F8F8FF', border: '1.5px solid rgba(109,74,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{CHANNEL_EMOJI[discussion.community_channel] || '🗨️'}</span> {discussion.title}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', gap: 4 }}><AnimatedNumber value={onlineCount} /> members online</div>
        </div>
        <button onClick={onLeave} style={{
          flexShrink: 0, background: '#FEF2F2', color: '#DC2626', border: '1.5px solid rgba(220,38,38,0.15)',
          borderRadius: 999, padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Leave</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '14px 14px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 4 }}>
          {messages.map(msg => {
            const isMe = user && msg.author_id === user.id;
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 10, padding: '5px 0', alignItems: 'flex-start' }}>
                <Avatar profile={msg.profiles} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0D0820' }}>{msg.profiles?.full_name || msg.profiles?.username || 'User'}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(msg.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, wordBreak: 'break-word' }}><MentionText text={msg.title} /></div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ flexShrink: 0, paddingTop: 10, paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 10px)', borderTop: '1.5px solid #F0EFFF', marginTop: 4 }}>
          <CommunityComposer user={user} text={text} setText={setText} onSubmit={submit} submitting={submitting} />
        </div>
      </div>
    </motion.div>
  );
}
