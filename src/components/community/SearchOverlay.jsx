/**
 * SearchOverlay.jsx — Community module
 * Full-screen search overlay (posts / channels / people).
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CHANNELS } from './constants';
import { timeAgo } from './utils';
import Avatar from './Avatar';

export default function SearchOverlay({ onClose, posts, onJumpToChannel }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const q = query.toLowerCase().trim();
  const filteredPosts = q
    ? posts.filter(p => (p.title || '').toLowerCase().includes(q) || (p.body || '').toLowerCase().includes(q))
    : [];
  const filteredChannels = q
    ? CHANNELS.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    : [];
  const filteredPeople = q
    ? [...new Map(posts.filter(p => !p.is_anonymous && p.profiles)
        .map(p => [p.profiles.id, p.profiles])).values()]
        .filter(pr => (pr.full_name || pr.username || '').toLowerCase().includes(q))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(13,8,32,0.72)', backdropFilter: 'blur(18px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '56px 20px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: 16, padding: '12px 16px', backdropFilter: 'blur(12px)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search posts, people, channels, events…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 16, color: '#fff', fontFamily: 'inherit' }} />
          {query && <button onClick={() => setQuery('')} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {['Posts', 'People', 'Channels', 'Events', 'Businesses', 'Messages', 'Comments'].map(scope => (
            <div key={scope} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{scope}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
        {!q && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Search across community</div>
          </div>
        )}

        {q && filteredChannels.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Channels</div>
            {filteredChannels.map(ch => (
              <button key={ch.slug} onClick={() => { onJumpToChannel(ch.slug); onClose(); }}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                <img src={ch.icon} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                <div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>D/{ch.name}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{ch.desc}</div></div>
              </button>
            ))}
          </div>
        )}

        {q && filteredPeople.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>People</div>
            {filteredPeople.slice(0, 6).map(pr => (
              <div key={pr.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Avatar profile={pr} size={34} />
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{pr.full_name || pr.username}</div>
              </div>
            ))}
          </div>
        )}

        {q && filteredPosts.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Posts</div>
            {filteredPosts.slice(0, 8).map(post => (
              <div key={post.id} style={{ padding: '12px 14px', marginBottom: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{post.title}</div>
                {post.body && <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{post.body?.slice(0, 80)}…</div>}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{timeAgo(post.created_at)}</div>
              </div>
            ))}
          </div>
        )}

        {q && filteredPosts.length === 0 && filteredChannels.length === 0 && filteredPeople.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}><div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>No results for "{q}"</div></div>
        )}
      </div>

      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 12, padding: '8px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
    </motion.div>
  );
}
