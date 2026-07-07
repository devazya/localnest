/**
 * PostCard.jsx — Community module
 * Card-based discussion post: header/menu, body, type-specific chips,
 * vote row, and the collapsible reply thread (PostChat).
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTO_HIDE_DOWNVOTE_RATIO, AUTO_HIDE_MIN_VOTES } from './constants';
import { timeAgo, getChannelMeta } from './utils';
import Avatar from './Avatar';
import EditPostModal from './EditPostModal';
import ReportModal from './ReportModal';
import PostChat from './PostChat';
import MentionText from './MentionText';

export default function PostCard({ post, user, channels, userVote, isSaved, onVote, onSave, onDelete, onEdit, onReport, onRestore, isAdmin, viewAnyway, onViewAnyway }) {
  const [showChat, setShowChat]   = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const [showMenu, setShowMenu]   = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [hovered, setHovered]     = useState(false);
  const menuRef  = useRef(null);

  const isOwner = user && post.author_id === user.id;
  const isAnon  = post.is_anonymous;
  const profile = isAnon ? null : post.profiles;
  const channel = channels.find(c => c.id === post.channel_id);
  const slug    = channel?.slug || post.channel_slug || '';
  const chMeta  = getChannelMeta(slug);

  const totalVotes = (post.like_count || 0) + (post.downvote_count || 0);
  const downRatio  = totalVotes > 0 ? (post.downvote_count || 0) / totalVotes : 0;
  const shouldAutoHide = totalVotes >= AUTO_HIDE_MIN_VOTES && downRatio >= AUTO_HIDE_DOWNVOTE_RATIO;
  const isHidden = (post.is_removed || shouldAutoHide) && !viewAnyway && !isAdmin;
  const lowScoreNote = totalVotes >= 8 && downRatio >= 0.45 && !shouldAutoHide;

  const getBadge = () => {
    if (post.post_type === 'announcement') {
      const b = post.metadata?.badge;
      if (b) return { label: b, bg: b === 'Offer' ? '#16A34A' : b === 'Official' ? '#7C3AED' : '#6D4AFF' };
    }
    if (post.is_pinned) return { label: 'Pinned', bg: '#7C3AED' };
    const typeLabels = { ride_offer: 'Ride Offer', ride_request: 'Ride Request', event: 'Event', buysell: 'For Sale', poll: 'Poll' };
    if (typeLabels[post.post_type]) return { label: typeLabels[post.post_type], bg: '#6D4AFF' };
    return null;
  };
  const badge = getBadge();

  useEffect(() => {
    if (!showMenu) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  if (isHidden) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: '#FAFAFA', borderRadius: 18, padding: '16px 18px', marginBottom: 14, border: '1.5px dashed #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 13, color: '#9CA3AF' }}>This post was hidden due to community reports.</div>
        <button onClick={() => onViewAnyway(post.id)} style={{ flexShrink: 0, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, color: '#6D4AFF', cursor: 'pointer' }}>View Anyway</button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 18,
        boxShadow: hovered ? `0 8px 36px rgba(109,74,255,0.14), 0 2px 8px rgba(0,0,0,0.06)` : `0 2px 16px rgba(109,74,255,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
        overflow: 'hidden', marginBottom: 14, border: '1px solid rgba(109,74,255,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${chMeta?.color || '#6D4AFF'} 0%, transparent 100%)`, opacity: 0.3, pointerEvents: 'none' }} />

      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            {isAnon
              ? <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              : <Avatar profile={profile} size={44} />}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{isAnon ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}</span>
                {badge && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: badge.bg, padding: '2px 9px', borderRadius: 999 }}>{badge.label}</span>}
                {post.is_removed && isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 999 }}>Removed</span>}
              </div>
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {post.is_pinned && <svg width="14" height="14" viewBox="0 0 24 24" fill="#6D4AFF"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/></svg>}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#F8F7FF'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 14, boxShadow: '0 10px 32px rgba(0,0,0,0.12)', minWidth: 150, overflow: 'hidden' }}>
                    {isOwner && <button onClick={() => { setShowEdit(true); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#374151' }}>Edit</button>}
                    {user && <button onClick={() => { onSave(post.id, isSaved); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#374151' }}>{isSaved ? 'Unsave' : 'Save'}</button>}
                    {user && !isOwner && <button onClick={() => { setShowReport(true); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#DC2626' }}>Report</button>}
                    {isOwner && <button onClick={() => { onDelete(post.id); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#DC2626' }}>Delete</button>}
                    {isAdmin && post.is_removed && <button onClick={() => { onRestore(post.id); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#16A34A' }}>Restore (Admin)</button>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 15.5, fontWeight: 600, color: '#0D0820', marginBottom: 8, lineHeight: 1.4, fontFamily: 'var(--font-display)' }}>{post.title}</div>
        {post.body && <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.7, marginBottom: 10 }}><MentionText text={post.body} /></div>}

        {/* Type-specific metadata chips */}
        {post.post_type !== 'post' && post.metadata && Object.keys(post.metadata).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {post.post_type === 'ride_offer' && post.metadata.from && post.metadata.to && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '5px 11px', borderRadius: 999 }}>{post.metadata.from} → {post.metadata.to}</span>
            )}
            {post.metadata.date && <span style={{ fontSize: 12, color: '#6B7280', background: '#F8F7FF', padding: '5px 11px', borderRadius: 999 }}>{post.metadata.date}{post.metadata.time ? ` · ${post.metadata.time}` : ''}</span>}
            {post.metadata.seats && <span style={{ fontSize: 12, color: '#6B7280', background: '#F8F7FF', padding: '5px 11px', borderRadius: 999 }}>{post.metadata.seats} seats left</span>}
            {post.metadata.price && <span style={{ fontSize: 12, fontWeight: 600, color: '#0D0820', background: '#FEF3C7', padding: '5px 11px', borderRadius: 999 }}>{post.metadata.price}</span>}
            {post.metadata.venue && <span style={{ fontSize: 12, color: '#6B7280', background: '#F8F7FF', padding: '5px 11px', borderRadius: 999 }}>📍 {post.metadata.venue}</span>}
            {post.metadata.condition && <span style={{ fontSize: 12, color: '#6B7280', background: '#F8F7FF', padding: '5px 11px', borderRadius: 999 }}>{post.metadata.condition}</span>}
          </div>
        )}

        {/* Poll options preview */}
        {post.post_type === 'poll' && post.metadata?.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {post.metadata.options.filter(o => o.trim()).map((o, i) => (
              <div key={i} style={{ fontSize: 13, color: '#374151', background: '#F8F7FF', padding: '9px 13px', borderRadius: 10, border: '1px solid #EDE9FF' }}>{o}</div>
            ))}
          </div>
        )}

        {post.image_urls?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
            ))}
          </div>
        )}

        {lowScoreNote && (
          <div style={{ fontSize: 11.5, color: '#B45309', background: '#FEF3C7', padding: '6px 11px', borderRadius: 8, marginBottom: 10 }}>
            ⚠ This post has a low community score
          </div>
        )}

        {/* Upvote / downvote row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 10, borderTop: '1.5px solid #F4F3FF' }}>
          <button onClick={() => user && onVote(post.id, 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: userVote === 1 ? '#F0FDF4' : 'none', border: 'none', borderRadius: 999, padding: '6px 10px', cursor: user ? 'pointer' : 'default', transition: 'background 0.15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={userVote === 1 ? '#16A34A' : 'none'} stroke={userVote === 1 ? '#16A34A' : '#9CA3AF'} strokeWidth="2"><path d="M7 14l5-5 5 5"/></svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: userVote === 1 ? '#16A34A' : '#374151' }}>{post.like_count || 0}</span>
          </button>
          <button onClick={() => user && onVote(post.id, -1)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: userVote === -1 ? '#FEF2F2' : 'none', border: 'none', borderRadius: 999, padding: '6px 10px', cursor: user ? 'pointer' : 'default', transition: 'background 0.15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={userVote === -1 ? '#DC2626' : 'none'} stroke={userVote === -1 ? '#DC2626' : '#9CA3AF'} strokeWidth="2"><path d="M7 10l5 5 5-5"/></svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: userVote === -1 ? '#DC2626' : '#374151' }}>{post.downvote_count || 0}</span>
          </button>
          <div style={{ fontSize: 11.5, color: '#9CA3AF', marginLeft: 2 }}>{totalVotes} votes</div>

          <button onClick={() => setShowChat(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: showChat ? '#F3F0FF' : 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 999, marginLeft: 4, transition: 'background 0.15s' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={showChat ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {post.comment_count > 0 && <span style={{ fontSize: 13.5, fontWeight: 600, color: showChat ? '#6D4AFF' : '#374151' }}>{post.comment_count}</span>}
          </button>

          <button onClick={() => user && onSave(post.id, isSaved)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 4, borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#F8F7FF'} onMouseLeave={e => e.currentTarget.style.background='none'}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? '#6D4AFF' : 'none'} stroke={isSaved ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '4px 16px 16px', background: '#FDFCFF', borderTop: '1.5px solid #F4F3FF' }}>
              <PostChat postId={post.id} user={user} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{showEdit && <EditPostModal post={post} onClose={() => setShowEdit(false)} onUpdated={upd => onEdit(post.id, upd)} />}</AnimatePresence>
      <AnimatePresence>{showReport && <ReportModal post={post} onClose={() => setShowReport(false)} onSubmit={onReport} />}</AnimatePresence>
    </motion.div>
  );
}
