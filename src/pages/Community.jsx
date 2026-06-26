import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────
const CHANNEL_CONFIG = {
  announcements: { icon: '📢', color: '#D97706', bg: 'rgba(217,119,6,0.1)',   label: 'Announcements' },
  general:       { icon: '💬', color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'General' },
  rides:         { icon: '🚗', color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   label: 'Rides' },
  events:        { icon: '🎉', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  label: 'Events' },
  roommates:     { icon: '🏠', color: '#059669', bg: 'rgba(5,150,105,0.1)',   label: 'Roommates' },
  'buy-sell':    { icon: '🛍️', color: '#059669', bg: 'rgba(5,150,105,0.1)',   label: 'Buy & Sell' },
  sports:        { icon: '⚽', color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   label: 'Sports' },
  'lost-found':  { icon: '🔍', color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   label: 'Lost & Found' },
  help:          { icon: '🆘', color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   label: 'Help' },
  jobs:          { icon: '💼', color: '#6D4AFF', bg: 'rgba(109,74,255,0.1)',  label: 'Jobs' },
};

const SORT_OPTIONS = [
  { key: 'newest',         label: '🕐 Newest' },
  { key: 'trending',       label: '🔥 Trending' },
  { key: 'most_liked',     label: '❤️ Most Liked' },
  { key: 'most_commented', label: '💬 Most Comments' },
];

const REACTION_TYPES = [
  { type: 'like',        emoji: '❤️',  label: 'Like' },
  { type: 'helpful',     emoji: '🙌',  label: 'Helpful' },
  { type: 'interesting', emoji: '🤔',  label: 'Interesting' },
  { type: 'laugh',       emoji: '😂',  label: 'Laugh' },
  { type: 'support',     emoji: '🤝',  label: 'Support' },
];

const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 38, onClick }) {
  const name   = profile?.full_name || profile?.username || 'User';
  const abbrev = initials(name);
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(109,74,255,0.18), rgba(143,123,255,0.1))',
        border: '1.5px solid rgba(109,74,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: size * 0.35, color: 'var(--primary)',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        fontFamily: 'var(--font-display)',
      }}
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : abbrev}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 20, padding: 22, backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(109,74,255,0.07)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: 130, height: 12, borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 7 }} />
              <div style={{ width: 80, height: 10, borderRadius: 6, background: 'rgba(109,74,255,0.05)' }} />
            </div>
          </div>
          <div style={{ height: 15, borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 9 }} />
          <div style={{ height: 12, borderRadius: 6, background: 'rgba(109,74,255,0.05)', width: '78%', marginBottom: 9 }} />
          <div style={{ height: 12, borderRadius: 6, background: 'rgba(109,74,255,0.04)', width: '60%' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({ onClose, onCreated, channels, currentChannel, user }) {
  const [channel, setChannel] = useState(currentChannel || 'general');
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [anon, setAnon]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!user)         { setError('You must be logged in to post.'); return; }
    setLoading(true);
    setError('');

    const { data, error: err } = await supabase
      .from('community_posts')
      .insert({
        channel_slug: channel,
        user_id:      user.id,
        title:        title.trim(),
        content:      content.trim() || null,
        is_anonymous: anon,
      })
      .select(`*, profiles:user_id ( id, full_name, username, avatar_url, is_verified )`)
      .single();

    setLoading(false);
    if (err) { setError(err.message); return; }
    onCreated(data);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,10,40,0.45)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 560,
          background: 'rgba(255,255,255,0.97)',
          border: '1.5px solid rgba(109,74,255,0.15)',
          borderRadius: 24, padding: 28,
          boxShadow: '0 32px 80px rgba(109,74,255,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>✏️ Create Post</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>Channel</label>
          <select
            value={channel}
            onChange={e => setChannel(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 11, fontSize: 14, color: 'var(--text-primary)', outline: 'none' }}
          >
            {channels.map(ch => (
              <option key={ch.slug} value={ch.slug}>{CHANNEL_CONFIG[ch.slug]?.icon} {ch.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={120}
            style={{ width: '100%', padding: '11px 14px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 11, fontSize: 14.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{title.length}/120</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>Description</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add more details, context, or links…"
            rows={4}
            style={{ width: '100%', padding: '11px 14px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 11, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
          <div
            onClick={() => setAnon(a => !a)}
            style={{ width: 42, height: 24, borderRadius: 999, background: anon ? 'var(--primary)' : 'rgba(109,74,255,0.12)', position: 'relative', transition: 'background 0.22s', cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', top: 3, left: anon ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.22s' }} />
          </div>
          <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Post anonymously</span>
        </label>

        {error && (
          <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 9, padding: '9px 14px', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 600, border: '1.5px solid rgba(109,74,255,0.18)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            style={{ flex: 2, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 700, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(109,74,255,0.3)', opacity: loading || !title.trim() ? 0.6 : 1, transition: 'opacity 0.2s' }}
          >{loading ? 'Posting…' : 'Post to Community'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Comment Thread ───────────────────────────────────────────────────────────
function CommentThread({ postId, user }) {
  const [comments, setComments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [replyTo, setReplyTo]       = useState(null);
  const [text, setText]             = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('community_comments')
      .select(`*, profiles:user_id ( full_name, username, avatar_url, is_verified )`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
    const channel = supabase.channel(`comments:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, fetchComments)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [postId, fetchComments]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    await supabase.from('community_comments').insert({
      post_id:   postId,
      parent_id: replyTo,
      user_id:   user.id,
      content:   text.trim(),
    });
    setText('');
    setReplyTo(null);
    setSubmitting(false);
  };

  const roots   = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c =>  c.parent_id);

  const renderComment = (c, depth = 0) => (
    <div key={c.id} style={{ marginLeft: depth * 28 }}>
      <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: depth === 0 ? '1px solid rgba(109,74,255,0.06)' : 'none' }}>
        <Avatar profile={c.profiles} size={30} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{c.profiles?.full_name || 'User'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{c.content}</div>
          {user && (
            <button
              onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
              style={{ fontSize: 11.5, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, padding: 0, fontWeight: 500 }}
            >{replyTo === c.id ? 'Cancel' : '↩ Reply'}</button>
          )}
          {replyTo === c.id && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Reply to ${c.profiles?.full_name || 'User'}…`}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 9, border: '1.5px solid rgba(109,74,255,0.2)', fontSize: 13, outline: 'none', background: 'rgba(109,74,255,0.03)' }}
              />
              <button onClick={submit} disabled={submitting} style={{ padding: '8px 14px', borderRadius: 9, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                {submitting ? '…' : 'Reply'}
              </button>
            </div>
          )}
        </div>
      </div>
      {replies.filter(r => r.parent_id === c.id).map(r => renderComment(r, depth + 1))}
    </div>
  );

  return (
    <div style={{ padding: '4px 22px 18px' }}>
      {loading
        ? <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>Loading comments…</div>
        : <div>{roots.map(c => renderComment(c))}</div>
      }
      {user && !replyTo && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Avatar profile={null} size={30} />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment…"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
            style={{ flex: 1, padding: '9px 14px', borderRadius: 11, border: '1.5px solid rgba(109,74,255,0.15)', fontSize: 13.5, outline: 'none', background: 'rgba(109,74,255,0.03)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.35)'}
            onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
          />
          <button
            onClick={submit}
            disabled={submitting || !text.trim()}
            style={{ padding: '9px 16px', borderRadius: 11, background: text.trim() ? 'var(--primary)' : 'rgba(109,74,255,0.12)', color: text.trim() ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >{submitting ? '…' : 'Send'}</button>
        </div>
      )}
      {!user && <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '10px 0', fontStyle: 'italic' }}>Sign in to comment</div>}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
// FIX: Removed `initial/exit` animation props so cards don't re-animate on
// every filter change. A simple CSS opacity transition handles hover. The
// `whileHover` lift is kept because it only triggers on user intent.
function PostCard({ post, user, userReaction, isSaved, onReact, onSave, onDelete }) {
  const cfg         = CHANNEL_CONFIG[post.channel_slug] || CHANNEL_CONFIG.general;
  const [expanded, setExpanded]           = useState(false);
  const [showComments, setShowComments]   = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showProfile, setShowProfile]     = useState(false);
  const isOwner    = user && post.user_id === user.id;
  const profile    = post.profiles;
  const displayName = post.is_anonymous ? 'Anonymous' : (profile?.full_name || profile?.username || 'Resident');

  return (
    // FIX: No `initial` / `exit` / `transition` — avoids re-animating stale
    // cards when the list is swapped. Only `whileHover` remains so the lift
    // effect still works on intent.
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 14px 44px rgba(109,74,255,0.12)' }}
      style={{
        background: 'rgba(255,255,255,0.86)',
        border: '1.5px solid rgba(255,255,255,0.72)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        position: 'relative',
        // Subtle CSS transition instead of JS animation — zero reflow cost
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
      }}
    >
      {post.images?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr', height: post.images.length > 1 ? 180 : 220, overflow: 'hidden' }}>
          {post.images.slice(0, 2).map((img, i) => (
            <img key={i} src={img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ))}
        </div>
      )}

      <div style={{ padding: '18px 22px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!post.is_anonymous
              ? <Avatar profile={profile} size={38} onClick={() => setShowProfile(s => !s)} />
              : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(107,114,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🕵️</div>
            }
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', cursor: !post.is_anonymous ? 'pointer' : 'default' }}
                  onClick={() => !post.is_anonymous && setShowProfile(s => !s)}
                >{displayName}</span>
                {!post.is_anonymous && profile?.is_verified && (
                  <span title="Verified Resident" style={{ fontSize: 10, background: 'rgba(109,74,255,0.1)', color: 'var(--primary)', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
              {cfg.icon} {cfg.label}
            </span>
            <button
              onClick={() => onSave(post.id, isSaved)}
              title={isSaved ? 'Unsave' : 'Save'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: isSaved ? '#7C3AED' : '#9CA3AF', transition: 'transform 0.18s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >🔖</button>
          </div>
        </div>

        {/* Mini profile popup — AnimatePresence is fine here (user-triggered, not filter-triggered) */}
        <AnimatePresence>
          {showProfile && !post.is_anonymous && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{ background: 'rgba(255,255,255,0.97)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 12px 40px rgba(109,74,255,0.14)', marginBottom: 14, position: 'relative' }}
            >
              <button onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar profile={profile} size={44} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{profile?.full_name || 'Resident'}</div>
                  {profile?.occupation && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile.occupation}</div>}
                  {profile?.is_verified && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>✓ Verified Resident</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 660, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
          {post.title}
        </div>
        {post.content && (
          <>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.62, marginBottom: 11, ...(expanded ? {} : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }) }}>
              {post.content}
            </div>
            {post.content.length > 160 && (
              <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10, padding: 0 }}>
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0 22px 18px' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(109,74,255,0.07)', position: 'relative' }}>

          {/* Reaction button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowReactions(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: userReaction ? 'rgba(109,74,255,0.08)' : 'none',
                border: userReaction ? '1px solid rgba(109,74,255,0.18)' : '1px solid transparent',
                color: userReaction ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 15 }}>
                {userReaction ? REACTION_TYPES.find(r => r.type === userReaction)?.emoji : '🤍'}
              </span>
              {post.like_count || 0}
            </button>

            {/* Reaction picker — user-triggered, AnimatePresence is fine */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  style={{ position: 'absolute', bottom: '110%', left: 0, zIndex: 50, background: 'rgba(255,255,255,0.98)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 14, padding: '8px 10px', display: 'flex', gap: 6, boxShadow: '0 8px 28px rgba(109,74,255,0.15)' }}
                >
                  {REACTION_TYPES.map(r => (
                    <button
                      key={r.type}
                      onClick={() => { onReact(post.id, r.type, userReaction); setShowReactions(false); }}
                      title={r.label}
                      style={{ background: userReaction === r.type ? 'rgba(109,74,255,0.1)' : 'none', border: userReaction === r.type ? '1.5px solid rgba(109,74,255,0.25)' : '1.5px solid transparent', borderRadius: 9, width: 38, height: 38, fontSize: 20, cursor: 'pointer', transition: 'transform 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}
                    >{r.emoji}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comments */}
          <button
            onClick={() => setShowComments(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: showComments ? 'rgba(109,74,255,0.06)' : 'none', border: '1px solid transparent', color: showComments ? 'var(--primary)' : 'var(--text-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
          ><span style={{ fontSize: 15 }}>💬</span>{post.comment_count || 0}</button>

          {/* Share */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid transparent', color: 'var(--text-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.06)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          ><span style={{ fontSize: 15 }}>↗️</span>Share</button>

          {isOwner && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button
                onClick={() => onDelete(post.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >🗑 Delete</button>
            </div>
          )}
        </div>

        {/* Comment thread — user-triggered, AnimatePresence is fine */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginLeft: -22, marginRight: -22 }}
            >
              <div style={{ borderTop: '1px solid rgba(109,74,255,0.07)', background: 'rgba(109,74,255,0.025)', marginTop: 10 }}>
                <CommentThread postId={post.id} user={user} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Right Sidebar ─────────────────────────────────────────────────────────────
function RightSidebar({ stats, trendingPosts }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(255,255,255,0.72)', borderRadius: 18, padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 18px rgba(109,74,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: -0.2 }}>📊 Community Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Total Posts',  val: stats.totalPosts,  icon: '📝' },
            { label: 'Posts Today',  val: stats.postsToday,  icon: '📅' },
            { label: 'Active Users', val: stats.activeUsers, icon: '👥' },
            { label: 'Channels',     val: stats.channels,    icon: '📡' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(109,74,255,0.04)', border: '1px solid rgba(109,74,255,0.08)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{s.val ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {trendingPosts.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(255,255,255,0.72)', borderRadius: 18, padding: '18px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 18px rgba(109,74,255,0.06)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>🔥 Trending</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {trendingPosts.slice(0, 5).map((p, i) => {
              const cfg = CHANNEL_CONFIG[p.channel_slug] || CHANNEL_CONFIG.general;
              return (
                <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(109,74,255,0.3)', fontFamily: 'var(--font-display)', minWidth: 18, lineHeight: 1.3 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{cfg.icon} {cfg.label}</span>
                      <span>❤️ {p.like_count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.08), rgba(143,123,255,0.04))', border: '1.5px solid rgba(109,74,255,0.12)', borderRadius: 18, padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>🌟 Community Guide</div>
        {['Be respectful of neighbours', 'No spam or self-promotion', 'Use the right channel', 'Keep it local and relevant'].map(r => (
          <div key={r} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--primary)', flexShrink: 0 }}>›</span>{r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline loading bar ───────────────────────────────────────────────────────
// FIX: A thin top-of-feed bar signals "refreshing" without hiding content.
function LoadingBar({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            height: 3, borderRadius: 999,
            background: 'linear-gradient(90deg, var(--primary), rgba(143,123,255,0.6))',
            transformOrigin: 'left',
            marginBottom: 12,
          }}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Community({ onNavigate }) {
  const [user, setUser] = useState(null);

  const [channels, setChannels]           = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');

  const [posts, setPosts]     = useState([]);
  // FIX: separate "initial load" flag from "background refresh" flag so we
  // only show the full skeleton on the very first load, not on every filter
  // change. Subsequent fetches just show the LoadingBar.
  const [initialLoad, setInitialLoad]   = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [hasMore, setHasMore]           = useState(true);
  const [page, setPage]                 = useState(0);

  const [sort, setSort]               = useState('newest');
  const [search, setSearch]           = useState('');
  const [searchDraft, setSearchDraft] = useState('');

  const [showModal, setShowModal]         = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const [userReactions, setUserReactions] = useState({});
  const [savedPosts, setSavedPosts]       = useState({});

  const [stats, setStats]         = useState({});
  const [trendingPosts, setTrending] = useState([]);

  const loaderRef = useRef(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  // ── Channels ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('channels').select('*').order('sort_order').then(({ data }) => setChannels(data || []));
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [{ count: totalPosts }, { count: postsToday }, { count: channels }] = await Promise.all([
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('channels').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ totalPosts, postsToday, channels, activeUsers: Math.max(1, Math.floor((totalPosts || 0) * 0.4)) });
  }, []);

  // ── Trending ──────────────────────────────────────────────────────────────
  const fetchTrending = useCallback(async () => {
    const { data } = await supabase.from('community_posts')
      .select('id, title, channel_slug, like_count, comment_count')
      .order('like_count', { ascending: false })
      .limit(5);
    setTrending(data || []);
  }, []);

  useEffect(() => { fetchStats(); fetchTrending(); }, [fetchStats, fetchTrending]);

  // ── Posts query ───────────────────────────────────────────────────────────
  const buildQuery = useCallback((fromIdx) => {
    const sanitizedSearch = search ? search.replace(/[\u0000-\u001F\u007F,()]/g, ' ').trim() : '';
    let q = supabase
      .from('community_posts')
      .select('id,channel_slug,user_id,title,content,images,is_anonymous,is_pinned,like_count,comment_count,created_at,profiles:user_id(id,full_name,username,avatar_url,is_verified,occupation)')
      .eq('channel_slug', activeChannel);

    if (sanitizedSearch) q = q.or(`title.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%`);

    if (sort === 'newest')           q = q.order('created_at', { ascending: false });
    else if (sort === 'most_liked')  q = q.order('like_count', { ascending: false });
    else if (sort === 'most_commented') q = q.order('comment_count', { ascending: false });
    else if (sort === 'trending')    q = q.order('like_count', { ascending: false }).order('comment_count', { ascending: false });

    return q.range(fromIdx, fromIdx + PAGE_SIZE - 1);
  }, [activeChannel, search, sort]);

  const fetchPosts = useCallback(async (reset = false) => {
    const fromIdx = reset ? 0 : page * PAGE_SIZE;

    // FIX: On reset (filter change) show a non-blocking refresh indicator
    // instead of hiding the current posts. Only the very first ever load
    // uses the full skeleton.
    if (reset) {
      setRefreshing(true);
    }

    const { data, error } = await buildQuery(fromIdx);

    if (!error) {
      const incoming = data || [];
      if (reset) {
        // Replace posts atomically — one state update, no blank frame
        setPosts(incoming);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...incoming]);
        setPage(p => p + 1);
      }
      setHasMore(incoming.length === PAGE_SIZE);
    }

    setInitialLoad(false);
    setRefreshing(false);
  }, [buildQuery, page]);

  // FIX: Do NOT call setPosts([]) before the new data arrives. Instead,
  // just kick off the fetch — posts stay visible during the network round-trip.
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel, sort, search]);

  // ── User reactions & saves ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || posts.length === 0) return;
    const ids = posts.map(p => p.id);

    supabase.from('community_reactions').select('post_id, type').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(r => { map[r.post_id] = r.type; });
        setUserReactions(prev => ({ ...prev, ...map }));
      });

    supabase.from('community_saved').select('post_id').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(s => { map[s.post_id] = true; });
        setSavedPosts(prev => ({ ...prev, ...map }));
      });
  }, [user, posts]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`community:${activeChannel}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: `channel_slug=eq.${activeChannel}` }, async (payload) => {
        const { data } = await supabase
          .from('community_posts')
          .select(`*, profiles:user_id ( id, full_name, username, avatar_url, is_verified, occupation )`)
          .eq('id', payload.new.id)
          .single();
        if (data) setPosts(prev => [data, ...prev]);
        fetchStats();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts', filter: `channel_slug=eq.${activeChannel}` }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        fetchStats();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts', filter: `channel_slug=eq.${activeChannel}` }, (payload) => {
        setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChannel, fetchStats]);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !refreshing) fetchPosts(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, refreshing, fetchPosts]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleReact = async (postId, reactionType, currentReaction) => {
    if (!user) return;
    if (currentReaction === reactionType) {
      await supabase.from('community_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
      setUserReactions(prev => { const n = { ...prev }; delete n[postId]; return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p));
    } else {
      if (currentReaction) {
        await supabase.from('community_reactions').update({ type: reactionType }).eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('community_reactions').insert({ post_id: postId, user_id: user.id, type: reactionType });
      }
      setUserReactions(prev => ({ ...prev, [postId]: reactionType }));
      if (!currentReaction) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) + 1 } : p));
      }
    }
    fetchTrending();
  };

  const handleSave = async (postId, isSaved) => {
    if (!user) return;
    if (isSaved) {
      await supabase.from('community_saved').delete().eq('post_id', postId).eq('user_id', user.id);
      setSavedPosts(prev => { const n = { ...prev }; delete n[postId]; return n; });
    } else {
      await supabase.from('community_saved').insert({ post_id: postId, user_id: user.id });
      setSavedPosts(prev => ({ ...prev, [postId]: true }));
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    await supabase.from('community_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    fetchStats();
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    fetchStats();
    fetchTrending();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  };

  const activeCfg = CHANNEL_CONFIG[activeChannel] || CHANNEL_CONFIG.general;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #F8F7FF)' }}>

      {/* Mobile channel drawer */}
      <AnimatePresence>
        {showMobileNav && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              style={{ width: 260, height: '100%', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderRight: '1.5px solid rgba(109,74,255,0.1)', boxShadow: '4px 0 32px rgba(109,74,255,0.12)', padding: '28px 16px', overflowY: 'auto' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>🏘 Channels</div>
              {channels.map(ch => {
                const cfg = CHANNEL_CONFIG[ch.slug] || CHANNEL_CONFIG.general;
                const isActive = activeChannel === ch.slug;
                return (
                  <button key={ch.slug} onClick={() => { setActiveChannel(ch.slug); setShowMobileNav(false); }}
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, marginBottom: 3, background: isActive ? `${cfg.color}14` : 'none', border: isActive ? `1.5px solid ${cfg.color}28` : '1.5px solid transparent', color: isActive ? cfg.color : 'var(--text-secondary)', fontSize: 13.5, fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.18s' }}
                  >
                    <span>{cfg.icon}</span><span>{ch.name}</span>
                  </button>
                );
              })}
            </motion.div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowMobileNav(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '32px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 6 }}>COMMUNITY HUB</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.7, marginBottom: 4 }}>
              What's happening <span style={{ color: 'var(--primary)' }}>nearby</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your hyperlocal community — discussions, announcements & updates</p>
          </motion.div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="community-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px', display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: 24, alignItems: 'start' }}>

        {/* Left sidebar */}
        <div className="community-left-sidebar" style={{ position: 'sticky', top: 90 }}>
          <div style={{ background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(255,255,255,0.72)', borderRadius: 20, padding: '18px 14px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 18px rgba(109,74,255,0.07)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, padding: '0 6px' }}>🏘 Channels</div>
            {channels.map(ch => {
              const cfg = CHANNEL_CONFIG[ch.slug] || CHANNEL_CONFIG.general;
              const isActive = activeChannel === ch.slug;
              return (
                <button key={ch.slug} onClick={() => setActiveChannel(ch.slug)}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, marginBottom: 2, background: isActive ? `${cfg.color}13` : 'none', border: isActive ? `1.5px solid ${cfg.color}26` : '1.5px solid transparent', color: isActive ? cfg.color : 'var(--text-secondary)', fontSize: 13, fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.18s' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(109,74,255,0.05)'; e.currentTarget.style.color = 'var(--primary)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                  <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center feed */}
        <div>
          <div style={{ marginBottom: 18 }}>
            <button onClick={() => setShowMobileNav(true)} style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-primary)', marginBottom: 12 }} className="mobile-hamburger">☰</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{activeCfg.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{activeCfg.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{posts.length} post{posts.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <button
                onClick={() => user ? setShowModal(true) : onNavigate?.('auth')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,74,255,0.38)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,74,255,0.3)'; }}
              >✏️ Post</button>
            </div>

            <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 13 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
              <input
                value={searchDraft}
                onChange={e => setSearchDraft(e.target.value)}
                placeholder={`Search in ${activeCfg.label}…`}
                style={{ width: '100%', padding: '11px 44px 11px 40px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.14)', borderRadius: 12, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.38)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.14)'}
              />
              {searchDraft && (
                <button type="button" onClick={() => { setSearchDraft(''); setSearch(''); }} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
              )}
            </form>

            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setSort(opt.key)}
                  style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: sort === opt.key ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)', background: sort === opt.key ? 'rgba(109,74,255,0.09)' : 'rgba(255,255,255,0.7)', color: sort === opt.key ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.18s', backdropFilter: 'blur(8px)' }}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Search active banner */}
          <AnimatePresence>
            {search && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.15)', borderRadius: 11, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🔍 Results for <strong style={{ color: 'var(--primary)' }}>"{search}"</strong></span>
                  <button onClick={() => { setSearch(''); setSearchDraft(''); }} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FIX: Thin animated bar replaces the blank-screen flash */}
          <LoadingBar visible={refreshing} />

          {/* Posts */}
          {initialLoad ? (
            // Only shown once — on the very first page load
            <PostSkeleton />
          ) : posts.length === 0 && !refreshing ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '56px 24px', background: 'rgba(255,255,255,0.78)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
            >
              <div style={{ fontSize: 48, marginBottom: 14 }}>{activeCfg.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {search ? 'No matching posts' : `No posts in ${activeCfg.label} yet`}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
                {search ? 'Try different keywords' : 'Be the first to start a conversation here!'}
              </div>
              <button
                onClick={() => user ? setShowModal(true) : onNavigate?.('auth')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '11px 26px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.28)' }}
              >✏️ Create Post</button>
            </motion.div>
          ) : (
            // FIX: Plain div — no AnimatePresence wrapper around the list.
            // Cards use only whileHover, so they never re-animate on filter
            // changes. The list cross-fade is replaced by the LoadingBar above,
            // which is far cheaper and doesn't cause layout shift.
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  userReaction={userReactions[post.id]}
                  isSaved={!!savedPosts[post.id]}
                  onReact={handleReact}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onEdit={() => {}}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll loader */}
          <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {refreshing && posts.length > 0 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }}
                  />
                ))}
              </div>
            )}
            {!hasMore && posts.length > 0 && !refreshing && (
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>You've seen all posts ✓</div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="community-right-sidebar" style={{ position: 'sticky', top: 90 }}>
          <RightSidebar stats={stats} trendingPosts={trendingPosts} />
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => setShowModal(false)}
            onCreated={handlePostCreated}
            channels={channels}
            currentChannel={activeChannel}
            user={user}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .community-layout { grid-template-columns: 1fr !important; }
          .community-left-sidebar, .community-right-sidebar { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
        @media (max-width: 1060px) {
          .community-right-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
