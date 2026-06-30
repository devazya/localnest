/**
 * Community.jsx — LocalNest Community Hub v6
 * FINAL REDESIGN — Discord × Linear × Notion × Local Community Premium Hybrid
 *
 * Key changes from v5:
 *  - Channel strip → LIVE ACTIVITY strip (dynamic, only shows active channels)
 *  - PNG icons from assets/icons/ (large, ~70% card area)
 *  - Search bar removed → search icon only → full-screen overlay
 *  - Channels: General, Announcements, Ride Sharing, Events, Sports, Lost & Found, Help, Jobs
 *  - General = Discord-style live chat
 *  - All others = Discussion feed with Discord-thread replies
 *  - Post flow: Type → Channel → Preview → Confirm
 *  - Premium glass cards, lavender radial glow, floating depth
 *  - Notification badges with pulse animation
 *  - Full-screen search overlay (posts, people, channels, events)
 *  - "You're all caught up" at feed bottom
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── PNG Icon Imports (using available assets) ───────────────────────────────
import GeneralDiscussionIcon      from '../assets/icons/General Discussion.png';
import AnnouncementDiscussionIcon from '../assets/icons/Announcement Discussion.png';
import RideDiscussionIcon         from '../assets/icons/Ride Discussion.png';
import EventsDiscussionIcon       from '../assets/icons/Events.png';
import SportsDiscussionIcon       from '../assets/icons/Rides.png';
import LostFoundDiscussionIcon    from '../assets/icons/Buy & Sell Discussion.png';
import HelpDiscussionIcon         from '../assets/icons/Fitness.png';
import JobsDiscussionIcon         from '../assets/icons/Shops.png';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS = [
  {
    slug: 'general',
    name: 'General',
    icon: GeneralDiscussionIcon,
    desc: 'Live chat with everyone',
    color: '#6D4AFF',
    bg: 'linear-gradient(135deg, #EDE9FF 0%, #F5F3FF 100%)',
    glowColor: 'rgba(109,74,255,0.18)',
    type: 'chat',
  },
  {
    slug: 'announcements',
    name: 'Announcements',
    icon: AnnouncementDiscussionIcon,
    desc: 'Official updates & notices',
    color: '#D97706',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
    glowColor: 'rgba(217,119,6,0.15)',
    type: 'card',
  },
  {
    slug: 'ride-sharing',
    name: 'Ride Sharing',
    icon: RideDiscussionIcon,
    desc: 'Ride offers & discussions',
    color: '#16A34A',
    bg: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
    glowColor: 'rgba(22,163,74,0.15)',
    type: 'discussion',
  },
  {
    slug: 'events',
    name: 'Events',
    icon: EventsDiscussionIcon,
    desc: 'Local events & meetups',
    color: '#DB2777',
    bg: 'linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%)',
    glowColor: 'rgba(219,39,119,0.15)',
    type: 'discussion',
  },
  {
    slug: 'sports',
    name: 'Sports',
    icon: SportsDiscussionIcon,
    desc: 'Sports discussions',
    color: '#0284C7',
    bg: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
    glowColor: 'rgba(2,132,199,0.15)',
    type: 'discussion',
  },
  {
    slug: 'lost-and-found',
    name: 'Lost & Found',
    icon: LostFoundDiscussionIcon,
    desc: 'Lost items & found items',
    color: '#DC2626',
    bg: 'linear-gradient(135deg, #FEE2E2 0%, #FFF5F5 100%)',
    glowColor: 'rgba(220,38,38,0.15)',
    type: 'discussion',
  },
  {
    slug: 'help',
    name: 'Help',
    icon: HelpDiscussionIcon,
    desc: 'Ask questions, get help',
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
    glowColor: 'rgba(124,58,237,0.15)',
    type: 'discussion',
  },
  {
    slug: 'jobs',
    name: 'Jobs',
    icon: JobsDiscussionIcon,
    desc: 'Hiring & opportunities',
    color: '#B45309',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
    glowColor: 'rgba(180,83,9,0.15)',
    type: 'discussion',
  },
];

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
  { id: 'post',    title: 'Post',       desc: 'Share something with community' },
  { id: 'offer',   title: 'Offer',      desc: 'Offer a ride or service' },
  { id: 'event',   title: 'Event',      desc: 'Create an event' },
  { id: 'poll',    title: 'Poll',       desc: 'Ask a question' },
];

const PAGE_SIZE = 10;
const MOCK_UNREAD = { general: 12, announcements: 3, 'ride-sharing': 8, events: 4, sports: 5, 'lost-and-found': 2, help: 6, jobs: 3 };
const MOCK_ACTIVITY_CHANNELS = ['general', 'announcements', 'ride-sharing', 'events', 'sports', 'jobs', 'lost-and-found'];

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

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6D4AFF','#D97706','#DB2777','#16A34A','#0284C7','#7C3AED','#DC2626','#EA580C'];

function Avatar({ profile, size = 40 }) {
  const name  = profile?.full_name || profile?.username || 'User';
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: profile?.avatar_url ? 'transparent' : color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, color: '#fff', overflow: 'hidden',
      fontFamily: 'var(--font-display)',
    }}>
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
        <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 18, boxShadow: '0 2px 20px rgba(109,74,255,0.07)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 130, height: 13, borderRadius: 6, marginBottom: 7 }} />
              <div className="skeleton" style={{ width: 80, height: 11, borderRadius: 6 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 13, borderRadius: 6, width: '75%' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Full-Screen Search Overlay ───────────────────────────────────────────────

function SearchOverlay({ onClose, channels, posts }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const q = query.toLowerCase().trim();
  const filteredPosts = q
    ? posts.filter(p => (p.title || '').toLowerCase().includes(q) || (p.body || '').toLowerCase().includes(q))
    : [];
  const filteredChannels = q
    ? CHANNELS.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(13,8,32,0.72)',
        backdropFilter: 'blur(18px)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Search bar */}
      <div style={{ padding: '56px 20px 16px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.22)',
          borderRadius: 16, padding: '12px 16px',
          backdropFilter: 'blur(12px)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts, people, channels, events…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 16, color: '#fff', fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
          )}
        </div>

        {/* Search scope chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {['Posts', 'People', 'Channels', 'Events', 'Businesses', 'Messages', 'Comments'].map(scope => (
            <div key={scope} style={{
              padding: '5px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500,
            }}>{scope}</div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
        {!q && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Search across community</div>
          </div>
        )}

        {q && filteredChannels.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Channels</div>
            {filteredChannels.map(ch => (
              <div key={ch.slug} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', marginBottom: 6,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <img src={ch.icon} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>D/{ch.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{ch.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {q && filteredPosts.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Posts</div>
            {filteredPosts.slice(0, 8).map(post => (
              <div key={post.id} style={{
                padding: '12px 14px', marginBottom: 8,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{post.title}</div>
                {post.body && <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{post.body?.slice(0, 80)}…</div>}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{timeAgo(post.created_at)}</div>
              </div>
            ))}
          </div>
        )}

        {q && filteredPosts.length === 0 && filteredChannels.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>No results for "{q}"</div>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 20,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 12, padding: '8px 14px',
          fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
        }}
      >Cancel</button>
    </motion.div>
  );
}

// ─── Live Activity Strip Item ─────────────────────────────────────────────────

function LiveActivityCard({ ch, isActive, unread, hasLive, onClick }) {
  const chMeta = CHANNELS.find(c => c.slug === ch.slug);
  const isLive = hasLive || (unread === 0 && ch.slug === 'general');

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '2px 4px', flexShrink: 0, minWidth: 72, position: 'relative',
      }}
    >
      {/* Card */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 18,
        background: isActive
          ? `linear-gradient(145deg, #fff 0%, #F5F3FF 100%)`
          : '#fff',
        border: isActive ? `2px solid ${chMeta?.color || '#6D4AFF'}` : '2px solid rgba(109,74,255,0.1)',
        boxShadow: isActive
          ? `0 4px 20px ${chMeta?.glowColor || 'rgba(109,74,255,0.25)'}, 0 0 0 4px ${chMeta?.glowColor || 'rgba(109,74,255,0.1)'}, inset 0 1px 0 rgba(255,255,255,0.9)`
          : '0 2px 12px rgba(109,74,255,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'visible',
        transform: isActive ? 'translateY(-2px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Radial glow behind */}
        {isActive && (
          <div style={{
            position: 'absolute', inset: -8, borderRadius: 26,
            background: `radial-gradient(circle at center, ${chMeta?.glowColor || 'rgba(109,74,255,0.15)'} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
        )}
        {/* Icon — ~70% of card area */}
        <img
          src={ch.icon}
          alt={ch.name}
          style={{
            width: 44, height: 44,
            objectFit: 'contain',
            position: 'relative', zIndex: 1,
            filter: isActive ? 'drop-shadow(0 2px 6px rgba(109,74,255,0.3))' : 'none',
            transition: 'filter 0.2s',
          }}
        />
        {/* Inner highlight */}
        <div style={{
          position: 'absolute', top: 2, left: 4, right: 4, height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
          borderRadius: '14px 14px 50% 50%',
          pointerEvents: 'none',
        }} />

        {/* Notification badge */}
        {unread > 0 ? (
          <div style={{
            position: 'absolute', top: -6, right: -6,
            minWidth: 20, height: 20,
            background: '#EF4444',
            borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
            border: '2px solid #F0EFFF',
            padding: '0 5px', boxSizing: 'border-box',
            zIndex: 10,
            animation: 'badgePulse 2s ease-in-out infinite',
          }}>
            {unread > 9 ? '9+' : unread}
          </div>
        ) : isLive ? (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            padding: '2px 6px',
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            borderRadius: 999,
            fontSize: 9, fontWeight: 800, color: '#fff',
            border: '2px solid #F0EFFF',
            letterSpacing: 0.5, zIndex: 10,
            animation: 'livePulse 2s ease-in-out infinite',
          }}>LIVE</div>
        ) : null}
      </div>

      <span style={{
        fontSize: 10.5,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? (chMeta?.color || '#6D4AFF') : '#6B7280',
        textAlign: 'center', lineHeight: 1.2,
        maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color 0.2s',
      }}>
        {ch.name}
      </span>
    </motion.button>
  );
}

// ─── Edit Post Modal ──────────────────────────────────────────────────────────

function EditPostModal({ post, onClose, onUpdated }) {
  const [title, setTitle]     = useState(post.title);
  const [body, setBody]       = useState(post.body || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const save = async () => {
    if (!title.trim()) { setError('Title required'); return; }
    setLoading(true);
    const { data, error: e } = await supabase
      .from('community_posts')
      .update({ title: title.trim(), body: body.trim() || null })
      .eq('id', post.id)
      .select('id,title,body,updated_at')
      .single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    onUpdated(data); onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 22, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Edit Post</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" maxLength={120}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Description (optional)" rows={4}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
        {error && <div style={{ color: '#DC2626', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#4B5563' }}>Cancel</button>
          <button onClick={save} disabled={loading} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: '#6D4AFF', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onCreated, channels, currentChannelId, user }) {
  const [step, setStep]               = useState(1);
  const [channelSlug, setChannelSlug] = useState(channels.find(c => c.id === currentChannelId)?.slug || 'general');
  const [title, setTitle]             = useState('');
  const [body, setBody]               = useState('');
  const [anon, setAnon]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const channelId = channels.find(c => c.slug === channelSlug)?.id || channels[0]?.id;
  const selMeta   = CHANNELS.find(c => c.slug === channelSlug);
  const prefix    = getChannelPrefix(channelSlug);

  const submit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!user) { setError('Sign in to post.'); return; }
    setLoading(true); setError('');
    const { data, error: e } = await supabase
      .from('community_posts')
      .insert({ channel_id: channelId, author_id: user.id, title: title.trim(), body: body.trim() || null, is_anonymous: anon })
      .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
      .single();
    setLoading(false);
    if (e) { setError(e.message); return; }
    onCreated(data); onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -12px 60px rgba(0,0,0,0.2)' }}>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>
            {step === 1 ? 'Create Post' : step === 2 ? 'Choose Channel' : (
              <span>Posting in <span style={{ color: '#6D4AFF' }}>{prefix}</span></span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>

        {/* Progress */}
        <div style={{ margin: '12px 20px 0', height: 3, background: '#F3F0FF', borderRadius: 3 }}>
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #6D4AFF, #9B6AFF)', borderRadius: 3 }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 36px' }}>

          {/* Step 1: Post type */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>What do you want to create?</div>
              {POST_TYPES.map(pt => (
                <button key={pt.id} onClick={() => setStep(2)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    background: '#FAFAFA', border: '1.5px solid #F0F0F0', borderRadius: 14,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#F3F0FF'; e.currentTarget.style.borderColor='#6D4AFF33'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#FAFAFA'; e.currentTarget.style.borderColor='#F0F0F0'; }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D0820' }}>{pt.title}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{pt.desc}</div>
                  </div>
                  <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Channel */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>Where do you want to post?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CHANNELS.map(ch => {
                  const dbCh = channels.find(c => c.slug === ch.slug);
                  if (!dbCh) return null;
                  const sel = ch.slug === channelSlug;
                  return (
                    <button key={ch.slug}
                      onClick={() => { setChannelSlug(ch.slug); setStep(3); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                        background: sel ? 'rgba(109,74,255,0.06)' : '#fff',
                        border: `1.5px solid ${sel ? ch.color + '44' : '#F0F0F0'}`,
                        borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}>
                      <div style={{
                        width: 44, height: 44,
                        borderRadius: 12,
                        background: ch.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <img src={ch.icon} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0D0820' }}>D/{ch.name}</div>
                        <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>{ch.desc}</div>
                      </div>
                      {sel && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 14, width: '100%', padding: '12px 0', borderRadius: 12, border: '1.5px solid #F0F0F0', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>← Back</button>
            </div>
          )}

          {/* Step 3: Compose */}
          {step === 3 && (
            <div>
              {/* Channel preview pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: selMeta?.bg || '#F8F7FF',
                borderRadius: 12, padding: '10px 14px', marginBottom: 18,
                border: `1.5px solid ${selMeta?.color || '#6D4AFF'}22`,
              }}>
                <img src={selMeta?.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>Posting in</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: selMeta?.color || '#6D4AFF' }}>{prefix}</div>
                </div>
              </div>

              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title *" maxLength={120}
                style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: '#0D0820', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add more details…" rows={4}
                style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, color: '#0D0820', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 14 }}
                onFocus={e => e.target.style.borderColor='#6D4AFF'} onBlur={e => e.target.style.borderColor='#E5E7EB'} />

              {/* Anonymous toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
                <div onClick={() => setAnon(a => !a)} style={{ width: 42, height: 24, borderRadius: 999, background: anon ? '#6D4AFF' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: anon ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 13.5, color: '#4B5563' }}>Post anonymously</span>
              </label>

              {error && <div style={{ fontSize: 12.5, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '9px 12px', marginBottom: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Back</button>
                <button onClick={submit} disabled={loading || !title.trim()}
                  style={{
                    flex: 2, padding: '14px 0', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #6D4AFF 0%, #9B6AFF 100%)',
                    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(109,74,255,0.4)',
                    opacity: loading || !title.trim() ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}>
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

// ─── Post Chat (Discord-thread replies) ───────────────────────────────────────

function PostChat({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [submitting, setSub]    = useState(false);
  const bottomRef = useRef(null);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('community_comments')
      .select(`id,post_id,author_id,body,created_at,profiles:author_id(id,full_name,username,avatar_url)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
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
      {comments.length === 0 && (
        <div style={{ fontSize: 12.5, color: '#9CA3AF', textAlign: 'center', padding: '6px 0 10px' }}>Be the first to reply</div>
      )}
      {comments.map(c => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', gap: 9, padding: '5px 0', alignItems: 'flex-start' }}>
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

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, user, channels, userReaction, isSaved, onReact, onSave, onDelete, onEdit }) {
  const [showChat, setShowChat]           = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showEdit, setShowEdit]           = useState(false);
  const [showMenu, setShowMenu]           = useState(false);
  const [hovered, setHovered]             = useState(false);
  const reactRef = useRef(null);
  const menuRef  = useRef(null);

  const isOwner = user && post.author_id === user.id;
  const isAnon  = post.is_anonymous;
  const profile = isAnon ? null : post.profiles;
  const channel = channels.find(c => c.id === post.channel_id);
  const slug    = channel?.slug || post.channel_slug || '';
  const chMeta  = CHANNELS.find(c => c.slug === slug);

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
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        boxShadow: hovered
          ? `0 8px 36px rgba(109,74,255,0.14), 0 2px 8px rgba(0,0,0,0.06)`
          : `0 2px 16px rgba(109,74,255,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
        overflow: 'hidden', marginBottom: 14,
        border: '1px solid rgba(109,74,255,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
      }}
    >
      {/* Subtle top gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${chMeta?.color || '#6D4AFF'} 0%, transparent 100%)`,
        opacity: 0.3,
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '16px 16px 12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            {isAnon
              ? <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              : <Avatar profile={profile} size={44} />
            }
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>
                  {isAnon ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: badge.bg, padding: '2px 9px', borderRadius: 999 }}>{badge.label}</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {post.is_pinned && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6D4AFF"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/></svg>
            )}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#F8F7FF'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 14, boxShadow: '0 10px 32px rgba(0,0,0,0.12)', minWidth: 130, overflow: 'hidden' }}>
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
        <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0820', marginBottom: 8, lineHeight: 1.4, fontFamily: 'var(--font-display)' }}>{post.title}</div>
        {post.body && <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.7, marginBottom: 10 }}>{post.body}</div>}

        {post.image_urls?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
            ))}
          </div>
        )}

        {/* Reaction row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 10, borderTop: '1.5px solid #F4F3FF' }}>
          {/* React */}
          <div ref={reactRef} style={{ position: 'relative' }}>
            <button
              onClick={() => user ? (userReaction ? onReact(post.id, userReaction) : setShowReactions(s => !s)) : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: userReaction ? '#F3F0FF' : 'none', border: 'none',
                borderRadius: 999, padding: '5px 10px 5px 6px',
                cursor: user ? 'pointer' : 'default', transition: 'background 0.15s',
              }}>
              <span style={{ fontSize: 17 }}>{reactEmoji}</span>
              {post.like_count > 0 && <span style={{ fontSize: 13.5, fontWeight: 600, color: userReaction ? '#6D4AFF' : '#374151' }}>{post.like_count}</span>}
            </button>
            <AnimatePresence>
              {showReactions && (
                <motion.div initial={{ opacity: 0, y: 4, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                  style={{ position: 'absolute', bottom: '115%', left: 0, zIndex: 60, background: '#fff', border: '1.5px solid #EDE9FF', borderRadius: 18, padding: '8px 10px', display: 'flex', gap: 4, boxShadow: '0 10px 40px rgba(109,74,255,0.2)' }}>
                  {REACTION_TYPES.map(r => (
                    <button key={r.type} onClick={() => { onReact(post.id, r.type); setShowReactions(false); }}
                      style={{ background: userReaction === r.type ? '#F3F0FF' : 'none', border: '1.5px solid transparent', borderRadius: 10, width: 38, height: 38, fontSize: 20, cursor: 'pointer', transition: 'transform 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.transform='scale(1.28)'}
                      onMouseLeave={e => e.currentTarget.style.transform=''}>
                      {r.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Replies toggle */}
          <button onClick={() => setShowChat(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: showChat ? '#F3F0FF' : 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 999, transition: 'background 0.15s' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={showChat ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {post.comment_count > 0 && <span style={{ fontSize: 13.5, fontWeight: 600, color: showChat ? '#6D4AFF' : '#374151' }}>{post.comment_count}</span>}
          </button>

          {/* Bookmark */}
          <button onClick={() => user && onSave(post.id, isSaved)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 4, borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#F8F7FF'} onMouseLeave={e => e.currentTarget.style.background='none'}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? '#6D4AFF' : 'none'} stroke={isSaved ? '#6D4AFF' : '#9CA3AF'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>

      {/* Live discussion */}
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 280 }}>
      {/* Online banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'linear-gradient(135deg, #F8F7FF, #EDE9FF)',
        borderRadius: 12, padding: '9px 14px', marginBottom: 14,
        border: '1px solid #E8E4FF', flexShrink: 0,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0, boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', animation: 'livePulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 13, color: '#6D4AFF', fontWeight: 600 }}>Live chat · General</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#22C55E', fontWeight: 600 }}>56 online</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 4 }}>
        {posts.map(msg => {
          const isMe    = user && msg.author_id === user.id;
          const isAnon  = msg.is_anonymous;
          const profile = isAnon ? null : msg.profiles;
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 10, padding: '5px 0', alignItems: 'flex-start' }}>
              {isAnon
                ? <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                : <Avatar profile={profile} size={36} />
              }
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0D0820' }}>
                    {isAnon ? 'Anonymous' : (profile?.full_name || profile?.username || 'User')}
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.title || msg.body}</div>
                {msg.like_count > 0 && (
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    <span style={{ fontSize: 12.5, background: '#F3F0FF', borderRadius: 999, padding: '2px 8px', color: '#374151' }}>👍 {msg.like_count}</span>
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

      {/* Input */}
      <div style={{ flexShrink: 0, paddingTop: 10, borderTop: '1.5px solid #F0EFFF', marginTop: 4 }}>
        {user ? (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            background: '#F8F7FF', border: '1.5px solid #EDE9FF',
            borderRadius: 16, padding: '9px 14px',
          }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Message #General"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#0D0820', fontFamily: 'inherit' }} />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', flexShrink: 0 }}>😊</button>
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

// ─── All Caught Up ────────────────────────────────────────────────────────────

function AllCaughtUp() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff',
        border: '1.5px solid rgba(109,74,255,0.15)',
        borderRadius: 999, padding: '9px 22px',
        boxShadow: '0 2px 16px rgba(109,74,255,0.08)',
      }}>
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
      style={{
        textAlign: 'center', padding: '52px 24px',
        background: '#fff', borderRadius: 20,
        boxShadow: '0 2px 20px rgba(109,74,255,0.07)',
        border: '1px solid rgba(109,74,255,0.06)',
      }}>
      {chMeta?.icon
        ? <img src={chMeta.icon} alt="" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 16px' }} />
        : <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
      }
      <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
        {search ? 'No matching posts' : `No posts in ${activeName} yet`}
      </div>
      <div style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 22 }}>
        {search ? 'Try different keywords' : 'Be the first to start a conversation!'}
      </div>
      {search
        ? <button onClick={onClear} style={{ background: '#F3F0FF', color: '#6D4AFF', border: 'none', padding: '12px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Clear Search</button>
        : <button onClick={onPost} style={{ background: 'linear-gradient(135deg, #6D4AFF, #9B6AFF)', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 18px rgba(109,74,255,0.32)' }}>Create Post</button>
      }
    </motion.div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({ channels, activeChannelId, unreadCounts, onSelect, onClose }) {
  const totalUnread = ch => unreadCounts[ch.slug] || MOCK_UNREAD[ch.slug] || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex' }}>
      <motion.div
        initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ width: 288, height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '8px 0 40px rgba(0,0,0,0.12)' }}>

        {/* Header */}
        <div style={{ padding: '32px 20px 14px', background: 'linear-gradient(180deg, #FAFAFF 0%, #fff 100%)', borderBottom: '1px solid #F4F3FF' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Community</div>
          <div style={{ fontSize: 12.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#EF4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Green Sector, Bangalore
          </div>
        </div>

        <div style={{ padding: '14px 20px 8px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#9CA3AF' }}>Channels</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
          {CHANNELS.map(ch => {
            const dbCh    = channels.find(c => c.slug === ch.slug);
            const isActive = dbCh && dbCh.id === activeChannelId;
            const unread   = totalUnread(ch);
            return (
              <button key={ch.slug} onClick={() => { if (dbCh) onSelect(dbCh.id); onClose(); }}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 14, marginBottom: 3,
                  background: isActive ? `${ch.color}10` : 'none',
                  border: isActive ? `1.5px solid ${ch.color}22` : '1.5px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='#F8F7FF'; e.currentTarget.style.borderColor='rgba(109,74,255,0.08)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; } }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: ch.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isActive ? `0 2px 10px ${ch.glowColor}` : 'none',
                }}>
                  <img src={ch.icon} alt={ch.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 600, color: isActive ? ch.color : '#0D0820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
                  <div style={{ fontSize: 11.5, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{ch.desc}</div>
                </div>
                {unread > 0 && (
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: 999,
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10.5, fontWeight: 700, color: '#fff', padding: '0 5px',
                    boxSizing: 'border-box', flexShrink: 0,
                    animation: 'badgePulse 2s ease-in-out infinite',
                  }}>{unread}</div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '10px 10px 36px', borderTop: '1px solid #F4F3FF' }}>
          <button style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 13.5, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background='#F8F7FF'} onMouseLeave={e => e.currentTarget.style.background='none'}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F4F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <span style={{ fontWeight: 600 }}>Settings</span>
          </button>
        </div>
      </motion.div>
      <div style={{ flex: 1, background: 'rgba(13,8,32,0.3)' }} onClick={onClose} />
    </motion.div>
  );
}

// ─── Inline keyframe styles ───────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes badgePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50% { transform: scale(1.08); box-shadow: 0 0 0 4px rgba(239,68,68,0); }
}
@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { opacity: 0.85; box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #F0EEFF 25%, #E8E4FF 50%, #F0EEFF 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
`;

// ─── Main Community Page ──────────────────────────────────────────────────────

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
  const [showModal, setShowModal]             = useState(false);
  const [showDrawer, setShowDrawer]           = useState(false);
  const [showSearch, setShowSearch]           = useState(false);
  const [userReactions, setUserReactions]     = useState({});
  const [savedPosts, setSavedPosts]           = useState({});
  const [unreadCounts, setUnreadCounts]       = useState({});
  const [activityChannels, setActivityChannels] = useState(MOCK_ACTIVITY_CHANNELS);
  const loaderRef = useRef(null);

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

  // ─ Query builder ─
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

  // ─ Fetch posts ─
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
      if (activeChannelId) setUnreadCounts(prev => ({ ...prev, [activeChannelId]: 0 }));
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
          // Add channel to activity strip
          const chMeta = CHANNELS.find(c => c.id === ch.id || c.slug === ch.slug);
          if (chMeta) {
            setActivityChannels(prev => prev.includes(chMeta.slug) ? prev : [chMeta.slug, ...prev]);
          }
          if (ch.id === activeChannelId) {
            if (user && payload.new.author_id === user.id) return;
            const { data } = await supabase.from('community_posts')
              .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,updated_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
              .eq('id', payload.new.id).single();
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

  const handlePostCreated = (p) => {
    setPosts(prev => [p, ...prev]);
    // Add channel to activity strip when user posts
    const ch = channels.find(c => c.id === p.channel_id);
    if (ch) {
      const chMeta = CHANNELS.find(c => c.slug === ch.slug);
      if (chMeta) setActivityChannels(prev => prev.includes(chMeta.slug) ? prev : [chMeta.slug, ...prev]);
    }
  };

  const handlePostEdited  = (id, upd) => setPosts(prev => prev.map(p => p.id === id ? { ...p, ...upd } : p));

  const handleChatPost = async (text) => {
    if (!user || !activeChannelId) return;
    const { data } = await supabase.from('community_posts')
      .insert({ channel_id: activeChannelId, author_id: user.id, title: text, body: null, is_anonymous: false })
      .select(`id,author_id,channel_id,channel_slug,title,body,image_urls,is_anonymous,is_pinned,like_count,comment_count,created_at,profiles:author_id(id,full_name,username,avatar_url,is_verified)`)
      .single();
    if (data) setPosts(prev => [...prev, data]);
  };

  const activeChannel  = channels.find(c => c.id === activeChannelId);
  const activeSlug     = activeChannel?.slug || '';
  const activeName     = activeChannel?.name || 'Community';
  const activeMeta     = CHANNELS.find(c => c.slug === activeSlug);
  const isChat         = activeMeta?.type === 'chat';

  const getUnread = (slug) => {
    const ch = channels.find(c => c.slug === slug);
    return ch ? (unreadCounts[ch.id] || 0) : (MOCK_UNREAD[slug] || 0);
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)
    + Object.values(MOCK_UNREAD).reduce((a, b) => a + b, 0);

  // Active channels for strip — only those with activity
  const stripChannels = CHANNELS.filter(ch => activityChannels.includes(ch.slug));

  return (
    <div style={{ minHeight: '100vh', background: '#EEEEFF', display: 'flex', flexDirection: 'column' }}>
      {/* Inject keyframes */}
      <style>{KEYFRAMES}</style>

      {/* Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <Drawer channels={channels} activeChannelId={activeChannelId} unreadCounts={unreadCounts} onSelect={handleSelect} onClose={() => setShowDrawer(false)} />
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} channels={channels} posts={posts} />}
      </AnimatePresence>

      {/* ── Sticky Top Bar ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid rgba(109,74,255,0.08)',
        padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
        boxShadow: '0 2px 12px rgba(109,74,255,0.06)',
      }}>
        {/* Hamburger */}
        <button onClick={() => setShowDrawer(true)} style={{
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F8F8FF', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 12,
          cursor: 'pointer', position: 'relative', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          {totalUnread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              minWidth: 16, height: 16,
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              borderRadius: 999, fontSize: 9, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff', padding: '0 3px',
              animation: 'badgePulse 2s ease-in-out infinite',
            }}>{totalUnread > 99 ? '99+' : totalUnread}</span>
          )}
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Community</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#EF4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            Green Sector, Bangalore
          </div>
        </div>

        {/* Right: search + post */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {/* Search icon (no permanent bar) */}
          <button onClick={() => setShowSearch(true)} style={{
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F8F8FF', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 10,
            cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Three dot menu */}
          <button style={{
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F8F8FF', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 10,
            cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#374151"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>

          {/* Post button */}
          <button
            onClick={() => user ? setShowModal(true) : onNavigate?.('auth')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, #6D4AFF 0%, #9B6AFF 100%)',
              color: '#fff', border: 'none', padding: '9px 15px',
              borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(109,74,255,0.38)',
            }}>
            <span style={{ fontSize: 17, lineHeight: 1, fontWeight: 300 }}>+</span> Post
          </button>
        </div>
      </div>

      {/* ── Channel Header ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid rgba(109,74,255,0.07)',
        padding: '10px 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeMeta?.icon
            ? <img src={activeMeta.icon} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            : <span style={{ fontSize: 22 }}>💬</span>
          }
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>{activeName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>2,156 members · <span style={{ color: '#22C55E', fontWeight: 600 }}>● Updates in your community</span></div>
          </div>
        </div>
      </div>

      {/* ── LIVE ACTIVITY STRIP ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid rgba(109,74,255,0.07)',
        padding: '14px 16px 16px',
      }}>
        {/* Strip label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: '#22C55E',
            animation: 'livePulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>Live Activity</span>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="hscr">
          <AnimatePresence>
            {stripChannels.map(ch => {
              const dbCh    = channels.find(c => c.slug === ch.slug);
              const isActive = dbCh && dbCh.id === activeChannelId;
              const unread   = getUnread(ch.slug);
              return (
                <LiveActivityCard
                  key={ch.slug}
                  ch={ch}
                  isActive={isActive}
                  unread={unread}
                  hasLive={ch.slug === 'general'}
                  onClick={() => { if (dbCh) handleSelect(dbCh.id); }}
                />
              );
            })}
          </AnimatePresence>

          {/* More button */}
          <motion.button
            onClick={() => setShowDrawer(true)}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 4px', flexShrink: 0, minWidth: 72,
            }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(145deg, #F8F7FF, #EDE9FF)',
              border: '2px solid rgba(109,74,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(109,74,255,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#6D4AFF">
                <circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>
              </svg>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: '#6B7280' }}>More</span>
          </motion.button>
        </div>
      </div>

      {/* ── Sort chips (not for chat) ── */}
      {!isChat && (
        <div style={{ background: '#fff', padding: '9px 16px 11px', borderBottom: '1px solid rgba(109,74,255,0.07)' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto' }} className="hscr">
            {SORT_OPTIONS.map(opt => (
              <motion.button key={opt.key} onClick={() => setSort(opt.key)} whileTap={{ scale: 0.94 }}
                style={{
                  flexShrink: 0, padding: '6px 15px', borderRadius: 999,
                  fontSize: 12.5, fontWeight: sort === opt.key ? 700 : 500,
                  border: sort === opt.key ? '1.5px solid rgba(109,74,255,0.28)' : '1.5px solid #E5E7EB',
                  background: sort === opt.key ? '#F3F0FF' : '#fff',
                  color: sort === opt.key ? '#6D4AFF' : '#6B7280',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {opt.label}
              </motion.button>
            ))}
            {/* Filter icon */}
            <button style={{
              marginLeft: 'auto', flexShrink: 0, width: 34, height: 34,
              borderRadius: 10, background: '#F8F8FF', border: '1.5px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      <div style={{
        flex: 1,
        overflowY: isChat ? 'hidden' : 'auto',
        padding: '14px 14px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Loading progress bar */}
        {refreshing && posts.length === 0 && (
          <div style={{ height: 3, background: '#EDE9FF', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, #6D4AFF, #9B6AFF)', borderRadius: 3 }}
            />
          </div>
        )}

        {/* ── General Discord chat ── */}
        {isChat && (
          <div style={{ flex: 1 }}>
            {initialLoad ? <PostSkeleton /> : (
              <GeneralChat posts={posts} user={user} onDelete={handleDelete} onPost={handleChatPost} />
            )}
          </div>
        )}

        {/* ── Discussion feed ── */}
        {!isChat && (
          <>
            {initialLoad ? <PostSkeleton /> :
              posts.length === 0 ? (
                <EmptyState
                  chMeta={activeMeta}
                  activeName={activeName}
                  search={search}
                  user={user}
                  onPost={() => user ? setShowModal(true) : onNavigate?.('auth')}
                  onClear={() => setSearch('')}
                />
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
                    />
                  ))}
                </AnimatePresence>
              )
            }

            {/* Infinite scroll trigger + all caught up */}
            <div ref={loaderRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 48 }}>
              {refreshing && posts.length > 0 && (
                <div style={{ display: 'flex', gap: 5, padding: '14px 0' }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#6D4AFF' }}
                    />
                  ))}
                </div>
              )}
              {!hasMore && posts.length > 0 && !refreshing && <AllCaughtUp />}
            </div>
          </>
        )}
      </div>

      {/* ── Create Post Modal ── */}
      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => setShowModal(false)}
            onCreated={handlePostCreated}
            channels={channels}
            currentChannelId={activeChannelId}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
