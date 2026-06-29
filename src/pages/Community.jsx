/**
 * Community.jsx — LocalNest Community Hub v5
 * Visual redesign to match reference image exactly:
 *  - Channel icon strip (horizontal scroll) with notification bubbles
 *  - Large white post cards with proper reaction row
 *  - Drawer with emoji icons, blue notification pills
 *  - General chat with online count, message reactions, typing indicator
 *  - Pure white cards on #EEEEFF background
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS = [
  { slug: 'general',        name: 'General',        emoji: '💬', desc: 'Live chat with everyone',        color: '#6D4AFF', bg: '#EDE9FF' },
  { slug: 'announcements',  name: 'Announcements',  emoji: '📢', desc: 'Official updates & notices',     color: '#D97706', bg: '#FEF3C7' },
  { slug: 'ride-sharing',   name: 'Ride Sharing',   emoji: '🚗', desc: 'Ride offers & discussions',      color: '#16A34A', bg: '#DCFCE7' },
  { slug: 'events',         name: 'Events',         emoji: '🎉', desc: 'Local events & meetups',         color: '#DB2777', bg: '#FCE7F3' },
  { slug: 'roommates',      name: 'Roommates',      emoji: '🏠', desc: 'PGs & roommates',                color: '#7C3AED', bg: '#EDE9FE' },
  { slug: 'buy-sell',       name: 'Buy & Sell',     emoji: '🛍️', desc: 'Buy, sell, exchange',            color: '#EA580C', bg: '#FFEDD5' },
  { slug: 'sports',         name: 'Sports',         emoji: '⚽', desc: 'Sports discussions',             color: '#0284C7', bg: '#E0F2FE' },
  { slug: 'lost-and-found', name: 'Lost & Found',   emoji: '🔍', desc: 'Lost items & found items',      color: '#DC2626', bg: '#FEE2E2' },
  { slug: 'help',           name: 'Help',           emoji: '🆘', desc: 'Ask questions, get help',        color: '#DC2626', bg: '#FEE2E2' },
  { slug: 'jobs',           name: 'Jobs',           emoji: '💼', desc: 'Hiring & opportunities',         color: '#6D4AFF', bg: '#EDE9FF' },
];

// First 5 shown in strip, rest in "More"
const STRIP_CHANNELS = CHANNELS.slice(0, 5);

const CHAT_CHANNELS  = new Set(['general']);
const CARD_CHANNELS  = new Set(['announcements']);

const SORT_OPTIONS = [
  { key: 'newest',         label: 'Newest' },
  { key: 'trending',       label: 'Trending' },
  { key: 'most_liked',     label: 'Most Liked' },
  { key: 'most_commented', label: 'Most Comments' },
];

const REACTION_TYPES = [
  { type: 'like',        emoji: '👍' },
  { type: 'helpful',     emoji: '🙌' },
  { type: 'interesting', emoji: '🤔' },
  { type: 'laugh',       emoji: '😂' },
  { type: 'support',     emoji: '🤝' },
];

const POST_TYPES = [
  { id: 'post',    icon: '✏️', title: 'Post',       desc: 'Share something with community' },
  { id: 'offer',   icon: '🏷️', title: 'Offer',      desc: 'Offer a ride' },
  { id: 'event',   icon: '🎉', title: 'Event',      desc: 'Create an event' },
  { id: 'buysell', icon: '🛒', title: 'Buy & Sell', desc: 'Sell or buy items' },
  { id: 'poll',    icon: '📊', title: 'Poll',       desc: 'Ask a question' },
];

const PAGE_SIZE = 10;

const SEARCH_PLACEHOLDERS = [
  'Search football…', 'Search PG listings…', 'Search events…',
  'Search cafes…', 'Search jobs…', 'Search roommates…',
  'Search ride share…', 'Search across community…',
];

// Mock unread counts for demo (real ones come from realtime)
const MOCK_UNREAD = { general: 12, announcements: 3, 'ride-sharing': 8, events: 4, 'buy-sell': 7, roommates: 6, sports: 5, 'lost-and-found': 2, help: 6, jobs: 3 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getChannelPrefix(slug) {
  const c = CHANNELS.find(c => c.slug === slug);
  return c ? `D/${c.name}` : `D/${slug}`;
}

function useRotatingPlaceholder(arr, ms = 2800) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % arr.length), ms);
    return () => clearInterval(t);
  }, [arr, ms]);
  return arr[i];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6D4AFF','#D97706','#DB2777','#16A34A','#0284C7','#7C3AED','#DC2626','#EA580C'];

function Avatar({ profile, size = 40 }) {
  const name  = profile?.full_name || profile?.username || 'User';
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: profile?.avatar_url ? 'transparent' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, color: '#fff', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 2].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 130, height: 13, borderRadius: 6, marginBottom: 7 }} />
              <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 6 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '75%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '55%' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Edit Post Modal ──────────────────────────────────────────────────────────

function EditPostModal({ post, onClose, onUpdated }) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody]   = useState(post.body || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!title.trim()) { setError('Title required'); return; }
    setLoading(true);
    const { data, error: e } = await supabase.from('community_posts').update({ title: title.trim(), body: body.trim() || null }).eq('id', post.id).select('id,title,body,updated_at').single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    onUpdated(data); onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Edit Post</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" maxLength={120}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Description (optional)" rows={4}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: 14 }} />
        {error && <div style={{ color: '#DC2626', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#4B5563' }}>Cancel</button>
          <button onClick={save} disabled={loading} style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: '#6D4AFF', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onCreated, channels, currentChannelId, user }) {
  const [step, setStep]             = useState(1);
  const [channelSlug, setChannelSlug] = useState(channels.find(c => c.id === currentChannelId)?.slug || 'general');
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [anon, setAnon]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const channelId = channels.find(c => c.slug === channelSlug)?.id || channels[0]?.id;
  const selMeta   = CHANNELS.find(c => c.slug === channelSlug);
  const prefix    = getChannelPrefix(channelSlug);

  const submit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!user) { setError('Sign in to post.'); return; }
    setLoading(true); setError('');
    const { data, error: e } = await supabase.from('community_posts')
      .insert({ channel_id: channelId, author_id: user.id, title: title.trim(), body: body.trim() || null, is_anonymous: anon })
      .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
      .single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    onCreated(data); onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} />
        </div>
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>
            {step === 1 ? '✏️ Create Post' : step === 2 ? '📍 Select Section' : <span>Posting in <span style={{ color: '#6D4AFF' }}>{prefix}</span></span>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <div style={{ margin: '12px 20px 0', height: 3, background: '#F3F0FF', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: '#6D4AFF', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>What do you want to create?</div>
              {POST_TYPES.map(pt => (
                <button key={pt.id} onClick={() => setStep(2)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: '#FAFAFA', border: '1.5px solid #F0F0F0', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 24 }}>{pt.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D0820' }}>{pt.title}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{pt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>Where do you want to post?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CHANNELS.map(ch => {
                  const dbCh = channels.find(c => c.slug === ch.slug);
                  if (!dbCh) return null;
                  const sel = ch.slug === channelSlug;
                  return (
                    <button key={ch.slug} onClick={() => { setChannelSlug(ch.slug); setStep(3); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: sel ? ch.bg : '#fff', border: `1.5px solid ${sel ? ch.color + '44' : '#F0F0F0'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{ch.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0D0820' }}>D/{ch.name}</div>
                        <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{ch.desc}</div>
                      </div>
                      {sel && <span style={{ color: '#6D4AFF', fontSize: 16 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 14, width: '100%', padding: '11px 0', borderRadius: 12, border: '1.5px solid #F0F0F0', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>← Back</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: selMeta?.bg || '#faf9ff', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>{selMeta?.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: selMeta?.color || '#6D4AFF' }}>{prefix}</span>
              </div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title *" maxLength={120}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: '#0D0820', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                onFocus={e => e.target.style.borderColor = '#6D4AFF'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add more details…" rows={4}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, color: '#0D0820', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 14 }}
                onFocus={e => e.target.style.borderColor = '#6D4AFF'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
                <div onClick={() => setAnon(a => !a)} style={{ width: 42, height: 24, borderRadius: 999, background: anon ? '#6D4AFF' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: anon ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 13.5, color: '#4B5563' }}>Post anonymously</span>
              </label>
              {error && <div style={{ fontSize: 12.5, color: '#DC2626', background: '#FEF2F2', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Cancel</button>
                <button onClick={submit} disabled={loading || !title.trim()} style={{ flex: 2, padding: '13px 0', borderRadius: 12, border: 'none', background: '#6D4AFF', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.35)', opacity: loading || !title.trim() ? 0.6 : 1 }}>
                  {loading ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Post Chat (threaded replies below post) ──────────────────────────────────

function PostChat({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [submitting, setSub]    = useState(false);
  const bottomRef = useRef(null);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('community_comments')
      .select(`id,post_id,author_id,body,created_at,profiles:author_id(id,full_name,username,avatar_url)`)
      .eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []); setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetch();
    const ch = supabase.channel(`cmt:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [postId, fetch]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSub(true);
    await supabase.from('community_comments').insert({ post_id: postId, author_id: user.id, body: text.trim() });
    setText(''); setSub(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (loading) return <div style={{ padding: '10px 0', fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>Loading…</div>;

  return (
    <div style={{ borderTop: '1.5px solid #F4F3FF', paddingTop: 12, marginTop: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Replies</div>
      {comments.length === 0 && <div style={{ fontSize: 12.5, color: '#9CA3AF', textAlign: 'center', padding: '6px 0 10px' }}>No replies yet</div>}
      {comments.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 9, padding: '5px 0', alignItems: 'flex-start' }}>
          <Avatar profile={c.profiles} size={28} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0820' }}>{c.profiles?.full_name || c.profiles?.username || 'User'}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(c.created_at)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, background: '#F8F7FF', padding: '6px 10px', borderRadius: '0 10px 10px 10px', display: 'inline-block', maxWidth: '100%' }}>{c.body}</div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
      {user ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <Avatar profile={null} size={28} />
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a reply…"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
            style={{ flex: 1, padding: '8px 14px', background: '#F8F7FF', border: '1.5px solid #EDE9FF', borderRadius: 20, fontSize: 13, color: '#0D0820', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#6D4AFF55'} onBlur={e => e.target.style.borderColor = '#EDE9FF'} />
          <button onClick={submit} disabled={submitting || !text.trim()}
            style={{ width: 34, height: 34, borderRadius: '50%', background: text.trim() ? '#6D4AFF' : '#E5E7EB', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '6px 0' }}>Sign in to reply</div>
      )}
    </div>
  );
}

// ─── Post Card (Announcement style + Discussion style) ────────────────────────

function PostCard({ post, user, channels, userReaction, isSaved, onReact, onSave, onDelete, onEdit, isAnnouncement }) {
  const [showChat, setShowChat]           = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showEdit, setShowEdit]           = useState(false);
  const [showMenu, setShowMenu]           = useState(false);
  const reactRef = useRef(null);
  const menuRef  = useRef(null);

  const isOwner = user && post.author_id === user.id;
  const isAnon  = post.is_anonymous;
  const profile = isAnon ? null : post.profiles;
  const channel = channels.find(c => c.id === post.channel_id);
  const slug    = channel?.slug || post.channel_slug || '';
  const chMeta  = CHANNELS.find(c => c.slug === slug);

  // Badge
  const getBadge = () => {
    if (post.is_pinned) return { label: 'Official', bg: '#7C3AED' };
    const title = (post.title || '').toLowerCase();
    const body  = (post.body || '').toLowerCase();
    if (title.includes('offer') || body.includes('% off') || body.includes('discount')) return { label: 'Offer', bg: '#16A34A' };
    return { label: 'Update', bg: '#6D4AFF' };
  };
  const badge = getBadge();

  useEffect(() => {
    if (!showReactions) return;
    const h = e => { if (reactRef.current && !reactRef.current.contains(e.target)) setShowReactions(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [showReactions]);

  useEffect(() => {
    if (!showMenu) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  const reactEmoji = userReaction ? (REACTION_TYPES.find(r => r.type === userReaction)?.emoji || '👍') : '👍';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 20px rgba(109,74,255,0.08)', overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '16px 16px 12px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            {isAnon
              ? <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👤</div>
              : <Avatar profile={profile} size={44} />
            }
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>
                  {isAnon ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: badge.bg, padding: '2px 10px', borderRadius: 999 }}>{badge.label}</span>
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          {/* Right icons: pin + menu */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {post.is_pinned && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#6D4AFF" xmlns="http://www.w3.org/2000/svg"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/></svg>
            )}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 130, overflow: 'hidden' }}>
                    {isOwner && <button onClick={() => { setShowEdit(true); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#374151' }}>Edit</button>}
                    {user && <button onClick={() => { onSave(post.id, isSaved); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#374151' }}>{isSaved ? 'Unsave' : 'Save'}</button>}
                    {isOwner && <button onClick={() => { onDelete(post.id); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#DC2626' }}>Delete</button>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', marginBottom: 8, lineHeight: 1.35, fontFamily: 'var(--font-display)' }}>{post.title}</div>
        {post.body && <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.7, marginBottom: 10 }}>{post.body}</div>}

        {post.image_urls?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
            ))}
          </div>
        )}

        {/* Reaction row — emoji counts + bookmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 10, borderTop: '1.5px solid #F4F3FF' }}>
          {/* Like */}
          <div ref={reactRef} style={{ position: 'relative' }}>
            <button onClick={() => user ? (userReaction ? onReact(post.id, userReaction) : setShowReactions(s => !s)) : undefined}
              onContextMenu={e => { e.preventDefault(); if (user) setShowReactions(s => !s); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: userReaction ? '#F3F0FF' : 'none', border: 'none', borderRadius: 999, padding: '5px 12px 5px 6px', cursor: user ? 'pointer' : 'default', transition: 'background 0.15s' }}>
              <span style={{ fontSize: 18 }}>{reactEmoji}</span>
              {post.like_count > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: userReaction ? '#6D4AFF' : '#374151' }}>{post.like_count}</span>}
            </button>
            <AnimatePresence>
              {showReactions && (
                <motion.div initial={{ opacity: 0, y: 4, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                  style={{ position: 'absolute', bottom: '115%', left: 0, zIndex: 60, background: '#fff', border: '1.5px solid #EDE9FF', borderRadius: 16, padding: '8px 10px', display: 'flex', gap: 4, boxShadow: '0 8px 32px rgba(109,74,255,0.18)' }}>
                  {REACTION_TYPES.map(r => (
                    <button key={r.type} onClick={() => { onReact(post.id, r.type); setShowReactions(false); }}
                      style={{ background: userReaction === r.type ? '#F3F0FF' : 'none', border: '1.5px solid transparent', borderRadius: 10, width: 38, height: 38, fontSize: 20, cursor: 'pointer', transition: 'transform 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}>
                      {r.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comment toggle */}
          <button onClick={() => setShowChat(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showChat ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {post.comment_count > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: showChat ? '#6D4AFF' : '#374151' }}>{post.comment_count}</span>}
          </button>

          {/* Bookmark */}
          <button onClick={() => user && onSave(post.id, isSaved)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#6D4AFF' : 'none'} stroke={isSaved ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>

      {/* Chat below post */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '4px 16px 16px', background: '#FDFCFF', borderTop: '1.5px solid #F4F3FF' }}>
              <PostChat postId={post.id} user={user} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEdit && <EditPostModal post={post} onClose={() => setShowEdit(false)} onUpdated={upd => onEdit(post.id, upd)} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── General Discord Chat ─────────────────────────────────────────────────────

function GeneralChat({ posts, user, onDelete, onPost }) {
  const [text, setText]               = useState('');
  const [submitting, setSub]          = useState(false);
  const [typingName, setTypingName]   = useState('');
  const bottomRef = useRef(null);

  // Cosmetic typing indicator
  useEffect(() => {
    if (posts.length === 0) return;
    const names = ['Rohit Sharma', 'Sneha Iyer', 'Aman Verma', 'Priya M.', 'Vikram R.'];
    let t;
    const cycle = () => {
      t = setTimeout(() => {
        const name = names[Math.floor(Math.random() * names.length)];
        setTypingName(name);
        setTimeout(() => { setTypingName(''); cycle(); }, 2600 + Math.random() * 1000);
      }, 6000 + Math.random() * 12000);
    };
    cycle();
    return () => clearTimeout(t);
  }, [posts.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts.length]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSub(true);
    await onPost(text.trim());
    setText(''); setSub(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 210px)', minHeight: 300 }}>
      {/* Online banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F7FF', borderRadius: 10, padding: '8px 14px', marginBottom: 12, border: '1px solid #EDE9FF', flexShrink: 0 }}>
        <span style={{ fontSize: 14 }}>💬</span>
        <span style={{ fontSize: 13, color: '#6D4AFF', fontWeight: 500 }}>Live chat with everyone</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>56 online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 4 }}>
        {posts.map(msg => {
          const isMe   = user && msg.author_id === user.id;
          const isAnon = msg.is_anonymous;
          const profile = isAnon ? null : msg.profiles;
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 10, padding: '5px 0', alignItems: 'flex-start' }}>
              {isAnon
                ? <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                : <Avatar profile={profile} size={36} />
              }
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820' }}>
                    {isAnon ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>Today, {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.title || msg.body}</div>
                {/* Reactions on message */}
                {msg.like_count > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, background: '#F3F0FF', borderRadius: 999, padding: '2px 9px', color: '#374151' }}>👍 {msg.like_count}</span>
                    {msg.comment_count > 0 && <span style={{ fontSize: 13, background: '#F0F0F0', borderRadius: 999, padding: '2px 9px', color: '#374151' }}>⚽ {msg.comment_count}</span>}
                  </div>
                )}
              </div>
              {isMe && (
                <button onClick={() => onDelete(msg.id)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#DC2626', cursor: 'pointer', opacity: 0.4, padding: '2px 4px', flexShrink: 0 }}>✕</button>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingName && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: 4, height: 4, borderRadius: '50%', background: '#9CA3AF' }} />
                ))}
              </div>
              <span style={{ fontSize: 12.5, color: '#9CA3AF', fontStyle: 'italic' }}>{typingName} is typing…</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ flexShrink: 0, paddingTop: 10, borderTop: '1.5px solid #F0EFFF', marginTop: 4 }}>
        {user ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F8F7FF', border: '1.5px solid #EDE9FF', borderRadius: 14, padding: '8px 14px' }}>
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="Message #General"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#0D0820', fontFamily: 'inherit' }} />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, color: '#9CA3AF', flexShrink: 0 }}>😊</button>
            <button onClick={submit} disabled={submitting || !text.trim()} style={{ background: 'none', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? '#6D4AFF' : '#D1D5DB'} strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', padding: '10px 0' }}>Sign in to chat</div>
        )}
      </div>
    </div>
  );
}

// ─── Channel Strip Item ───────────────────────────────────────────────────────

function ChannelStripItem({ ch, isActive, unread, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, minWidth: 64 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: isActive ? ch.color : ch.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: isActive ? `0 4px 16px ${ch.color}44` : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', border: isActive ? `2.5px solid ${ch.color}` : '2.5px solid transparent' }}>
          {ch.emoji}
        </div>
        {unread > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -6, minWidth: 18, height: 18, background: '#EF4444', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', border: '2px solid #F0EFFF', padding: '0 4px', boxSizing: 'border-box' }}>{unread > 9 ? '9+' : unread}</div>
        )}
      </div>
      <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? ch.color : '#6B7280', textAlign: 'center', lineHeight: 1.2, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
    </button>
  );
}

// ─── All Caught Up ────────────────────────────────────────────────────────────

function AllCaughtUp() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #EDE9FF', borderRadius: 999, padding: '8px 20px', boxShadow: '0 2px 10px rgba(109,74,255,0.08)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6D4AFF' }}>You're all caught up</span>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ chMeta, activeName, search, user, onPost, onClear }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '52px 24px', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(109,74,255,0.06)' }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>{chMeta?.emoji || '💬'}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
        {search ? 'No matching posts' : `No posts in ${activeName} yet`}
      </div>
      <div style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 20 }}>
        {search ? 'Try different keywords' : 'Be the first to start a conversation!'}
      </div>
      {search
        ? <button onClick={onClear} style={{ background: '#F3F0FF', color: '#6D4AFF', border: 'none', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Clear Search</button>
        : <button onClick={onPost} style={{ background: '#6D4AFF', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,74,255,0.3)' }}>✏️ Create Post</button>
      }
    </motion.div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({ channels, activeChannelId, unreadCounts, onSelect, onClose }) {
  const totalUnread = ch => unreadCounts[ch.slug] || MOCK_UNREAD[ch.slug] || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
      <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        style={{ width: 285, height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '6px 0 32px rgba(0,0,0,0.13)' }}>

        {/* Header */}
        <div style={{ padding: '28px 20px 14px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Community</div>
          <div style={{ fontSize: 12.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#EF4444' }}>📍</span> Green Sector, Bangalore
          </div>
        </div>

        {/* Channel label */}
        <div style={{ padding: '4px 20px 8px' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#9CA3AF' }}>Channels</span>
        </div>

        {/* Channel list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
          {CHANNELS.map(ch => {
            const dbCh    = channels.find(c => c.slug === ch.slug);
            const isActive = dbCh && dbCh.id === activeChannelId;
            const unread   = totalUnread(ch);
            return (
              <button key={ch.slug} onClick={() => { if (dbCh) onSelect(dbCh.id); onClose(); }}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, marginBottom: 2, background: isActive ? `${ch.color}12` : 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8F7FF'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}>
                {/* Large emoji icon */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: isActive ? ch.color : ch.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {ch.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 600, color: isActive ? ch.color : '#0D0820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
                  <div style={{ fontSize: 11.5, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{ch.desc}</div>
                </div>
                {unread > 0 && (
                  <div style={{ minWidth: 22, height: 22, borderRadius: 999, background: '#6D4AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', padding: '0 5px', boxSizing: 'border-box', flexShrink: 0 }}>{unread}</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Settings footer */}
        <div style={{ padding: '10px 10px 30px', borderTop: '1.5px solid #F4F3FF' }}>
          <button style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 13.5, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8F7FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F4F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚙️</div>
            <span style={{ fontWeight: 600 }}>Settings</span>
          </button>
        </div>
      </motion.div>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.28)' }} onClick={onClose} />
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Community({ onNavigate }) {
  const [user, setUser]                       = useState(null);
  const [channels, setChannels]               = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [posts, setPosts]                     = useState([]);
  const [initialLoad, setInitialLoad]         = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [hasMore, setHasMore]                 = useState(true);
  const [page, setPage]                       = useState(0);
  const [sort, setSort]                       = useState('newest');
  const [search, setSearch]                   = useState('');
  const [searchDraft, setSearchDraft]         = useState('');
  const [searchFocused, setSearchFocused]     = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [showDrawer, setShowDrawer]           = useState(false);
  const [userReactions, setUserReactions]     = useState({});
  const [savedPosts, setSavedPosts]           = useState({});
  const [unreadCounts, setUnreadCounts]       = useState({});
  const loaderRef = useRef(null);

  const placeholder = useRotatingPlaceholder(SEARCH_PLACEHOLDERS);

  // ─ Auth ─
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

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

  // ─ Query ─
  const buildQuery = useCallback((fromIdx) => {
    if (!activeChannelId) return null;
    let q = supabase.from('community_posts')
      .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,updated_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
      .eq('channel_id', activeChannelId);
    if (search) { const s = search.replace(/[%_\\]/g, '\\$&'); q = q.or(`title.ilike.%${s}%,body.ilike.%${s}%`); }
    if (sort === 'newest')              q = q.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    else if (sort === 'most_liked')     q = q.order('like_count', { ascending: false });
    else if (sort === 'most_commented') q = q.order('comment_count', { ascending: false });
    else                                q = q.order('like_count', { ascending: false }).order('comment_count', { ascending: false });
    return q.range(fromIdx, fromIdx + PAGE_SIZE - 1);
  }, [activeChannelId, search, sort]);

  // ─ Fetch ─
  const fetchPosts = useCallback(async (reset = false) => {
    const fromIdx = reset ? 0 : page * PAGE_SIZE;
    if (reset) { setRefreshing(true); setInitialLoad(true); }
    const q = buildQuery(fromIdx);
    if (!q) return;
    const { data, error } = await q;
    if (!error) {
      const incoming = data || [];
      if (reset) { setPosts(incoming); setPage(1); }
      else { setPosts(prev => { const ids = new Set(prev.map(p => p.id)); return [...prev, ...incoming.filter(p => !ids.has(p.id))]; }); setPage(p => p + 1); }
      setHasMore(incoming.length === PAGE_SIZE);
      setUnreadCounts(prev => ({ ...prev, [activeChannelId]: 0 }));
    }
    setInitialLoad(false); setRefreshing(false);
  }, [buildQuery, page, activeChannelId]);

  useEffect(() => {
    if (!activeChannelId) return;
    setPage(0); setHasMore(true); setPosts([]); setInitialLoad(true);
  // eslint-disable-next-line
  }, [activeChannelId, sort, search]);

  useEffect(() => {
    if (!activeChannelId || page !== 0) return;
    fetchPosts(true);
  // eslint-disable-next-line
  }, [activeChannelId, sort, search, page]);

  // ─ Reactions & saved ─
  useEffect(() => {
    if (!user || posts.length === 0) return;
    const ids = posts.map(p => p.id);
    supabase.from('community_reactions').select('post_id,type').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => { const m = {}; (data||[]).forEach(r => { m[r.post_id] = r.type; }); setUserReactions(p => ({ ...p, ...m })); });
    supabase.from('community_saved').select('post_id').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => { const m = {}; (data||[]).forEach(s => { m[s.post_id] = true; }); setSavedPosts(p => ({ ...p, ...m })); });
  }, [user, posts]);

  // ─ Realtime ─
  useEffect(() => {
    if (channels.length === 0) return;
    const subs = channels.map(ch =>
      supabase.channel(`comm:${ch.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${ch.id}` }, async (payload) => {
          if (ch.id === activeChannelId) {
            if (user && payload.new.author_id === user.id) return;
            const { data } = await supabase.from('community_posts').select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,updated_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`).eq('id', payload.new.id).single();
            if (data) setPosts(prev => prev.some(p => p.id === data.id) ? prev : [data, ...prev]);
          } else {
            setUnreadCounts(prev => ({ ...prev, [ch.id]: (prev[ch.id] || 0) + 1 }));
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
    setActiveChannelId(id);
    const ch = channels.find(c => c.id === id);
    if (ch) setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const handleReact = async (postId, reactionType) => {
    if (!user) return;
    const current = userReactions[postId];
    if (current === reactionType) {
      setUserReactions(p => { const n = { ...p }; delete n[postId]; return n; });
      setPosts(p => p.map(x => x.id === postId ? { ...x, like_count: Math.max(0, (x.like_count||0) - 1) } : x));
      await supabase.from('community_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      setUserReactions(p => ({ ...p, [postId]: reactionType }));
      if (!current) setPosts(p => p.map(x => x.id === postId ? { ...x, like_count: (x.like_count||0) + 1 } : x));
      await supabase.from('community_reactions').upsert({ post_id: postId, user_id: user.id, type: reactionType, emoji: reactionType }, { onConflict: 'post_id,user_id' });
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

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handlePostEdited  = (id, upd) => setPosts(prev => prev.map(p => p.id === id ? { ...p, ...upd } : p));
  const handleSearch      = (e) => { e.preventDefault(); setSearch(searchDraft.trim()); };

  const handleChatPost = async (text) => {
    if (!user || !activeChannelId) return;
    const { data } = await supabase.from('community_posts')
      .insert({ channel_id: activeChannelId, author_id: user.id, title: text, body: null, is_anonymous: false })
      .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
      .single();
    if (data) setPosts(prev => [...prev, data]);
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeSlug    = activeChannel?.slug || '';
  const activeName    = activeChannel?.name || 'Community';
  const activeMeta    = CHANNELS.find(c => c.slug === activeSlug);
  const isChat        = CHAT_CHANNELS.has(activeSlug);
  const isCard        = CARD_CHANNELS.has(activeSlug);

  // Unread count for slug (realtime or mock)
  const getUnread = (slug) => {
    const ch = channels.find(c => c.slug === slug);
    return ch ? (unreadCounts[ch.id] || 0) : (MOCK_UNREAD[slug] || 0);
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#EEEEFF', display: 'flex', flexDirection: 'column' }}>

      {/* Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <Drawer
            channels={channels}
            activeChannelId={activeChannelId}
            unreadCounts={unreadCounts}
            onSelect={handleSelect}
            onClose={() => setShowDrawer(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sticky Top Bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBFF', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
        <button onClick={() => setShowDrawer(true)} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8FF', border: '1.5px solid #EBEBFF', borderRadius: 12, cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          {totalUnread > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, background: '#EF4444', borderRadius: 999, fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', padding: '0 3px' }}>{totalUnread > 9 ? '9+' : totalUnread}</span>
          )}
        </button>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>Community</div>
          <div style={{ fontSize: 11.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <span style={{ color: '#EF4444', fontSize: 11 }}>📍</span> Green Sector, Bangalore
          </div>
        </div>

        <button onClick={() => user ? setShowModal(true) : onNavigate?.('auth')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#6D4AFF', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.35)', flexShrink: 0 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Post
        </button>
      </div>

      {/* ── Channel Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBFF', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>{activeMeta?.emoji || '💬'}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{activeName}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>2,156 Members</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ background: '#fff', padding: '10px 16px 12px', borderBottom: '1px solid #EBEBFF' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            value={searchDraft}
            onChange={e => setSearchDraft(e.target.value)}
            placeholder={searchFocused || searchDraft ? 'Search across community…' : placeholder}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ width: '100%', padding: '11px 38px', background: '#F8F8FF', border: `1.5px solid ${searchFocused ? '#6D4AFF55' : '#EBEBFF'}`, borderRadius: 12, fontSize: 13.5, color: '#0D0820', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          />
          {searchDraft && (
            <button type="button" onClick={() => { setSearchDraft(''); setSearch(''); }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
          )}
        </form>
      </div>

      {/* ── Channel Strip ── */}
      <div style={{ background: '#fff', padding: '12px 16px 14px', borderBottom: '1px solid #EBEBFF' }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }} className="hscr">
          {STRIP_CHANNELS.map(ch => {
            const dbCh    = channels.find(c => c.slug === ch.slug);
            const isActive = dbCh && dbCh.id === activeChannelId;
            return (
              <ChannelStripItem
                key={ch.slug}
                ch={ch}
                isActive={isActive}
                unread={getUnread(ch.slug)}
                onClick={() => { if (dbCh) handleSelect(dbCh.id); }}
              />
            );
          })}
          {/* More button */}
          <button onClick={() => setShowDrawer(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, minWidth: 64 }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: '#F4F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#6D4AFF"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: '#6B7280' }}>More</span>
          </button>
        </div>
      </div>

      {/* ── Sort chips (not for chat) ── */}
      {!isChat && (
        <div style={{ background: '#fff', padding: '8px 16px 10px', borderBottom: '1px solid #EBEBFF' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto' }} className="hscr">
            {SORT_OPTIONS.map(opt => (
              <motion.button key={opt.key} onClick={() => setSort(opt.key)} whileTap={{ scale: 0.94 }}
                style={{ flexShrink: 0, padding: '6px 15px', borderRadius: 999, fontSize: 12.5, fontWeight: sort === opt.key ? 700 : 500, border: sort === opt.key ? '1.5px solid #6D4AFF44' : '1.5px solid #E5E7EB', background: sort === opt.key ? '#F3F0FF' : '#fff', color: sort === opt.key ? '#6D4AFF' : '#6B7280', cursor: 'pointer', transition: 'all 0.15s' }}>
                {opt.label}
              </motion.button>
            ))}
            {/* Filter icon */}
            <button style={{ marginLeft: 'auto', flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: '#F8F8FF', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      <div style={{ flex: 1, overflowY: isChat ? 'hidden' : 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column' }}>

        {/* Search active */}
        <AnimatePresence>
          {search && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ background: '#F3F0FF', borderRadius: 10, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>Results for <strong style={{ color: '#6D4AFF' }}>"{search}"</strong></span>
                <button onClick={() => { setSearch(''); setSearchDraft(''); }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#6D4AFF', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading shimmer */}
        {refreshing && posts.length === 0 && (
          <div style={{ height: 3, background: '#EDE9FF', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              style={{ height: '100%', width: '40%', background: '#6D4AFF', borderRadius: 3 }} />
          </div>
        )}

        {/* ── General chat ── */}
        {isChat && (
          <div style={{ flex: 1 }}>
            {initialLoad ? <PostSkeleton /> : (
              <GeneralChat posts={posts} user={user} onDelete={handleDelete} onPost={handleChatPost} />
            )}
          </div>
        )}

        {/* ── Post feed (announcements = cards, others = discussion) ── */}
        {!isChat && (
          <>
            {initialLoad ? <PostSkeleton /> :
              posts.length === 0 ? (
                <EmptyState chMeta={activeMeta} activeName={activeName} search={search} user={user}
                  onPost={() => user ? setShowModal(true) : onNavigate?.('auth')}
                  onClear={() => { setSearch(''); setSearchDraft(''); }} />
              ) : (
                <AnimatePresence>
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      channels={channels}
                      userReaction={userReactions[post.id] || null}
                      isSaved={!!savedPosts[post.id]}
                      onReact={handleReact}
                      onSave={handleSave}
                      onDelete={handleDelete}
                      onEdit={handlePostEdited}
                      isAnnouncement={isCard}
                    />
                  ))}
                </AnimatePresence>
              )
            }

            {/* Infinite scroll + all caught up */}
            <div ref={loaderRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 48 }}>
              {refreshing && posts.length > 0 && (
                <div style={{ display: 'flex', gap: 5, padding: '14px 0' }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#6D4AFF' }} />
                  ))}
                </div>
              )}
              {!hasMore && posts.length > 0 && !refreshing && <AllCaughtUp />}
            </div>
          </>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showModal && (
          <CreatePostModal onClose={() => setShowModal(false)} onCreated={handlePostCreated}
            channels={channels} currentChannelId={activeChannelId} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
}
