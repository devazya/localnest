/**
 * Shops.jsx — LocalNest Local Business Directory
 *
 * Features: category filter, search, open-now toggle, verified filter,
 * grid/list toggle, business cards with photos + rating + contact,
 * detail drawer, bookmarks, infinite scroll, skeletons, empty states.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',         label: 'All',         icon: '🏪' },
  { id: 'tiffin',      label: 'Tiffin',       icon: '🍱' },
  { id: 'cafe',        label: 'Cafe',          icon: '☕' },
  { id: 'restaurant',  label: 'Restaurant',    icon: '🍽️' },
  { id: 'grocery',     label: 'Grocery',       icon: '🛒' },
  { id: 'laundry',     label: 'Laundry',       icon: '👕' },
  { id: 'medical',     label: 'Medical',       icon: '🏥' },
  { id: 'pharmacy',    label: 'Pharmacy',      icon: '💊' },
  { id: 'salon',       label: 'Salon',         icon: '💇' },
  { id: 'electronics', label: 'Electronics',   icon: '📱' },
  { id: 'repair',      label: 'Repair',        icon: '🔧' },
  { id: 'printing',    label: 'Printing',      icon: '🖨️' },
  { id: 'stationery',  label: 'Stationery',    icon: '📚' },
  { id: 'services',    label: 'Services',      icon: '⚙️' },
  { id: 'other',       label: 'Other',         icon: '📦' },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { key: 'newest',       label: '🕐 Newest' },
  { key: 'top_rated',    label: '⭐ Top Rated' },
  { key: 'most_reviews', label: '💬 Most Reviews' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 3600)  return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

function Stars({ rating, size = 13 }) {
  return (
    <span style={{ fontSize: size, color: '#F59E0B', letterSpacing: -1 }}>
      {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ShopSkeleton({ grid }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: grid ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 16 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.82)', borderRadius: 18, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.7)' }}>
          {grid && <div style={{ height: 160, background: 'rgba(109,74,255,0.06)' }} />}
          <div style={{ padding: 18 }}>
            <div style={{ width: 140, height: 14, borderRadius: 7, background: 'rgba(109,74,255,0.08)', marginBottom: 8 }} />
            <div style={{ width: 80, height: 10, borderRadius: 5, background: 'rgba(109,74,255,0.05)', marginBottom: 12 }} />
            <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'rgba(109,74,255,0.05)', marginBottom: 6 }} />
            <div style={{ width: '70%', height: 10, borderRadius: 5, background: 'rgba(109,74,255,0.04)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Shop Card (Grid) ─────────────────────────────────────────────────────────
function ShopCard({ shop, onSelect, isSaved, onToggleSave }) {
  const cat = CAT_MAP[shop.category] || CAT_MAP.other;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(109,74,255,0.13)' }}
      style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.75)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', backdropFilter: 'blur(14px)', boxShadow: '0 4px 18px rgba(109,74,255,0.07)', transition: 'box-shadow 0.22s' }}
      onClick={() => onSelect(shop)}
    >
      {/* Photo */}
      <div style={{ height: 164, background: 'linear-gradient(135deg, rgba(109,74,255,0.07), rgba(143,123,255,0.04))', position: 'relative', overflow: 'hidden' }}>
        {shop.images?.[0]
          ? <img src={shop.images[0]} alt={shop.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{cat.icon}</div>
        }
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {shop.is_featured && <span style={{ background: '#F59E0B', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>★ Featured</span>}
          {shop.is_verified && <span style={{ background: '#059669', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>✓ Verified</span>}
        </div>
        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(shop.id); }}
          style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, backdropFilter: 'blur(4px)' }}
        >{isSaved ? '🔖' : '🤍'}</button>
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {/* Category pill */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6D4AFF', background: 'rgba(109,74,255,0.08)', padding: '2px 9px', borderRadius: 999 }}>
            {cat.icon} {cat.label}
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#1A1340', marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{shop.name}</div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Stars rating={shop.rating} />
          <span style={{ fontSize: 12, color: '#6B7280' }}>{shop.rating ? shop.rating.toFixed(1) : '—'} ({shop.review_count || 0})</span>
        </div>

        {shop.address && (
          <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            📍 {shop.address}
          </div>
        )}

        {shop.timings && (
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
            🕐 {shop.timings}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: 'none', borderRadius: 9, padding: '7px 0', fontSize: 12.5, fontWeight: 600, textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}
            >📞 Call</a>
          )}
          <button
            onClick={e => { e.stopPropagation(); onSelect(shop); }}
            style={{ flex: 1, background: '#6D4AFF', color: '#fff', border: 'none', borderRadius: 9, padding: '7px 0', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >View Details</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Shop Row (List view) ─────────────────────────────────────────────────────
function ShopRow({ shop, onSelect, isSaved, onToggleSave }) {
  const cat = CAT_MAP[shop.category] || CAT_MAP.other;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={() => onSelect(shop)}
      style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.75)', borderRadius: 16, padding: '14px 18px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', backdropFilter: 'blur(14px)', transition: 'box-shadow 0.2s' }}
    >
      {/* Thumb */}
      <div style={{ width: 68, height: 68, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'rgba(109,74,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        {shop.images?.[0] ? <img src={shop.images[0]} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : cat.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: '#1A1340', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{shop.name}</div>
          {shop.is_verified && <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>✓</span>}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{cat.icon} {cat.label} {shop.address && `· ${shop.address}`}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stars rating={shop.rating} size={12} />
          <span style={{ fontSize: 11.5, color: '#6B7280' }}>{shop.review_count || 0} reviews</span>
          {shop.timings && <span style={{ fontSize: 11.5, color: '#6B7280' }}>· 🕐 {shop.timings}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={e => { e.stopPropagation(); onToggleSave(shop.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{isSaved ? '🔖' : '🤍'}</button>
        {shop.phone && (
          <a href={`tel:${shop.phone}`} onClick={e => e.stopPropagation()} style={{ background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Call</a>
        )}
      </div>
    </motion.div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function ShopDetail({ shop, onClose, user }) {
  const cat = CAT_MAP[shop.category] || CAT_MAP.other;
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(15,10,40,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: '100%', maxWidth: 480, height: 'calc(100vh - 40px)', background: 'rgba(255,255,255,0.98)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(109,74,255,0.18)' }}
      >
        {/* Gallery */}
        <div style={{ position: 'relative', height: 240, background: 'linear-gradient(135deg, rgba(109,74,255,0.08), rgba(143,123,255,0.04))', flexShrink: 0 }}>
          {shop.images?.length > 0
            ? <img src={shop.images[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>{cat.icon}</div>
          }
          {shop.images?.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {shop.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: 8, height: 8, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          {shop.is_featured && <span style={{ position: 'absolute', top: 14, left: 14, background: '#F59E0B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>★ Featured</span>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6D4AFF', background: 'rgba(109,74,255,0.08)', padding: '2px 9px', borderRadius: 999, display: 'inline-block', marginBottom: 6 }}>{cat.icon} {cat.label}</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#1A1340', marginBottom: 4 }}>{shop.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stars rating={shop.rating} />
                <span style={{ fontSize: 13, color: '#6B7280' }}>{shop.rating ? `${shop.rating.toFixed(1)} · ` : ''}{shop.review_count || 0} reviews</span>
                {shop.is_verified && <span style={{ fontSize: 11, background: '#059669', color: '#fff', padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>✓ Verified</span>}
              </div>
            </div>
          </div>

          {shop.description && (
            <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.65, marginBottom: 20 }}>{shop.description}</p>
          )}

          {/* Info grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {shop.address  && <InfoRow icon="📍" label="Address" value={shop.address} />}
            {shop.phone    && <InfoRow icon="📞" label="Phone" value={shop.phone} href={`tel:${shop.phone}`} />}
            {shop.website  && <InfoRow icon="🌐" label="Website" value={shop.website} href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} />}
            {shop.timings  && <InfoRow icon="🕐" label="Hours" value={shop.timings} />}
            {shop.offers   && <InfoRow icon="🎁" label="Offers" value={shop.offers} />}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} style={{ flex: 1, background: '#6D4AFF', color: '#fff', border: 'none', borderRadius: 11, padding: '12px 0', fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>📞 Call Now</a>
            )}
            {shop.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(shop.address)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: '1.5px solid rgba(109,74,255,0.2)', borderRadius: 11, padding: '12px 0', fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}
              >🗺️ Directions</a>
            )}
          </div>

          <div style={{ marginTop: 16, fontSize: 11.5, color: '#9CA3AF', textAlign: 'right' }}>Listed {timeAgo(shop.created_at)}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ icon, label, value, href }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: '#6D4AFF', fontWeight: 500, textDecoration: 'none' }}>{value}</a>
          : <div style={{ fontSize: 13.5, color: '#1A1340' }}>{value}</div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Shops({ onNavigate }) {
  const [user, setUser] = useState(null);

  const [shops, setShops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage]       = useState(0);

  const [search, setSearch]           = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [category, setCategory]       = useState('all');
  const [sort, setSort]               = useState('newest');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [gridView, setGridView]       = useState(true);

  const [selected, setSelected] = useState(null);
  const [saved, setSaved]       = useState({});

  const loaderRef = useRef(null);
  const searchTimer = useRef(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  // Debounced search
  const handleSearchChange = (v) => {
    setSearchDraft(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v.trim()), 380);
  };

  const buildQuery = useCallback((fromIdx) => {
    let q = supabase.from('shops').select('*');
    if (category !== 'all') q = q.eq('category', category);
    if (onlyVerified)       q = q.eq('is_verified', true);
    if (search)             q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);
    if (sort === 'newest')       q = q.order('created_at', { ascending: false });
    if (sort === 'top_rated')    q = q.order('rating', { ascending: false });
    if (sort === 'most_reviews') q = q.order('review_count', { ascending: false });
    return q.range(fromIdx, fromIdx + PAGE_SIZE - 1);
  }, [category, onlyVerified, search, sort]);

  const fetchShops = useCallback(async (reset = false) => {
    const fromIdx = reset ? 0 : page * PAGE_SIZE;
    if (reset) setLoading(true);
    const { data, error } = await buildQuery(fromIdx);
    if (!error) {
      const incoming = data || [];
      if (reset) { setShops(incoming); setPage(1); }
      else       { setShops(p => [...p, ...incoming]); setPage(p => p + 1); }
      setHasMore(incoming.length === PAGE_SIZE);
    }
    setLoading(false);
    setInitialLoad(false);
  }, [buildQuery, page]);

  useEffect(() => {
    setPage(0); setHasMore(true);
    fetchShops(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, search, onlyVerified]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchShops(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, fetchShops]);

  const toggleSave = (id) => setSaved(p => ({ ...p, [id]: !p[id] }));

  const featuredShops = shops.filter(s => s.is_featured).slice(0, 3);
  const allShops = shops;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #F8F7FF)' }}>

      {/* ── Hero banner ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.07) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#6D4AFF', marginBottom: 6 }}>LOCAL BUSINESS DIRECTORY</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: '#1A1340', letterSpacing: -0.7, marginBottom: 4 }}>
            Shops & <span style={{ color: '#6D4AFF' }}>Services</span>
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Discover trusted local businesses near you</p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input
              value={searchDraft}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search businesses, categories, areas…"
              style={{ width: '100%', padding: '12px 42px 12px 44px', background: 'rgba(255,255,255,0.95)', border: '1.5px solid rgba(109,74,255,0.14)', borderRadius: 12, fontSize: 14, color: '#1A1340', outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 12px rgba(109,74,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.14)'}
            />
            {searchDraft && <button onClick={() => { setSearchDraft(''); setSearch(''); }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9CA3AF' }}>×</button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* ── Category scroll ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                border: category === cat.id ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                background: category === cat.id ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.8)',
                color: category === cat.id ? '#6D4AFF' : '#6B7280',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >{cat.icon} {cat.label}</button>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid rgba(109,74,255,0.14)', background: 'rgba(255,255,255,0.9)', fontSize: 13, color: '#1A1340', outline: 'none', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>

          {/* Verified toggle */}
          <button
            onClick={() => setOnlyVerified(v => !v)}
            style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, border: onlyVerified ? '1.5px solid rgba(5,150,105,0.4)' : '1.5px solid rgba(109,74,255,0.14)', background: onlyVerified ? 'rgba(5,150,105,0.08)' : 'rgba(255,255,255,0.9)', color: onlyVerified ? '#059669' : '#6B7280', cursor: 'pointer', transition: 'all 0.18s' }}
          >✓ Verified Only</button>

          {/* Grid/List toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', background: 'rgba(109,74,255,0.06)', borderRadius: 9, padding: 3, gap: 2 }}>
            {[['grid','⊞'],['list','≡']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setGridView(mode === 'grid')} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: (gridView ? 'grid' : 'list') === mode ? '#fff' : 'none', color: '#6D4AFF', cursor: 'pointer', fontSize: 15, boxShadow: (gridView ? 'grid' : 'list') === mode ? '0 1px 4px rgba(109,74,255,0.12)' : 'none', transition: 'all 0.18s' }}>{icon}</button>
            ))}
          </div>

          {/* Results count */}
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>{shops.length} {shops.length === 1 ? 'result' : 'results'}</div>
        </div>

        {/* ── Featured strip ── */}
        {!search && category === 'all' && featuredShops.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#F59E0B', marginBottom: 14 }}>★ Featured Businesses</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {featuredShops.map(shop => (
                <ShopCard key={shop.id} shop={shop} onSelect={setSelected} isSaved={!!saved[shop.id]} onToggleSave={toggleSave} />
              ))}
            </div>
            <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(109,74,255,0.1), transparent)', margin: '28px 0' }} />
          </div>
        )}

        {/* ── Main grid/list ── */}
        {initialLoad || (loading && shops.length === 0) ? (
          <ShopSkeleton grid={gridView} />
        ) : shops.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.78)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>{category !== 'all' ? (CAT_MAP[category]?.icon || '🏪') : '🔍'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#1A1340', marginBottom: 8 }}>
              {search ? 'No businesses found' : `No ${category !== 'all' ? CAT_MAP[category]?.label : ''} listings yet`}
            </div>
            <div style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 20 }}>
              {search ? 'Try different keywords or remove filters' : 'Be the first to list your business!'}
            </div>
            <button onClick={() => onNavigate('post')} style={{ background: '#6D4AFF', color: '#fff', border: 'none', padding: '11px 26px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.28)' }}>🏪 List Your Business</button>
          </motion.div>
        ) : (
          <div style={gridView
            ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }
            : { display: 'flex', flexDirection: 'column', gap: 12 }
          }>
            {allShops.map(shop => gridView
              ? <ShopCard key={shop.id} shop={shop} onSelect={setSelected} isSaved={!!saved[shop.id]} onToggleSave={toggleSave} />
              : <ShopRow  key={shop.id} shop={shop} onSelect={setSelected} isSaved={!!saved[shop.id]} onToggleSave={toggleSave} />
            )}
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
          {loading && shops.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6D4AFF' }} />
              ))}
            </div>
          )}
          {!hasMore && shops.length > 0 && !loading && <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>All businesses loaded ✓</div>}
        </div>

        {/* Add CTA */}
        <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
          <button
            onClick={() => onNavigate('post')}
            style={{ background: 'rgba(109,74,255,0.08)', color: '#6D4AFF', border: '1.5px solid rgba(109,74,255,0.2)', padding: '11px 24px', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >🏪 List Your Business</button>
        </div>
      </div>

      {/* ── Detail drawer ── */}
      <AnimatePresence>
        {selected && <ShopDetail shop={selected} onClose={() => setSelected(null)} user={user} />}
      </AnimatePresence>
    </div>
  );
}
