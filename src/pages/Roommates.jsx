import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

const LOOKING_FOR_OPTIONS = ['All', 'room', 'roommate', 'flatmate'];

const LOOKING_LABELS = {
  room:      'Looking for Room',
  roommate:  'Looking for Roommate',
  flatmate:  'Looking for Flatmate',
};

const LOOKING_CONFIG = {
  room:     { color: '#0284C7', bg: 'rgba(2,132,199,0.08)',  icon: '🏠' },
  roommate: { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', icon: '🤝' },
  flatmate: { color: '#059669', bg: 'rgba(5,150,105,0.08)',  icon: '🏘️' },
};

const BADGE_CONFIG = {
  'Non Smoker':   { color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: '🚭' },
  'Pet Friendly': { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   icon: '🐾' },
  'Early Riser':  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: '🌅' },
  'Night Owl':    { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '🦉' },
};

function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function RoommateSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 22 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.84)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(18px)' }}>
          <div style={{ height: 140, background: 'rgba(109,74,255,0.06)' }} />
          <div style={{ padding: '38px 18px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: 16, width: '60%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 8 }} />
            <div style={{ height: 11, width: '80%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 16 }} />
            <div style={{ height: 11, width: '70%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 120, height: 36, borderRadius: 10, background: 'rgba(109,74,255,0.07)' }} />
              <div style={{ width: 40, height: 36, borderRadius: 10, background: 'rgba(109,74,255,0.07)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditRoommateModal({ listing, onClose, onUpdated }) {
  const [f, setF] = useState({
    budget: listing.budget || '',
    move_in_date: listing.move_in_date || '',
    occupation: listing.occupation || '',
    lifestyle: listing.lifestyle || '',
    gender_preference: listing.gender_preference || 'any',
    preferred_location: listing.preferred_location || '',
    description: listing.description || '',
    looking_for: listing.looking_for || 'room',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { width: '100%', padding: '10px 13px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  const submit = async () => {
    if (!f.budget) { setError('Budget is required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('roommate_listings').update({
      budget: parseInt(f.budget),
      move_in_date: f.move_in_date || null,
      occupation: f.occupation || null,
      lifestyle: f.lifestyle || null,
      gender_preference: f.gender_preference,
      preferred_location: f.preferred_location || null,
      description: f.description || null,
      looking_for: f.looking_for,
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
        style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,0.97)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 24, padding: 28, boxShadow: '0 32px 80px rgba(109,74,255,0.18)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>✏️ Edit Request</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>
        {error && <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 9, padding: '9px 14px', marginBottom: 14 }}>{error}</div>}
        <div style={{ marginBottom: 13 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>LOOKING FOR</label>
          <select value={f.looking_for} onChange={set('looking_for')} style={{ ...inputStyle, cursor: 'pointer' }}>
            {Object.entries(LOOKING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>BUDGET (₹/mo) *</label><input type="number" value={f.budget} onChange={set('budget')} style={inputStyle} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>MOVE-IN DATE</label><input type="date" value={f.move_in_date} onChange={set('move_in_date')} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>OCCUPATION</label><input value={f.occupation} onChange={set('occupation')} style={inputStyle} /></div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>GENDER PREF</label>
            <select value={f.gender_preference} onChange={set('gender_preference')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>PREFERRED LOCATION</label><input value={f.preferred_location} onChange={set('preferred_location')} style={inputStyle} /></div>
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>LIFESTYLE</label><input value={f.lifestyle} onChange={set('lifestyle')} placeholder="Non-smoker, Early riser…" style={inputStyle} /></div>
        <div style={{ marginBottom: 18 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>ABOUT YOU</label><textarea value={f.description} onChange={set('description')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 600, border: '1.5px solid rgba(109,74,255,0.18)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ flex: 2, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 700, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ listing, user, isConnected, onConnect, onDelete, onEdit }) {
  const lookCfg = LOOKING_CONFIG[listing.looking_for] || LOOKING_CONFIG.room;
  const profile = listing.profiles;
  const isOwner = user && listing.user_id === user.id;
  const displayName = profile?.full_name || profile?.username || 'Resident';
  const avatarText = initials(displayName);

  const lifestyleBadges = listing.lifestyle
    ? listing.lifestyle.split(',').map(b => b.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.84)',
        border: isConnected ? '1.5px solid rgba(109,74,255,0.3)' : '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20, overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: isConnected ? '0 6px 28px rgba(109,74,255,0.13)' : '0 4px 20px rgba(109,74,255,0.07)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.28s ease',
      }}
      whileHover={{ y: -6, boxShadow: '0 20px 52px rgba(109,74,255,0.14)' }}
    >
      {/* Top area */}
      <div style={{ position: 'relative', height: 140, background: 'linear-gradient(135deg, rgba(109,74,255,0.1), rgba(143,123,255,0.06))', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(109,74,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999, color: lookCfg.color, background: `${lookCfg.color}22`, backdropFilter: 'blur(8px)', border: `1px solid ${lookCfg.color}33`, display: 'flex', alignItems: 'center', gap: 4 }}>
          {lookCfg.icon} {LOOKING_LABELS[listing.looking_for] || listing.looking_for}
        </div>
        {isOwner && (
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 5 }}>
            <button onClick={() => onEdit(listing)}
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>✏️</button>
            <button onClick={() => onDelete(listing.id)}
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer' }}>🗑</button>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(109,74,255,0.15), rgba(143,123,255,0.08))', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--primary)', boxShadow: '0 4px 16px rgba(109,74,255,0.2)', overflow: 'hidden' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : avatarText}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '38px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, textAlign: 'center' }}>
          {isOwner ? 'You' : displayName}
        </div>
        {listing.occupation && (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>{listing.occupation}</div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span>💰</span> ₹{Number(listing.budget).toLocaleString()}/mo
          </span>
          {listing.move_in_date && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span>📅</span> {new Date(listing.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {listing.preferred_location && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 3, textAlign: 'center' }}>
            <span>📍</span>{listing.preferred_location}
          </div>
        )}

        {listing.description && (
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12, textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%' }}>
            {listing.description}
          </div>
        )}

        {lifestyleBadges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
            {lifestyleBadges.map(badge => {
              const cfg = BADGE_CONFIG[badge] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '•' };
              return (
                <span key={badge} style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
                  {cfg.icon} {badge}
                </span>
              );
            })}
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
          {listing.gender_preference !== 'any' && `👤 Prefers ${listing.gender_preference} · `}
          {timeAgo(listing.created_at)}
        </div>

        {!isOwner && (
          <button onClick={() => onConnect(listing.id)}
            style={{ width: '100%', background: isConnected ? 'rgba(5,150,105,0.1)' : 'var(--primary)', color: isConnected ? '#059669' : '#fff', border: isConnected ? '1.5px solid rgba(5,150,105,0.3)' : 'none', padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: isConnected ? 'none' : '0 4px 14px rgba(109,74,255,0.28)' }}
            onMouseEnter={e => { if (!isConnected) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(109,74,255,0.38)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isConnected ? 'none' : '0 4px 14px rgba(109,74,255,0.28)'; }}
          >{isConnected ? '✓ Connected' : '🤝 Connect'}</button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Roommates({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookingFor, setLookingFor] = useState('All');
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [connectedIds, setConnectedIds] = useState(new Set());
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
      .from('roommate_listings')
      .select('*, profiles:user_id(id, full_name, username, avatar_url, occupation)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Connections
  useEffect(() => {
    if (!user) { setConnectedIds(new Set()); return; }
    supabase.from('roommate_connections').select('listing_id').eq('from_user', user.id)
      .then(({ data }) => setConnectedIds(new Set((data || []).map(r => r.listing_id))));
  }, [user]);

  const handleConnect = async (listingId) => {
    if (!user) return;
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    if (connectedIds.has(listingId)) {
      await supabase.from('roommate_connections').delete().eq('listing_id', listingId).eq('from_user', user.id);
      setConnectedIds(prev => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from('roommate_connections').insert({ listing_id: listingId, from_user: user.id, to_user: listing.user_id });
      setConnectedIds(prev => new Set([...prev, listingId]));
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;
    await supabase.from('roommate_listings').update({ status: 'inactive' }).eq('id', listingId);
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  const filtered = listings.filter(l => {
    const lookMatch = lookingFor === 'All' || l.looking_for === lookingFor;
    const searchMatch = !search
      || (l.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase())
      || (l.occupation || '').toLowerCase().includes(search.toLowerCase())
      || (l.preferred_location || '').toLowerCase().includes(search.toLowerCase());
    const genderMatch = genderFilter === 'All' || l.gender_preference === genderFilter.toLowerCase();
    return lookMatch && searchMatch && genderMatch;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>ROOMMATE FINDER</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
              Find your perfect <span style={{ color: 'var(--primary)' }}>flatmate</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', marginBottom: 26 }}>Real people from your locality — connect before you commit</p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { label: 'Active profiles', val: listings.length, icon: '👥' },
                { label: 'Looking for room', val: listings.filter(l => l.looking_for === 'room').length, icon: '🏠' },
                { label: 'Have room/flat', val: listings.filter(l => l.looking_for === 'roommate' || l.looking_for === 'flatmate').length, icon: '🏘️' },
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, occupation, or location…"
                style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LOOKING_FOR_OPTIONS.map(opt => {
                  const cfg = LOOKING_CONFIG[opt];
                  return (
                    <button key={opt} onClick={() => setLookingFor(opt)}
                      style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: lookingFor === opt ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)', background: lookingFor === opt ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)', color: lookingFor === opt ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {cfg ? cfg.icon + ' ' : ''}{opt === 'All' ? 'All' : LOOKING_LABELS[opt]}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                {['All', 'Male', 'Female'].map(g => (
                  <button key={g} onClick={() => setGenderFilter(g)}
                    style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: genderFilter === g ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)', background: genderFilter === g ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)', color: genderFilter === g ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.18s' }}>
                    {g === 'Male' ? '👨 ' : g === 'Female' ? '👩 ' : ''}{g}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> people found
          </div>
          <button onClick={() => onNavigate?.('post:roommate')}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >+ Create Profile</button>
        </div>

        {loading ? (
          <RoommateSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No profiles found</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              {search || lookingFor !== 'All' || genderFilter !== 'All' ? 'Try adjusting your filters' : 'Be the first to post a roommate request!'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(search || lookingFor !== 'All' || genderFilter !== 'All') && (
                <button onClick={() => { setLookingFor('All'); setSearch(''); setGenderFilter('All'); }}
                  style={{ background: 'rgba(109,74,255,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(109,74,255,0.2)', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Clear all filters
                </button>
              )}
              <button onClick={() => onNavigate?.('post:roommate')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Post Request
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 22 }}>
            <AnimatePresence>
              {filtered.map(listing => (
                <ProfileCard
                  key={listing.id}
                  listing={listing}
                  user={user}
                  isConnected={connectedIds.has(listing.id)}
                  onConnect={handleConnect}
                  onDelete={handleDelete}
                  onEdit={setEditListing}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editListing && (
          <EditRoommateModal
            listing={editListing}
            onClose={() => setEditListing(null)}
            onUpdated={fetchListings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
