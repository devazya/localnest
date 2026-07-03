/**
 * SearchOverlay.jsx — Community module (Segment 6)
 * Community-scoped search: Residents · Discussions · Neighbourhood Updates
 * · Announcements · Community Posts · Channels
 *
 * NEVER searches PG listings, rides, marketplace, businesses, gyms, shops,
 * events page, or home page content. Those belong to Home / Explore search.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase/client';
import { CHANNELS } from './constants';
import { timeAgo } from './utils';
import Avatar from './Avatar';

// ─── Local storage key for recent searches ────────────────────────────────────
const RECENT_KEY = 'localnest:community_search_recent';
const MAX_RECENT = 8;

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT))); } catch {}
}
function addRecent(term) {
  if (!term?.trim()) return;
  const prev = loadRecent().filter(t => t !== term);
  saveRecent([term, ...prev]);
}
function removeRecent(term) {
  saveRecent(loadRecent().filter(t => t !== term));
}

// ─── Category chips ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',           label: 'All' },
  { id: 'people',        label: 'People' },
  { id: 'discussions',   label: 'Discussions' },
  { id: 'updates',       label: 'Updates' },
  { id: 'posts',         label: 'Posts' },
  { id: 'channels',      label: 'Channels' },
  { id: 'announcements', label: 'Announcements' },
];

// ─── Trending seed emojis (fallback when live data loads) ────────────────────
const TREND_EMOJIS = ['🔥', '🎬', '🏸', '💬', '📢', '🎯', '🏅'];

// ─── Small shared sub-components ─────────────────────────────────────────────
function SectionHeader({ title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
        {title}{count != null ? ` · ${count}` : ''}
      </span>
    </div>
  );
}

function GlassCard({ children, onClick, style: extra = {} }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.17 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', marginBottom: 8,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        cursor: onClick ? 'pointer' : 'default',
        ...extra,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SearchOverlay({ onClose, posts, onJumpToChannel }) {
  const [query, setQuery]                   = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState(loadRecent);
  const [trendDiscussions, setTrendDiscussions] = useState([]);
  const [trendResidents, setTrendResidents]     = useState([]);
  const [trendPosts, setTrendPosts]             = useState([]);
  const [trendUpdates, setTrendUpdates]         = useState([]);
  const [results, setResults]               = useState(null); // null = idle
  const [searching, setSearching]           = useState(false);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  // Auto-focus on open
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  // Preload trending / popular data from Community tables only
  useEffect(() => {
    // Trending discussions
    supabase.from('discussions')
      .select('id,title,community_channel,last_activity_at')
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setTrendDiscussions(data); });

    // Recently active residents (unique authors from recent posts)
    supabase.from('community_posts')
      .select('profiles:author_id(id,full_name,username,avatar_url,is_verified,trust_score)')
      .eq('is_anonymous', false)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (!data) return;
        const seen = new Set();
        const uniq = [];
        for (const row of data) {
          if (row.profiles && !seen.has(row.profiles.id)) {
            seen.add(row.profiles.id);
            uniq.push(row.profiles);
            if (uniq.length >= 5) break;
          }
        }
        setTrendResidents(uniq);
      });

    // Popular community posts (most liked, non-announcement)
    supabase.from('community_posts')
      .select('id,title,body,like_count,comment_count,created_at')
      .neq('post_type', 'announcement')
      .eq('is_removed', false)
      .order('like_count', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data) setTrendPosts(data); });

    // Recent neighbourhood updates
    supabase.from('community_posts')
      .select('id,title,nu_category,helpful_count,created_at')
      .not('nu_category', 'is', null)
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data) setTrendUpdates(data); });
  }, []);

  // Debounced live search — Community tables only
  const runSearch = useCallback(async (term) => {
    const trimmed = term.trim();
    if (!trimmed) { setResults(null); return; }
    setSearching(true);
    try {
      const safe = trimmed.replace(/[%_\\]/g, '\\$&');

      const [postsRes, discRes, residentsRes, updatesRes, announcementsRes] = await Promise.all([
        // Community posts (non-announcement, non-update)
        supabase.from('community_posts')
          .select('id,title,body,like_count,comment_count,created_at,channel_slug')
          .neq('post_type', 'announcement')
          .is('nu_category', null)
          .eq('is_removed', false)
          .or(`title.ilike.%${safe}%,body.ilike.%${safe}%`)
          .order('like_count', { ascending: false })
          .limit(10),

        // Discussions
        supabase.from('discussions')
          .select('id,title,description,community_channel,category,last_activity_at')
          .eq('status', 'active')
          .or(`title.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`)
          .order('last_activity_at', { ascending: false })
          .limit(10),

        // Residents
        supabase.from('profiles')
          .select('id,full_name,username,avatar_url,is_verified,trust_score')
          .or(`full_name.ilike.%${safe}%,username.ilike.%${safe}%`)
          .order('trust_score', { ascending: false })
          .limit(10),

        // Neighbourhood updates (have nu_category)
        supabase.from('community_posts')
          .select('id,title,body,nu_category,helpful_count,comment_count,created_at,profiles:author_id(full_name,username)')
          .not('nu_category', 'is', null)
          .eq('is_removed', false)
          .or(`title.ilike.%${safe}%,body.ilike.%${safe}%`)
          .order('helpful_count', { ascending: false })
          .limit(10),

        // Announcements
        supabase.from('community_posts')
          .select('id,title,body,created_at,profiles:author_id(full_name,username)')
          .eq('post_type', 'announcement')
          .eq('is_removed', false)
          .or(`title.ilike.%${safe}%,body.ilike.%${safe}%`)
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      // Channels filtered locally (no extra DB call)
      const q = trimmed.toLowerCase();
      const filteredChannels = CHANNELS.filter(c =>
        c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      );

      setResults({
        posts:         postsRes.data         || [],
        discussions:   discRes.data          || [],
        channels:      filteredChannels,
        residents:     residentsRes.data     || [],
        updates:       updatesRes.data       || [],
        announcements: announcementsRes.data || [],
      });
    } catch (err) {
      console.error('[SearchOverlay] community search error:', err);
      setResults({ posts: [], discussions: [], channels: [], residents: [], updates: [], announcements: [] });
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 280);
  };

  const commitSearch = (term) => {
    const t = (term ?? query).trim();
    if (!t) return;
    addRecent(t);
    setRecentSearches(loadRecent());
    setQuery(t);
    runSearch(t);
  };

  const handleClear = () => {
    clearTimeout(debounceRef.current);
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    clearTimeout(debounceRef.current);
    onClose();
  };

  const q = query.trim();
  const hasResults = results && (
    results.posts.length + results.discussions.length + results.channels.length +
    results.residents.length + results.updates.length + results.announcements.length > 0
  );

  // ── Idle / pre-search screen ─────────────────────────────────────────────
  const IdleScreen = () => (
    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Recent Searches</span>
            <button onClick={() => { saveRecent([]); setRecentSearches([]); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear All
            </button>
          </div>
          <AnimatePresence>
            {recentSearches.map(term => (
              <motion.div key={term} layout exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', marginBottom: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)' }}>
                <button onClick={() => commitSearch(term)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, flex: 1, textAlign: 'left', fontFamily: 'inherit' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  {term}
                </button>
                <button onClick={() => { removeRecent(term); setRecentSearches(loadRecent()); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer', padding: '0 0 0 8px', lineHeight: 1, fontFamily: 'inherit' }}>
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Trending Discussions */}
      {trendDiscussions.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <SectionHeader title="Trending Discussions" />
          {trendDiscussions.map((d, i) => (
            <GlassCard key={d.id}>
              <span style={{ fontSize: 19, flexShrink: 0 }}>{TREND_EMOJIS[i % TREND_EMOJIS.length]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{timeAgo(d.last_activity_at)}</div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', color: '#4ADE80', fontWeight: 700, flexShrink: 0 }}>LIVE</span>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Trending Residents */}
      {trendResidents.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <SectionHeader title="Active Residents" />
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {trendResidents.map(pr => (
              <div key={pr.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 56 }}>
                <Avatar profile={pr} size={46} disablePreview />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pr.full_name?.split(' ')[0] || pr.username}
                </span>
                {pr.is_verified && (
                  <span style={{ fontSize: 9, color: '#A78BFA', fontWeight: 700 }}>✓ Verified</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Community Posts */}
      {trendPosts.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <SectionHeader title="Popular Posts" />
          {trendPosts.map(post => (
            <GlassCard key={post.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{post.like_count || 0} likes · {post.comment_count || 0} replies</div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Recent Neighbourhood Updates */}
      {trendUpdates.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <SectionHeader title="Neighbourhood Updates" />
          {trendUpdates.map(upd => (
            <GlassCard key={upd.id}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>📢</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{upd.title}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{upd.nu_category} · {timeAgo(upd.created_at)}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ── Results screen ───────────────────────────────────────────────────────
  const ResultsScreen = () => {
    if (!results) return null;

    // Empty state with participation CTAs
    if (!hasResults) {
      return (
        <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', paddingTop: 52 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Couldn't find</div>
          <div style={{ fontSize: 15, color: '#A78BFA', fontWeight: 600, marginBottom: 24 }}>"{q}"</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 260, margin: '0 auto' }}>
            {[
              { label: '+ Create a Discussion' },
              { label: '+ Post a Neighbourhood Update' },
              { label: '💬 Ask the Community' },
            ].map(item => (
              <button key={item.label}
                style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(109,74,255,0.18)', border: '1.5px solid rgba(109,74,255,0.35)', color: '#C4B5FD', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      );
    }

    const show = (cat) => activeCategory === 'all' || activeCategory === cat;

    return (
      <AnimatePresence mode="wait">
        <motion.div key={activeCategory} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.17 }}>

          {/* ── Residents ── */}
          {show('people') && results.residents.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Residents" count={results.residents.length} />
              {results.residents.slice(0, 3).map(pr => (
                <GlassCard key={pr.id}>
                  <Avatar profile={pr} size={38} disablePreview />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{pr.full_name || pr.username}</span>
                      {pr.is_verified && (
                        <span style={{ fontSize: 10, color: '#6D4AFF', fontWeight: 700, background: 'rgba(109,74,255,0.14)', padding: '1px 6px', borderRadius: 20 }}>✓ Verified</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      @{pr.username} · Score {pr.trust_score || 1}
                    </div>
                  </div>
                  <button style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(109,74,255,0.18)', border: '1px solid rgba(109,74,255,0.35)', color: '#A78BFA', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
                    Follow
                  </button>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ── Discussions ── */}
          {show('discussions') && results.discussions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Discussions" count={results.discussions.length} />
              {results.discussions.slice(0, 3).map(d => (
                <GlassCard key={d.id}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(109,74,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💬</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{d.category}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', color: '#4ADE80', fontWeight: 700 }}>LIVE</span>
                    </div>
                  </div>
                  <button style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.13)', border: '1px solid rgba(34,197,94,0.28)', color: '#4ADE80', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
                    Join
                  </button>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ── Neighbourhood Updates ── */}
          {show('updates') && results.updates.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Neighbourhood Updates" count={results.updates.length} />
              {results.updates.slice(0, 3).map(upd => (
                <GlassCard key={upd.id}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>📢</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{upd.title}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {upd.profiles?.full_name || upd.profiles?.username || 'Resident'} · {timeAgo(upd.created_at)}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{upd.comment_count || 0} replies</span>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ── Community Posts ── */}
          {show('posts') && results.posts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Community Posts" count={results.posts.length} />
              {results.posts.slice(0, 3).map(post => (
                <GlassCard key={post.id}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                    {post.body && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                        {post.body}
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.32)', marginTop: 4 }}>{timeAgo(post.created_at)}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ── Channels ── */}
          {show('channels') && results.channels.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Channels" count={results.channels.length} />
              {results.channels.slice(0, 3).map(ch => (
                <GlassCard key={ch.slug} onClick={() => { addRecent(q); onJumpToChannel(ch.slug); handleClose(); }}>
                  <img src={ch.icon} alt="" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>D/{ch.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>{ch.desc}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ── Announcements ── */}
          {show('announcements') && results.announcements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader title="Announcements" count={results.announcements.length} />
              {results.announcements.slice(0, 3).map(ann => (
                <GlassCard key={ann.id}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>📣</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ann.title}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{timeAgo(ann.created_at)}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // ── Root render ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(10,6,28,0.84)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
      }}
    >
      {/* Cancel button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute', top: 16, right: 20,
          background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.16)',
          color: '#fff', borderRadius: 12, padding: '8px 14px',
          fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          zIndex: 1,
        }}
      >Cancel</button>

      {/* Search bar + category chips */}
      <div style={{ padding: '52px 20px 0', flexShrink: 0 }}>
        <motion.div
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, duration: 0.22 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 18, padding: '12px 16px', backdropFilter: 'blur(14px)' }}
        >
          {searching
            ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#A78BFA', borderRadius: '50%', animation: 'communitySearchSpin 0.7s linear infinite', flexShrink: 0 }} />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitSearch(); }}
            placeholder="Search people, discussions, channels…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 16, color: '#fff', fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={handleClear} style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
          )}
        </motion.div>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 7, marginTop: 14, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
                  background: isActive ? '#6D4AFF' : 'rgba(255,255,255,0.08)',
                  border: isActive ? '1.5px solid #6D4AFF' : '1px solid rgba(255,255,255,0.13)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 12.5, fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}
              >{cat.label}</button>
            );
          })}
        </motion.div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 48px', scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          {!q ? <IdleScreen key="idle" /> : <ResultsScreen key="results" />}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes communitySearchSpin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </motion.div>
  );
}
