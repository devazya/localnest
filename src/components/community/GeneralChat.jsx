/**
 * GeneralChat.jsx — Community module
 * Discord-style live chat feed for the "General" channel
 * (message list, simulated typing indicator, presence) plus the composer.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import CommunityComposer from './CommunityComposer';
import AnimatedNumber from './AnimatedNumber';

export default function GeneralChat({ posts, user, onDelete, onPost, onlineCount = 0 }) {
  const [text, setText]             = useState('');
  const [submitting, setSub]        = useState(false);
  const [typingName, setTypingName] = useState('');
  const bottomRef = useRef(null);

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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [posts.length]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSub(true);
    await onPost(text.trim());
    setText(''); setSub(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #F8F7FF, #EDE9FF)', borderRadius: 12, padding: '9px 14px', marginBottom: 14, border: '1px solid #E8E4FF', flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0, boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', animation: 'livePulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 13, color: '#6D4AFF', fontWeight: 600 }}>Live chat · General</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#22C55E', fontWeight: 600, display: 'inline-flex', gap: 4 }}><AnimatedNumber value={onlineCount} /> online</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 4 }}>
        {posts.map(msg => {
          const isMe    = user && msg.author_id === user.id;
          const isAnon  = msg.is_anonymous;
          const profile = isAnon ? null : msg.profiles;
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 10, padding: '5px 0', alignItems: 'flex-start' }}>
              {isAnon
                ? <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                : <Avatar profile={profile} size={36} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0D0820' }}>{isAnon ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.title || msg.body}</div>
                {msg.like_count > 0 && <div style={{ display: 'flex', gap: 5, marginTop: 4 }}><span style={{ fontSize: 12.5, background: '#F3F0FF', borderRadius: 999, padding: '2px 8px', color: '#374151' }}>👍 {msg.like_count}</span></div>}
              </div>
              {isMe && <button onClick={() => onDelete(msg.id)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#DC2626', cursor: 'pointer', opacity: 0.4, padding: '2px 4px', flexShrink: 0 }}>✕</button>}
            </div>
          );
        })}

        <AnimatePresence>
          {typingName && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[0,1,2].map(i => <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} style={{ width: 4, height: 4, borderRadius: '50%', background: '#9CA3AF' }} />)}
              </div>
              <span style={{ fontSize: 12.5, color: '#9CA3AF', fontStyle: 'italic' }}>{typingName} is typing…</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div style={{ flexShrink: 0, paddingTop: 10, paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 10px)', borderTop: '1.5px solid #F0EFFF', marginTop: 4 }}>
        <CommunityComposer user={user} text={text} setText={setText} onSubmit={submit} submitting={submitting} />
      </div>
    </div>
  );
}
