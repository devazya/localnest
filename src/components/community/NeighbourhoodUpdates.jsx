/**
 * NeighbourhoodUpdates.jsx — Community / Segment 4
 * The full Neighbourhood Updates feed experience.
 *
 * Features:
 * - Premium page header with subtitle
 * - "Post Update" + "What can I post?" buttons
 * - First-time guide auto-shown (localStorage flag)
 * - Category filter chips
 * - Premium update cards with:
 *   - Category badge + pinned indicator
 *   - Title, description, optional image
 *   - Author + time
 *   - Helpful / Not Helpful (replaces Reddit upvote)
 *   - Inline comments (expand in-place)
 *   - Bookmark + Share
 *   - Community flagged state
 *   - Expiry badge
 * - Pinned updates always first
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase/client';
import { NU_CATEGORIES, NU_GUIDE_SEEN_KEY, PAGE_SIZE } from './constants';
import { timeAgo } from './utils';
import Avatar from './Avatar';
import PostChat from './PostChat';
import WhatCanIPostSheet from './WhatCanIPostSheet';
import CreateUpdateModal from './CreateUpdateModal';
import MentionText from './MentionText';

const NU_POST_SELECT = `id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,downvote_count,helpful_count,not_helpful_count,comment_count,post_type,nu_category,metadata,is_removed,report_count,is_flagged,expires_at,created_at,updated_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`;

// ─── Category Badge ──────────────────────────────────────────────────────────
function CategoryBadge({ categoryId, small }) {
  const cat = NU_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cat.bg, borderRadius: 999,
      padding: small ? '3px 8px' : '5px 11px',
      fontSize: small ? 11 : 11.5, fontWeight: 700, color: cat.color,
      letterSpacing: 0.2, flexShrink: 0,
    }}>
      {cat.emoji} {cat.label}
    </span>
  );
}

// ─── Update Card ─────────────────────────────────────────────────────────────
function UpdateCard({ post, user, userHelpful, isSaved, onHelpful, onSave, onReport, onDelete, isAdmin }) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu]         = useState(false);
  const [hovered, setHovered]           = useState(false);
  const menuRef = useRef(null);

  const isOwner  = user && post.author_id === user.id;
  const profile  = post.is_anonymous ? null : post.profiles;
  const isExpired = post.expires_at && new Date(post.expires_at) < new Date();

  const helpful    = post.helpful_count    || 0;
  const notHelpful = post.not_helpful_count || 0;
  const total      = helpful + notHelpful;
  const helpfulPct = total > 0 ? Math.round((helpful / total) * 100) : null;

  const isFlagged = post.is_flagged || (post.report_count >= 5);

  useEffect(() => {
    if (!showMenu) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  if (isExpired && !isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: hovered
          ? '0 8px 36px rgba(217,119,6,0.12), 0 2px 8px rgba(0,0,0,0.05)'
          : '0 2px 16px rgba(217,119,6,0.06), 0 1px 4px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        marginBottom: 14,
        border: `1px solid ${post.is_pinned ? 'rgba(217,119,6,0.2)' : 'rgba(217,119,6,0.06)'}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        opacity: isExpired ? 0.6 : 1,
      }}
    >
      {/* Amber accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: post.is_pinned
          ? 'linear-gradient(90deg, #D97706, #F59E0B)'
          : 'linear-gradient(90deg, #FEF3C7, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Flagged overlay */}
      {isFlagged && !isAdmin && (
        <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          <span style={{ fontSize: 12.5, color: '#B45309' }}>Community Flagged — content may be inaccurate or off-topic.</span>
        </div>
      )}

      <div style={{ padding: '16px 16px 12px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {post.is_anonymous
              ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              : <Avatar profile={profile} size={40} />
            }
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>
                {post.is_anonymous ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}
              </div>
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 1 }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {post.is_pinned && <span style={{ fontSize: 12 }}>📌</span>}
            {isExpired && <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '3px 8px', borderRadius: 999 }}>Expired</span>}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(s => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 14, boxShadow: '0 10px 32px rgba(0,0,0,0.12)', minWidth: 150, overflow: 'hidden' }}>
                    {user && !isOwner && <button onClick={() => { onReport(post.id); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#DC2626' }}>Report</button>}
                    {user && <button onClick={() => { onSave(post.id, isSaved); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#374151' }}>{isSaved ? 'Unsave' : 'Save'}</button>}
                    {isOwner && <button onClick={() => { onDelete(post.id); setShowMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', fontSize: 13.5, cursor: 'pointer', color: '#DC2626' }}>Delete</button>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {post.nu_category && <CategoryBadge categoryId={post.nu_category} />}
          {post.is_pinned && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF3C7', borderRadius: 999, padding: '5px 11px', fontSize: 11.5, fontWeight: 700, color: '#D97706' }}>
              📌 Pinned
            </span>
          )}
        </div>

        {/* Title + Body */}
        <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0820', marginBottom: post.body ? 8 : 0, lineHeight: 1.4, fontFamily: 'var(--font-display)' }}>{post.title}</div>
        {post.body && <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.7, marginBottom: 10 }}><MentionText text={post.body} /></div>}

        {/* Images */}
        {post.image_urls?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
            ))}
          </div>
        )}

        {/* Expiry */}
        {post.expires_at && !isExpired && (
          <div style={{ marginBottom: 10, fontSize: 12, color: '#D97706', background: '#FFFBEB', display: 'inline-block', padding: '4px 10px', borderRadius: 8, border: '1px solid #FEF3C7' }}>
            ⏰ Expires {timeAgo(post.expires_at)}
          </div>
        )}

        {/* Helpful / Not Helpful / Comments / Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 10, borderTop: '1.5px solid #FFFBEB' }}>
          {/* Helpful */}
          <button
            onClick={() => user && onHelpful(post.id, 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: userHelpful === 1 ? '#DCFCE7' : 'none',
              border: 'none', borderRadius: 999, padding: '6px 10px',
              cursor: user ? 'pointer' : 'default', transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 15 }}>👍</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: userHelpful === 1 ? '#16A34A' : '#374151' }}>
              {helpful > 0 ? helpful : ''} Helpful
            </span>
          </button>

          {/* Not Helpful */}
          <button
            onClick={() => user && onHelpful(post.id, -1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: userHelpful === -1 ? '#FEF2F2' : 'none',
              border: 'none', borderRadius: 999, padding: '6px 10px',
              cursor: user ? 'pointer' : 'default', transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 15 }}>👎</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: userHelpful === -1 ? '#DC2626' : '#9CA3AF' }}>
              {notHelpful > 0 ? notHelpful : ''}
            </span>
          </button>

          {/* Helpfulness bar */}
          {helpfulPct !== null && total >= 3 && (
            <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden', margin: '0 4px' }}>
              <div style={{ height: '100%', width: `${helpfulPct}%`, background: '#16A34A', borderRadius: 999, transition: 'width 0.4s' }} />
            </div>
          )}

          {/* Comments */}
          <button
            onClick={() => setShowComments(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: showComments ? '#F3F0FF' : 'none',
              border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 999,
              marginLeft: helpfulPct !== null ? 0 : 'auto', transition: 'background 0.15s',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={showComments ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {post.comment_count > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: showComments ? '#6D4AFF' : '#374151' }}>{post.comment_count}</span>}
          </button>

          {/* Bookmark */}
          <button
            onClick={() => user && onSave(post.id, isSaved)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 4, borderRadius: 8 }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? '#D97706' : 'none'} stroke={isSaved ? '#D97706' : '#9CA3AF'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>

      {/* Inline comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 16px 16px', background: '#FFFDF7', borderTop: '1.5px solid #FEF3C7' }}>
              <PostChat postId={post.id} user={user} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NeighbourhoodUpdates({ channel, user, isAdmin, autoOpen }) {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hasMore, setHasMore]       = useState(true);
  const [page, setPage]             = useState(0);
  const [filterCat, setFilterCat]   = useState(''); // '' = all
  const [userHelpful, setUserHelpful] = useState({}); // postId → 1 | -1
  const [savedPosts, setSavedPosts] = useState({});
  const [showPostModal, setShowPostModal]   = useState(false);
  const [showGuide, setShowGuide]           = useState(false);
  const loaderRef = useRef(null);

  // Universal Creator auto-open (Segment 7.1) — open CreateUpdateModal
  // when the creator routes here with the neighbourhood-update signal.
  useEffect(() => {
    if (autoOpen) setShowPostModal(true);
  }, [autoOpen]);

  // First-time guide
  useEffect(() => {
    try {
      const seen = localStorage.getItem(NU_GUIDE_SEEN_KEY);
      if (!seen) setShowGuide(true);
    } catch { /* localStorage unavailable */ }
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    try { localStorage.setItem(NU_GUIDE_SEEN_KEY, '1'); } catch { /* ignore */ }
  };

  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    if (!channel?.id) return;
    const fromIdx = reset ? 0 : page * PAGE_SIZE;
    if (reset) setLoading(true);

    let q = supabase
      .from('community_posts')
      .select(NU_POST_SELECT)
      .eq('channel_id', channel.id);

    if (filterCat) q = q.eq('nu_category', filterCat);

    // Pinned first, then newest
    q = q.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    q = q.range(fromIdx, fromIdx + PAGE_SIZE - 1);

    const { data } = await q;
    const incoming = data || [];

    if (reset) {
      setPosts(incoming);
      setPage(1);
    } else {
      setPosts(prev => {
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...incoming.filter(p => !ids.has(p.id))];
      });
      setPage(p => p + 1);
    }
    setHasMore(incoming.length === PAGE_SIZE);
    setLoading(false);
  }, [channel?.id, filterCat, page]);

  useEffect(() => {
    setPage(0); setHasMore(true); setPosts([]); setLoading(true);
  }, [channel?.id, filterCat]);

  useEffect(() => {
    if (!channel?.id || page !== 0) return;
    fetchPosts(true);
  // eslint-disable-next-line
  }, [channel?.id, filterCat, page]);

  // Load user's helpful votes + saved
  useEffect(() => {
    if (!user || posts.length === 0) return;
    const ids = posts.map(p => p.id);
    // Reuse community_votes table: vote=1 → helpful, vote=-1 → not helpful
    supabase.from('community_votes').select('post_id,vote').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => {
        const m = {};
        (data || []).forEach(r => { m[r.post_id] = r.vote; });
        setUserHelpful(prev => ({ ...prev, ...m }));
      });
    supabase.from('community_saved').select('post_id').eq('user_id', user.id).in('post_id', ids)
      .then(({ data }) => {
        const m = {};
        (data || []).forEach(s => { m[s.post_id] = true; });
        setSavedPosts(prev => ({ ...prev, ...m }));
      });
  }, [user, posts]);

  // Realtime
  useEffect(() => {
    if (!channel?.id) return;
    const sub = supabase.channel(`nu:${channel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${channel.id}` }, async (payload) => {
        const { data } = await supabase.from('community_posts').select(NU_POST_SELECT).eq('id', payload.new.id).single();
        if (data) setPosts(prev => prev.some(p => p.id === data.id) ? prev : [data, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${channel.id}` }, (payload) => {
        setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts', filter: `channel_id=eq.${channel.id}` }, (payload) => {
        if (payload.old?.id) setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [channel?.id]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchPosts(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, fetchPosts]);

  // Helpful handler
  const handleHelpful = async (postId, vote) => {
    if (!user) return;
    const current = userHelpful[postId];
    if (current === vote) {
      // toggle off
      setUserHelpful(p => { const n = { ...p }; delete n[postId]; return n; });
      setPosts(p => p.map(x => x.id === postId ? {
        ...x,
        helpful_count: vote === 1 ? Math.max(0, (x.helpful_count || 0) - 1) : x.helpful_count,
        not_helpful_count: vote === -1 ? Math.max(0, (x.not_helpful_count || 0) - 1) : x.not_helpful_count,
      } : x));
      await supabase.from('community_votes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      setUserHelpful(p => ({ ...p, [postId]: vote }));
      setPosts(p => p.map(x => {
        if (x.id !== postId) return x;
        let helpful = x.helpful_count || 0;
        let notHelpful = x.not_helpful_count || 0;
        if (current === 1) helpful = Math.max(0, helpful - 1);
        if (current === -1) notHelpful = Math.max(0, notHelpful - 1);
        if (vote === 1) helpful += 1; else notHelpful += 1;
        return { ...x, helpful_count: helpful, not_helpful_count: notHelpful };
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

  const handleReport = async (postId) => {
    if (!user) return;
    const reason = 'irrelevant';
    await supabase.from('community_reports').insert({ post_id: postId, reporter_id: user.id, reason });
    setPosts(p => p.map(x => x.id === postId ? { ...x, report_count: (x.report_count || 0) + 1 } : x));
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this update?')) return;
    setPosts(p => p.filter(x => x.id !== postId));
    await supabase.from('community_posts').delete().eq('id', postId);
  };

  const handlePostCreated = (post) => {
    setPosts(prev => {
      const without = prev.filter(p => p.id !== post.id);
      // Pinned goes to very top, others after any existing pinned
      if (post.is_pinned) return [post, ...without];
      const pinnedEnd = without.findLastIndex ? without.findLastIndex(p => p.is_pinned) : -1;
      const insertAt = pinnedEnd + 1;
      return [...without.slice(0, insertAt), post, ...without.slice(insertAt)];
    });
  };

  // Visible posts (filter out expired unless admin)
  const visiblePosts = posts.filter(p => isAdmin || !p.expires_at || new Date(p.expires_at) >= new Date());

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      {/* Page header */}
      <div style={{
        padding: '18px 16px 14px',
        background: 'linear-gradient(180deg, #FFFDF7 0%, #FFFFFF 100%)',
        borderBottom: '1px solid rgba(217,119,6,0.08)',
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0D0820', fontFamily: 'var(--font-display)', letterSpacing: -0.5, marginBottom: 4 }}>
          🏡 Neighbourhood Updates
        </div>
        <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 14 }}>
          Stay informed with important updates, alerts and useful information from your locality.
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowPostModal(true)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(217,119,6,0.3)',
            }}
          >
            + Post Update
          </button>
          <button
            onClick={() => setShowGuide(true)}
            style={{
              padding: '11px 14px', borderRadius: 12,
              border: '1.5px solid rgba(217,119,6,0.3)',
              background: '#FFFBF2', color: '#D97706',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            What can I post?
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div style={{ padding: '10px 16px 6px', borderBottom: '1px solid rgba(217,119,6,0.06)' }}>
        <div className="hscr" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setFilterCat('')}
            style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: filterCat === '' ? 700 : 500,
              border: filterCat === '' ? '1.5px solid #D97706' : '1.5px solid #E5E7EB',
              background: filterCat === '' ? '#FEF3C7' : '#FAFAFA',
              color: filterCat === '' ? '#D97706' : '#6B7280', cursor: 'pointer',
            }}
          >All</button>
          {NU_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? '' : cat.id)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', borderRadius: 999, fontSize: 12.5,
                fontWeight: filterCat === cat.id ? 700 : 500,
                border: `1.5px solid ${filterCat === cat.id ? cat.color + '66' : '#E5E7EB'}`,
                background: filterCat === cat.id ? cat.bg : '#FAFAFA',
                color: filterCat === cat.id ? cat.color : '#6B7280', cursor: 'pointer',
              }}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ padding: '14px 14px calc(var(--bottom-nav-h, 80px) + env(safe-area-inset-bottom, 0px) + 14px)' }}>
        {loading && posts.length === 0 ? (
          // Skeleton
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 20 }} />
            ))}
          </div>
        ) : visiblePosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '48px 28px',
              background: 'linear-gradient(180deg, #FFFDF7 0%, #FFFFFF 100%)',
              borderRadius: 22, border: '1px solid rgba(217,119,6,0.08)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏡</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', marginBottom: 6 }}>
              {filterCat ? `No ${NU_CATEGORIES.find(c => c.id === filterCat)?.label} updates yet` : 'No updates yet'}
            </div>
            <div style={{ fontSize: 13.5, color: '#9CA3AF', lineHeight: 1.55 }}>
              Be the first to share something useful with your neighbourhood.
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {visiblePosts.map(post => (
              <UpdateCard
                key={post.id}
                post={post}
                user={user}
                userHelpful={userHelpful[post.id]}
                isSaved={!!savedPosts[post.id]}
                onHelpful={handleHelpful}
                onSave={handleSave}
                onReport={handleReport}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef} style={{ height: 20 }} />
        {loading && posts.length > 0 && (
          <div style={{ textAlign: 'center', padding: '10px 0', color: '#D97706', fontSize: 13 }}>Loading more…</div>
        )}
        {!hasMore && visiblePosts.length > 0 && (
          <div style={{ textAlign: 'center', padding: '10px 0', color: '#9CA3AF', fontSize: 13 }}>You're all caught up 🎉</div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showGuide && <WhatCanIPostSheet onClose={dismissGuide} />}
      </AnimatePresence>

      <AnimatePresence>
        {showPostModal && (
          <CreateUpdateModal
            onClose={() => setShowPostModal(false)}
            onCreated={handlePostCreated}
            channelId={channel?.id}
            user={user}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
