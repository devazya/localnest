import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const POSTS = [
  {
    id: 1, avatar: 'RK', author: 'Rahul Kumar', verified: true,
    time: '2 hours ago', category: 'Announcements',
    title: 'Water supply cut tomorrow 10am–2pm in Sector 4',
    content: 'Heads up everyone — BWSSB has scheduled maintenance work tomorrow. Please store enough water tonight. This affects blocks A, B, and C of Greenwood Apartments.',
    image: null, likes: 47, comments: 23, saved: false, liked: false,
    tags: ['Water', 'Maintenance'],
  },
  {
    id: 2, avatar: 'PS', author: 'Priya Sharma', verified: false,
    time: '4 hours ago', category: 'Rides',
    title: 'Daily carpool to Whitefield — 2 seats open from next Monday',
    content: 'I drive to Whitefield every weekday, leaving Sarjapur Road at 8:30am. Looking for 2 co-passengers to split fuel costs. Drop near ITPL, Prestige Tech Park, or EGL. DM me.',
    image: null, likes: 31, comments: 12, saved: false, liked: false,
    tags: ['Carpool', 'Whitefield'],
  },
  {
    id: 3, avatar: 'AM', author: 'Arjun Mehta', verified: true,
    time: '6 hours ago', category: 'Events',
    title: 'Sunday Cricket Tournament — register your team before Saturday!',
    content: 'Organising a 6-over cricket tournament this Sunday at HSR Layout ground. Open to all skill levels. Team of 8, entry fee ₹200 per team. Trophies and refreshments included. Register in comments.',
    image: 'https://images.unsplash.com/photo-1540747913346-19212a4b423c?w=600&q=80',
    likes: 88, comments: 41, saved: false, liked: false,
    tags: ['Cricket', 'Sports'],
  },
  {
    id: 4, avatar: 'NK', author: 'Neha K.', verified: false,
    time: '8 hours ago', category: 'Buy/Sell',
    title: 'Selling my almost new study table + chair set — ₹2,800',
    content: 'Moving out next week, selling my wooden study table (4ft x 2ft) with ergonomic chair. Bought 8 months ago for ₹6,500. No scratches, solid condition. Pickup from Koramangala 6th Block.',
    image: null, likes: 19, comments: 7, saved: false, liked: false,
    tags: ['Furniture', 'Study Table'],
  },
  {
    id: 5, avatar: 'VS', author: 'Vikram S.', verified: true,
    time: '10 hours ago', category: 'Help',
    title: 'Electrician recommendation needed — urgent wire issue',
    content: 'One of my room circuits tripped and won\'t reset. Anyone know a reliable electrician in Bellandur area who responds on weekends? PG owner is not picking up. Please help!',
    image: null, likes: 14, comments: 33, saved: false, liked: false,
    tags: ['Help', 'Electrician'],
  },
  {
    id: 6, avatar: 'DL', author: 'Divya L.', verified: false,
    time: '12 hours ago', category: 'General',
    title: 'Best mess in HSR Layout? My go-to list after 2 years here',
    content: 'After living in HSR for 2 years, I\'ve tried almost every mess. My top 3: Annapoorna (27th main, ₹80 thali), Sree Bhavan (Sector 7, best sambhar), and Udupi Garden (near BDA complex). All under ₹100.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
    likes: 156, comments: 62, saved: false, liked: false,
    tags: ['Food', 'Recommendations'],
  },
  {
    id: 7, avatar: 'KJ', author: 'Karan J.', verified: false,
    time: '1 day ago', category: 'Announcements',
    title: 'New metro station opening near HSR — construction timeline update',
    content: 'According to the BMRCL press release, the Phase 2B extension through HSR Layout is now expected to open by December 2026. Three stations will serve our area. This will massively cut commute times to MG Road.',
    image: null, likes: 203, comments: 87, saved: false, liked: false,
    tags: ['Metro', 'Infrastructure'],
  },
  {
    id: 8, avatar: 'ST', author: 'Sneha T.', verified: true,
    time: '1 day ago', category: 'Help',
    title: 'Lost a black JBL earphone case near the park yesterday evening',
    content: 'I lost my JBL Tune 230NC case near the HSR BDA Complex park yesterday around 6:30pm. Has my name written inside — Sneha. If you found it please DM or comment. Will pick it up from wherever. Thank you!',
    image: null, likes: 8, comments: 15, saved: false, liked: false,
    tags: ['Lost & Found'],
  },
];

const FILTERS = ['All', 'General', 'Announcements', 'Events', 'Rides', 'Buy/Sell', 'Help'];

const CATEGORY_CONFIG = {
  General:       { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', dot: '#9CA3AF' },
  Announcements: { color: '#D97706', bg: 'rgba(245,158,11,0.1)',  dot: '#F59E0B' },
  Events:        { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  dot: '#8B5CF6' },
  Rides:         { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   dot: '#38BDF8' },
  'Buy/Sell':    { color: '#059669', bg: 'rgba(5,150,105,0.1)',   dot: '#34D399' },
  Help:          { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   dot: '#F87171' },
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div style={{ background:'rgba(255,255,255,0.7)', border:'1.5px solid rgba(255,255,255,0.7)', borderRadius:18, padding:22, backdropFilter:'blur(16px)' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ marginBottom: i < 3 ? 24 : 0 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(109,74,255,0.08)', animation:'pulse 1.5s infinite' }} />
            <div>
              <div style={{ width:120, height:12, borderRadius:6, background:'rgba(109,74,255,0.08)', marginBottom:6 }} />
              <div style={{ width:80, height:10, borderRadius:6, background:'rgba(109,74,255,0.06)' }} />
            </div>
          </div>
          <div style={{ height:14, borderRadius:6, background:'rgba(109,74,255,0.08)', marginBottom:8 }} />
          <div style={{ height:12, borderRadius:6, background:'rgba(109,74,255,0.06)', width:'80%' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Post Card ───────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onSave }) {
  const cfg = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.General;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.84)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'all 0.28s ease',
      }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(109,74,255,0.13)' }}
    >
      {/* Optional image */}
      {post.image && (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img
            src={post.image}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      )}

      <div style={{ padding: '20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(109,74,255,0.15), rgba(143,123,255,0.08))',
              border: '1.5px solid rgba(109,74,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5,
              color: 'var(--primary)', flexShrink: 0,
            }}>{post.avatar}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{post.author}</span>
                {post.verified && (
                  <span style={{ fontSize: 10, background: 'rgba(109,74,255,0.1)', color: 'var(--primary)', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{post.time}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
              color: cfg.color, background: cfg.bg,
              border: `1px solid ${cfg.color}22`,
            }}>{post.category}</span>
            <button
              onClick={() => onSave(post.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, transition: 'transform 0.2s', color: post.saved ? '#7C3AED' : '#9CA3AF' }}
              title={post.saved ? 'Unsave' : 'Save'}
            >{post.saved ? '🔖' : '🔖'}</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ fontSize: 15.5, fontWeight: 660, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4, fontFamily: 'var(--font-display)' }}>{post.title}</div>
        <div style={{
          fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12,
          ...(expanded ? {} : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }),
        }}>{post.content}</div>
        {post.content.length > 120 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10, padding: 0 }}
          >{expanded ? 'Show less' : 'Read more'}</button>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 6, padding: '2px 9px', fontSize: 11.5, color: 'var(--primary)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(109,74,255,0.07)' }}>
          <button
            onClick={() => onLike(post.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: post.liked ? 'rgba(109,74,255,0.08)' : 'none',
              border: post.liked ? '1px solid rgba(109,74,255,0.18)' : '1px solid transparent',
              color: post.liked ? 'var(--primary)' : 'var(--text-muted)',
              borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 15 }}>{post.liked ? '❤️' : '🤍'}</span>
            {post.liked ? post.likes + 1 : post.likes}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid transparent', color: 'var(--text-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.06)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          ><span style={{ fontSize: 15 }}>💬</span>{post.comments}</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid transparent', color: 'var(--text-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.06)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          ><span style={{ fontSize: 15 }}>↗️</span>Share</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Community({ onNavigate }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState(POSTS);
  const [loading] = useState(false);

  const filtered = posts.filter(p => {
    const matchFilter = filter === 'All' || p.category === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleLike = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
  const handleSave = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>COMMUNITY</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
              What's happening <span style={{ color: 'var(--primary)' }}>nearby</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', marginBottom: 24 }}>Discussions, announcements, and updates from your locality</p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts, topics, or keywords…"
                style={{
                  width: '100%', padding: '12px 16px 12px 42px',
                  background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)',
                  borderRadius: 12, fontSize: 14, color: 'var(--text-primary)',
                  outline: 'none', backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 12px rgba(109,74,255,0.06)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                    border: filter === f ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                    background: filter === f ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
                    color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.18s', backdropFilter: 'blur(8px)',
                  }}
                >{f}</button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> posts
            {filter !== 'All' && <span> in <strong style={{ color: 'var(--primary)' }}>{filter}</strong></span>}
          </div>
          <button
            onClick={() => onNavigate && onNavigate('post')}
            style={{
              background: 'var(--primary)', color: '#fff', border: 'none',
              padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(109,74,255,0.3)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,74,255,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,74,255,0.3)'; }}
          >✏️ Post</button>
        </div>

        {loading ? (
          <PostSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No posts found</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Try a different filter or search term</div>
            <button onClick={() => { setFilter('All'); setSearch(''); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Clear filters</button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {filtered.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
