import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function PgSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
          <div style={{ height: 200, background: 'rgba(109,74,255,0.06)' }} />
          <div style={{ padding: '16px 18px 18px' }}>
            <div style={{ height: 16, width: '70%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 8 }} />
            <div style={{ height: 11, width: '55%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[1, 2, 3].map(j => <div key={j} style={{ height: 20, width: 60, borderRadius: 6, background: 'rgba(109,74,255,0.05)' }} />)}
            </div>
            <div style={{ height: 36, borderRadius: 10, background: 'rgba(109,74,255,0.07)', marginTop: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const FILTER_DEFAULTS = {
  gender: 'All', food: 'All', occupancy: 'All',
  ac: 'All', verified: false, availability: 'All',
};

/* ── Filter Pill ── */
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 999,
        border: active ? '1.5px solid var(--primary)' : '1.5px solid rgba(109,74,255,0.15)',
        background: active ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        fontSize: 12.5, fontWeight: active ? 600 : 500,
        cursor: 'pointer', transition: 'all 0.18s',
        backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
      }}
    >{label}</button>
  );
}

/* ── Filter Panel — defined OUTSIDE main component so it never remounts ── */
function FilterPanel({ filters, setFilter, setFilters }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Gender</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Male', 'Female', 'Unisex'].map(g => (
            <FilterPill key={g} label={g} active={filters.gender === g} onClick={() => setFilter('gender', g)} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Food</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Included', 'Not Included'].map(f => (
            <FilterPill key={f} label={f} active={filters.food === f} onClick={() => setFilter('food', f)} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Room Type</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Single', 'Double', 'Triple'].map(o => (
            <FilterPill key={o} label={o} active={filters.occupancy === o} onClick={() => setFilter('occupancy', o)} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>AC</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'AC', 'Non AC'].map(a => (
            <FilterPill key={a} label={a} active={filters.ac === a} onClick={() => setFilter('ac', a)} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Availability</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Available Now', 'Available Next Month'].map(av => (
            <FilterPill key={av} label={av} active={filters.availability === av} onClick={() => setFilter('availability', av)} />
          ))}
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div
          onClick={() => setFilter('verified', !filters.verified)}
          style={{
            width: 40, height: 22, borderRadius: 11,
            background: filters.verified ? 'var(--primary)' : 'rgba(109,74,255,0.12)',
            border: filters.verified ? 'none' : '1.5px solid rgba(109,74,255,0.2)',
            position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
          }}
        >
          <div style={{
            position: 'absolute', top: filters.verified ? 2 : 1, left: filters.verified ? 20 : 1,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'all 0.2s',
          }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Verified Only</span>
      </label>
      <button
        onClick={() => setFilters(FILTER_DEFAULTS)}
        style={{ background: 'none', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 9, padding: '8px 0', fontSize: 13, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,74,255,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >Reset Filters</button>
    </div>
  );
}

/* ── PG Card ── */
function PgCard({ pg, onViewDetails, isSaved, onToggleSave, user }) {
  const amenities = Array.isArray(pg.amenities) ? pg.amenities : [];
  const images    = Array.isArray(pg.images) ? pg.images : (pg.image ? [pg.image] : []);
  const coverImg  = images[0] || null;
  const isOwner   = user && pg.user_id === user.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(109,74,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(109,74,255,0.22)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,74,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; }}
    >
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        {coverImg ? (
          <img src={coverImg} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, opacity: 0.2, background: 'rgba(109,74,255,0.04)' }}>🏠</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {pg.is_verified  && <span className="badge badge-blue">✓ Verified</span>}
          {pg.is_sponsored && <span className="badge badge-amber">⭐ Sponsored</span>}
          {pg.is_featured  && <span className="badge badge-purple">🔥 Featured</span>}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${pg.vacancy ? 'badge-green' : 'badge-red'}`}>{pg.vacancy ? '✓ Available' : 'Full'}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>₹{Number(pg.rent).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>/month</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(pg.id); }}
          style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(109,74,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer' }}>
          {isSaved ? '🔖' : '♡'}
        </button>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{pg.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {pg.location || pg.locality || '—'}
            {pg.distance_km && <> · <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{pg.distance_km} km away</span></>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, marginTop: 10 }}>
          {[
            pg.gender_preference,
            pg.occupancy_type,
            pg.furnishing,
            pg.has_ac ? 'AC' : 'Non-AC',
            pg.food_included ? 'Food Included' : 'No Food',
          ].filter(Boolean).map(m => (
            <span key={m} style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 6, padding: '2px 9px', fontSize: 11.5, color: 'var(--text-secondary)' }}>{m}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          {amenities.slice(0, 4).map(a => (
            <span key={a} style={{ background: 'rgba(109,74,255,0.05)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 5, padding: '2px 8px', fontSize: 11, color: 'var(--primary)' }}>{a}</span>
          ))}
          {amenities.length > 4 && <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 4px' }}>+{amenities.length - 4} more</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {pg.rating ? (
              <><span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {Number(pg.rating).toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)' }}>({pg.review_count || 0} reviews)</span></>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No reviews yet</span>
            )}
          </div>
          {pg.deposit && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deposit: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹{Number(pg.deposit).toLocaleString()}</span></div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onViewDetails(pg.id)}
            style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(109,74,255,0.28)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5B38E8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = ''; }}
          >View Details</button>
          {pg.owner_phone && (
            <button
              onClick={e => { e.stopPropagation(); window.open(`tel:${pg.owner_phone}`); }}
              style={{ background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.14)', color: 'var(--text-secondary)', padding: '9px 13px', borderRadius: 10, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,74,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(109,74,255,0.07)'}
            >📞</button>
          )}
          <button
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.18)', color: '#059669', padding: '9px 13px', borderRadius: 10, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
          >💬</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function PgListings({ onNavigate, user }) {
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState(FILTER_DEFAULTS);
  const [search, setSearch]       = useState('');
  const [savedIds, setSavedIds]   = useState(new Set());
  const [authUser, setAuthUser]   = useState(user || null);

  // Keep authUser in sync if prop changes
  useEffect(() => { setAuthUser(user || null); }, [user]);

  // Also subscribe to auth changes for standalone usage
  useEffect(() => {
    if (user) return; // already provided by parent
    supabase.auth.getUser().then(({ data }) => setAuthUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setAuthUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, [user]);

  // Fetch PG listings from Supabase
  const fetchListings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pg_listings')
      .select(`
        *,
        profiles:user_id (id, full_name, username, avatar_url)
      `)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error) setListings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Saved (favourited) PGs
  useEffect(() => {
    if (!authUser) { setSavedIds(new Set()); return; }
    supabase
      .from('pg_saved')
      .select('listing_id')
      .eq('user_id', authUser.id)
      .then(({ data }) => setSavedIds(new Set((data || []).map(r => r.listing_id))));
  }, [authUser]);

  // Realtime — new listing added by someone else appears immediately
  useEffect(() => {
    const channel = supabase
      .channel('pg-listings-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pg_listings' }, async (payload) => {
        const { data } = await supabase
          .from('pg_listings')
          .select('*, profiles:user_id (id, full_name, username, avatar_url)')
          .eq('id', payload.new.id)
          .single();
        if (data && data.status === 'active') setListings(prev => [data, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pg_listings' }, (payload) => {
        setListings(prev =>
          payload.new.status !== 'active'
            ? prev.filter(l => l.id !== payload.new.id)
            : prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l)
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pg_listings' }, (payload) => {
        setListings(prev => prev.filter(l => l.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleToggleSave = async (listingId) => {
    if (!authUser) return;
    if (savedIds.has(listingId)) {
      await supabase.from('pg_saved').delete().eq('listing_id', listingId).eq('user_id', authUser.id);
      setSavedIds(prev => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from('pg_saved').insert({ listing_id: listingId, user_id: authUser.id });
      setSavedIds(prev => new Set([...prev, listingId]));
    }
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  // Filter logic — maps Supabase column names to the same UI filter keys
  const filtered = listings.filter(pg => {
    if (filters.gender !== 'All' && pg.gender_preference !== filters.gender) return false;
    if (filters.food === 'Included' && !pg.food_included) return false;
    if (filters.food === 'Not Included' && pg.food_included) return false;
    if (filters.occupancy !== 'All' && pg.occupancy_type !== filters.occupancy) return false;
    if (filters.ac === 'AC' && !pg.has_ac) return false;
    if (filters.ac === 'Non AC' && pg.has_ac) return false;
    if (filters.verified && !pg.is_verified) return false;
    if (filters.availability === 'Available Now' && !pg.vacancy) return false;
    if (search) {
      const q = search.toLowerCase();
      const inName     = (pg.name || '').toLowerCase().includes(q);
      const inLocation = (pg.location || pg.locality || '').toLowerCase().includes(q);
      if (!inName && !inLocation) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.04) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>ACCOMMODATION</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
            Find Your <span style={{ color: 'var(--primary)' }}>PG in Bangalore</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            {loading ? 'Loading PGs…' : `${filtered.length} verified PG${filtered.length !== 1 ? 's' : ''} near Spice Garden & surrounding localities`}
          </p>

          <div style={{ position: 'relative', maxWidth: 500 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.45 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by PG name or locality…"
              style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(109,74,255,0.14)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(109,74,255,0.06)', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(109,74,255,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(109,74,255,0.14)'}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }} className="pg-layout">
        <aside style={{ background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: '22px 20px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.06)', position: 'sticky', top: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚙️</span> Filters
          </div>
          <FilterPanel filters={filters} setFilter={setFilter} setFilters={setFilters} />
        </aside>

        <div>
          {loading ? (
            <PgSkeleton />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {listings.length === 0 ? 'No PGs listed yet' : 'No PGs match your filters'}
              </div>
              <div style={{ fontSize: 14, marginBottom: 20 }}>
                {listings.length === 0
                  ? 'Be the first to list a PG in this area!'
                  : 'Try adjusting or resetting your filters.'}
              </div>
              {listings.length === 0 ? (
                <button
                  onClick={() => onNavigate?.('post:pg')}
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >+ List a PG</button>
              ) : (
                <button
                  onClick={() => setFilters(FILTER_DEFAULTS)}
                  style={{ background: 'rgba(109,74,255,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(109,74,255,0.2)', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >Reset Filters</button>
              )}
            </div>
          ) : (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
              <AnimatePresence>
                {filtered.map(pg => (
                  <PgCard
                    key={pg.id}
                    pg={pg}
                    user={authUser}
                    isSaved={savedIds.has(pg.id)}
                    onToggleSave={handleToggleSave}
                    onViewDetails={() => onNavigate?.('pgdetails')}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pg-layout { grid-template-columns: 1fr !important; }
          aside { position: static !important; display: none; }
        }
        @media (max-width: 480px) {
          .pg-layout { padding: 16px !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
