import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

const CATEGORIES = ['All', 'electronics', 'furniture', 'clothing', 'books', 'vehicles', 'sports', 'appliances', 'other'];

const CONDITION_CONFIG = {
  brand_new: { label: 'Brand New',  color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  like_new:  { label: 'Like New',   color: '#0284C7', bg: 'rgba(2,132,199,0.1)' },
  good:      { label: 'Good',       color: '#6D4AFF', bg: 'rgba(109,74,255,0.1)' },
  fair:      { label: 'Fair',       color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  for_parts: { label: 'For Parts',  color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
};

const CAT_ICONS = {
  electronics: '📱', furniture: '🛋️', clothing: '👕', books: '📚',
  vehicles: '🚗', sports: '⚽', appliances: '🏠', other: '📦',
};

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MarketSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.84)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(18px)' }}>
          <div style={{ height: 200, background: 'rgba(109,74,255,0.06)' }} />
          <div style={{ padding: '16px 18px' }}>
            <div style={{ height: 14, width: '75%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 10 }} />
            <div style={{ height: 11, width: '50%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 16 }} />
            <div style={{ height: 22, width: '35%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 14 }} />
            <div style={{ height: 36, borderRadius: 10, background: 'rgba(109,74,255,0.07)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditListingModal({ listing, onClose, onUpdated }) {
  const [f, setF] = useState({
    title: listing.title,
    description: listing.description || '',
    price: listing.price,
    condition: listing.condition || 'good',
    category: listing.category || 'other',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { width: '100%', padding: '10px 13px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  const submit = async () => {
    if (!f.title || !f.price) { setError('Title and price are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('marketplace_listings').update({
      title: f.title,
      description: f.description || null,
      price: parseFloat(f.price),
      condition: f.condition,
      category: f.category,
      updated_at: new Date().toISOString(),
    }).eq('id', listing.id);
    setLoading(false);
    if (err) { setError(err.message); return; }
    onUpdated();
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,10,40,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
        style={{ width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.97)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 24, padding: 28, boxShadow: '0 32px 80px rgba(109,74,255,0.18)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>✏️ Edit Listing</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>
        {error && <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 9, padding: '9px 14px', marginBottom: 14 }}>{error}</div>}
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TITLE *</label><input value={f.title} onChange={set('title')} style={inputStyle} /></div>
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>DESCRIPTION</label><textarea value={f.description} onChange={set('description')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>PRICE (₹) *</label><input type="number" value={f.price} onChange={set('price')} style={inputStyle} /></div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>CONDITION</label>
            <select value={f.condition} onChange={set('condition')} style={{ ...inputStyle, cursor: 'pointer' }}>
              {Object.entries(CONDITION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>CATEGORY</label>
          <select value={f.category} onChange={set('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 600, border: '1.5px solid rgba(109,74,255,0.18)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ flex: 2, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 700, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ listing, user, isSaved, onSave, onDelete, onEdit, onMarkSold }) {
  const cond = CONDITION_CONFIG[listing.condition] || CONDITION_CONFIG.good;
  const isOwner = user && listing.user_id === user.id;
  const profile = listing.profiles;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.84)',
        border: listing.is_sold ? '1.5px solid rgba(107,114,128,0.2)' : '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20, overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        display: 'flex', flexDirection: 'column',
        opacity: listing.is_sold ? 0.75 : 1,
        transition: 'all 0.28s ease',
      }}
      whileHover={{ y: listing.is_sold ? 0 : -5, boxShadow: listing.is_sold ? '0 4px 20px rgba(109,74,255,0.07)' : '0 18px 48px rgba(109,74,255,0.13)' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: `linear-gradient(135deg, rgba(109,74,255,0.06), rgba(109,74,255,0.02))`, flexShrink: 0 }}>
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, opacity: 0.2 }}>
            {CAT_ICONS[listing.category] || '📦'}
          </div>
        )}
        {listing.is_sold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#DC2626', color: '#fff', fontWeight: 700, fontSize: 16, padding: '8px 22px', borderRadius: 10, transform: 'rotate(-8deg)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>SOLD</div>
          </div>
        )}
        {listing.images?.length > 1 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999, backdropFilter: 'blur(4px)' }}>
            +{listing.images.length - 1} photos
          </div>
        )}
        <button onClick={() => onSave(listing.id)}
          style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer' }}>
          {isSaved ? '🔖' : '🔖'}
        </button>
        <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: cond.color, background: `${cond.color}dd`, backdropFilter: 'blur(6px)', color: '#fff' }}>
          {cond.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 660, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{listing.title}</div>
          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(109,74,255,0.07)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
            {CAT_ICONS[listing.category]} {listing.category}
          </span>
        </div>

        {listing.description && (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {listing.description}
          </div>
        )}

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
          ₹{Number(listing.price).toLocaleString()}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(109,74,255,0.1)', border: '1.5px solid rgba(109,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)', overflow: 'hidden' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(profile?.full_name || profile?.username)}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isOwner ? 'You' : (profile?.full_name || profile?.username || 'Seller')}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(listing.created_at)}</span>
        </div>

        {isOwner ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {!listing.is_sold && (
              <button onClick={() => onMarkSold(listing.id)}
                style={{ flex: 1, background: 'rgba(5,150,105,0.08)', border: '1.5px solid rgba(5,150,105,0.2)', color: '#059669', padding: '8px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', minWidth: 0 }}>
                ✓ Mark Sold
              </button>
            )}
            <button onClick={() => onEdit(listing)}
              style={{ flex: 1, background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.18)', color: 'var(--primary)', padding: '8px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', minWidth: 0 }}>
              ✏️ Edit
            </button>
            <button onClick={() => onDelete(listing.id)}
              style={{ background: 'none', border: '1.5px solid rgba(220,38,38,0.2)', color: '#DC2626', padding: '8px 10px', borderRadius: 9, fontSize: 12, cursor: 'pointer' }}>
              🗑
            </button>
          </div>
        ) : (
          <button
            disabled={listing.is_sold}
            style={{ width: '100%', background: listing.is_sold ? 'rgba(107,114,128,0.1)' : 'var(--primary)', color: listing.is_sold ? '#6B7280' : '#fff', border: 'none', padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: listing.is_sold ? 'not-allowed' : 'pointer', boxShadow: listing.is_sold ? 'none' : '0 4px 14px rgba(109,74,255,0.28)', transition: 'all 0.2s' }}>
            {listing.is_sold ? 'Item Sold' : '💬 Contact Seller'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuySell({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showSold, setShowSold] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [editListing, setEditListing] = useState(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('marketplace_listings')
      .select('*, profiles:user_id(id, full_name, username, avatar_url)')
      .neq('status', 'removed')
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Saved items
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    supabase.from('marketplace_saved').select('listing_id').eq('user_id', user.id)
      .then(({ data }) => setSavedIds(new Set((data || []).map(r => r.listing_id))));
  }, [user]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel('marketplace-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marketplace_listings' }, async (payload) => {
        const { data } = await supabase.from('marketplace_listings').select('*, profiles:user_id(id, full_name, username, avatar_url)').eq('id', payload.new.id).single();
        if (data) setListings(prev => [data, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'marketplace_listings' }, (payload) => {
        setListings(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'marketplace_listings' }, (payload) => {
        setListings(prev => prev.filter(l => l.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleSave = async (listingId) => {
    if (!user) return;
    if (savedIds.has(listingId)) {
      await supabase.from('marketplace_saved').delete().eq('listing_id', listingId).eq('user_id', user.id);
      setSavedIds(prev => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from('marketplace_saved').insert({ listing_id: listingId, user_id: user.id });
      setSavedIds(prev => new Set([...prev, listingId]));
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    await supabase.from('marketplace_listings').update({ status: 'removed' }).eq('id', listingId);
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  const handleMarkSold = async (listingId) => {
    await supabase.from('marketplace_listings').update({ is_sold: true, status: 'sold', updated_at: new Date().toISOString() }).eq('id', listingId);
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, is_sold: true, status: 'sold' } : l));
  };

  const filtered = listings.filter(l => {
    if (!showSold && l.is_sold) return false;
    const catMatch = category === 'All' || l.category === category;
    const searchMatch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || (l.description || '').toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const activeCount = listings.filter(l => !l.is_sold && l.status !== 'removed').length;
  const soldCount = listings.filter(l => l.is_sold).length;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>MARKETPLACE</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
              Buy & Sell <span style={{ color: 'var(--primary)' }}>locally</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', marginBottom: 24 }}>Second-hand goods from your neighbours — no shipping, no hassle</p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { label: 'Active listings', val: activeCount, icon: '🛒' },
                { label: 'Items sold', val: soldCount, icon: '✅' },
                { label: 'Categories', val: CATEGORIES.length - 1, icon: '📦' },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 12, padding: '10px 16px', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', maxWidth: 540, marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
                style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: category === cat ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)', background: category === cat ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)', color: category === cat ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {cat !== 'All' && CAT_ICONS[cat]} {cat === 'All' ? '🛒 All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>
                <input type="checkbox" checked={showSold} onChange={e => setShowSold(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                Show sold
              </label>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> items
          </div>
          <button onClick={() => onNavigate?.('post:marketplace')}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >+ Sell Something</button>
        </div>

        {loading ? (
          <MarketSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No listings found</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              {search || category !== 'All' ? 'Try different filters' : 'Be the first to list something!'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(search || category !== 'All') && (
                <button onClick={() => { setCategory('All'); setSearch(''); }}
                  style={{ background: 'rgba(109,74,255,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(109,74,255,0.2)', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Clear filters
                </button>
              )}
              <button onClick={() => onNavigate?.('post:marketplace')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Sell Something
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {filtered.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  user={user}
                  isSaved={savedIds.has(listing.id)}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onEdit={setEditListing}
                  onMarkSold={handleMarkSold}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editListing && (
          <EditListingModal
            listing={editListing}
            onClose={() => setEditListing(null)}
            onUpdated={fetchListings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
