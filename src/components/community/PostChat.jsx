/**
 * PostChat.jsx — Community module
 * Discord-style thread replies attached to a post card.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabase/client';
import { timeAgo } from './utils';
import Avatar from './Avatar';

export default function PostChat({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [submitting, setSub]    = useState(false);
  const bottomRef = useRef(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase.from('community_comments')
      .select(`id,post_id,author_id,body,created_at,profiles:author_id(id,full_name,username,avatar_url)`)
      .eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []); setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
    const ch = supabase.channel(`cmt:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, fetchComments)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [postId, fetchComments]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSub(true);
    await supabase.from('community_comments').insert({ post_id: postId, author_id: user.id, body: text.trim() });
    setText(''); setSub(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (loading) return <div style={{ padding: '8px 0', fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>Loading…</div>;

  return (
    <div style={{ borderTop: '1.5px solid #F4F3FF', paddingTop: 12, marginTop: 4 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Live Discussion · {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
      </div>
      {comments.length === 0 && <div style={{ fontSize: 12.5, color: '#9CA3AF', textAlign: 'center', padding: '6px 0 10px' }}>Be the first to reply</div>}
      {comments.map(c => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 9, padding: '5px 0', alignItems: 'flex-start' }}>
          <Avatar profile={c.profiles} size={28} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0820' }}>{c.profiles?.full_name || c.profiles?.username || 'User'}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(c.created_at)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, background: '#F8F7FF', padding: '6px 11px', borderRadius: '0 10px 10px 10px', display: 'inline-block', maxWidth: '100%' }}>{c.body}</div>
          </div>
        </motion.div>
      ))}
      <div ref={bottomRef} />
      {user ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <Avatar profile={null} size={28} />
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Reply…"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
            style={{ flex: 1, padding: '8px 14px', background: '#F8F7FF', border: '1.5px solid #EDE9FF', borderRadius: 20, fontSize: 13, color: '#0D0820', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor='#6D4AFF55'} onBlur={e => e.target.style.borderColor='#EDE9FF'} />
          <button onClick={submit} disabled={submitting || !text.trim()}
            style={{ width: 34, height: 34, borderRadius: '50%', background: text.trim() ? '#6D4AFF' : '#E5E7EB', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '6px 0' }}>Sign in to reply</div>
      )}
    </div>
  );
}
