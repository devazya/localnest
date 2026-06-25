import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

/* ── Dummy PG Data ── */
const PG_LISTINGS = [
  {
    id: 'pg-001',
    name: 'Sunrise Boys PG',
    location: 'Spice Garden, Bommanahalli',
    distance: '0.3 km from you',
    rent: 8500,
    deposit: 17000,
    rating: 4.6,
    reviews: 38,
    gender: 'Male',
    occupancy: 'Double',
    furnishing: 'Fully Furnished',
    ac: true,
    food: true,
    verified: true,
    featured: true,
    sponsored: false,
    vacancy: true,
    amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Power Backup', 'RO Water'],
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
    description: 'Spacious double-sharing rooms in the heart of Spice Garden. Walking distance from Tech Parks. Freshly cooked South Indian food twice a day. High-speed 100Mbps WiFi included.',
    owner: { name: 'Ramesh Kumar', phone: '+91 98450 12345', avatar: 'RK', responseRate: '95%' },
    availableFrom: 'Immediately',
  },
  {
    id: 'pg-002',
    name: 'Green Valley Girls PG',
    location: 'HSR Layout, Sector 2',
    distance: '1.2 km from you',
    rent: 11000,
    deposit: 22000,
    rating: 4.8,
    reviews: 62,
    gender: 'Female',
    occupancy: 'Single',
    furnishing: 'Fully Furnished',
    ac: true,
    food: true,
    verified: true,
    featured: false,
    sponsored: true,
    vacancy: true,
    amenities: ['WiFi', 'AC', 'Food', 'CCTV', 'Gym', 'Housekeeping', 'RO Water', 'Parking'],
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    description: 'Premium single-occupancy rooms exclusively for working women. 24/7 CCTV surveillance, biometric entry, and dedicated study lounge. Homely vibe with professional security.',
    owner: { name: 'Sunita Rao', phone: '+91 99001 87654', avatar: 'SR', responseRate: '99%' },
    availableFrom: 'Immediately',
  },
  {
    id: 'pg-003',
    name: 'Urban Nest Co-living',
    location: 'Koramangala, 5th Block',
    distance: '2.8 km from you',
    rent: 14500,
    deposit: 29000,
    rating: 4.4,
    reviews: 24,
    gender: 'Unisex',
    occupancy: 'Single',
    furnishing: 'Fully Furnished',
    ac: true,
    food: false,
    verified: true,
    featured: false,
    sponsored: false,
    vacancy: false,
    amenities: ['WiFi', 'AC', 'Rooftop', 'Bike Parking', 'Power Backup', 'Community Hall'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    description: 'Modern co-living space designed for young professionals. Rooftop terrace, weekly community events, and a curated network of like-minded residents. Currently at full capacity — join the waitlist.',
    owner: { name: 'Aditya Menon', phone: '+91 97400 55123', avatar: 'AM', responseRate: '88%' },
    availableFrom: 'Next Month',
  },
];

const FILTER_DEFAULTS = {
  gender: 'All',
  food: 'All',
  occupancy: 'All',
  ac: 'All',
  verified: false,
  availability: 'All',
};

/* ── Filter Pill ── */
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 999,
        border: active ? '1.5px solid var(--primary)' : '1.5px solid rgba(109,74,255,0.15)',
        background: active ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 0.18s',
        backdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

/* ── PG Card ── */
function PgCard({ pg, onViewDetails }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'rgba(255,255,255,0.88)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 48px rgba(109,74,255,0.15)';
        e.currentTarget.style.borderColor = 'rgba(109,74,255,0.22)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,74,255,0.07)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
      }}
    >
      {/* Image */}
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        <img
          src={pg.image}
          alt={pg.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)' }} />

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {pg.verified && (
            <span className="badge badge-blue">✓ Verified</span>
          )}
          {pg.sponsored && (
            <span className="badge badge-amber">⭐ Sponsored</span>
          )}
          {pg.featured && (
            <span className="badge badge-purple">🔥 Featured</span>
          )}
        </div>

        {/* Vacancy top-right */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${pg.vacancy ? 'badge-green' : 'badge-red'}`}>
            {pg.vacancy ? '✓ Available' : 'Full'}
          </span>
        </div>

        {/* Rent bottom-left over image */}
        <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            ₹{pg.rent.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>/month</div>
        </div>

        {/* Save heart */}
        <button style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(109,74,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer' }}>♡</button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{pg.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {pg.location} · <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{pg.distance}</span>
          </div>
        </div>

        {/* Meta pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, marginTop: 10 }}>
          {[pg.gender, pg.occupancy, pg.furnishing, pg.ac ? 'AC' : 'Non-AC', pg.food ? 'Food Included' : 'No Food'].map(m => (
            <span key={m} style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 6, padding: '2px 9px', fontSize: 11.5, color: 'var(--text-secondary)' }}>{m}</span>
          ))}
        </div>

        {/* Amenities */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          {pg.amenities.slice(0, 4).map(a => (
            <span key={a} style={{ background: 'rgba(109,74,255,0.05)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 5, padding: '2px 8px', fontSize: 11, color: 'var(--primary)' }}>{a}</span>
          ))}
          {pg.amenities.length > 4 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 4px' }}>+{pg.amenities.length - 4} more</span>
          )}
        </div>

        {/* Rating + deposit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {pg.rating}</span>
            <span style={{ color: 'var(--text-muted)' }}>({pg.reviews} reviews)</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Deposit: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹{pg.deposit.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onViewDetails(pg.id)}
            style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(109,74,255,0.28)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5B38E8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = ''; }}
          >
            View Details
          </button>
          <button style={{ background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.14)', color: 'var(--text-secondary)', padding: '9px 13px', borderRadius: 10, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.07)'; }}
          >📞</button>
          <button style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.18)', color: '#059669', padding: '9px 13px', borderRadius: 10, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
          >💬</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function PgListings({ onNavigate }) {
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [search, setSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const filtered = PG_LISTINGS.filter(pg => {
    if (filters.gender !== 'All' && pg.gender !== filters.gender) return false;
    if (filters.food === 'Included' && !pg.food) return false;
    if (filters.food === 'Not Included' && pg.food) return false;
    if (filters.occupancy !== 'All' && pg.occupancy !== filters.occupancy) return false;
    if (filters.ac === 'AC' && !pg.ac) return false;
    if (filters.ac === 'Non AC' && pg.ac) return false;
    if (filters.verified && !pg.verified) return false;
    if (filters.availability === 'Available Now' && !pg.vacancy) return false;
    if (search && !pg.name.toLowerCase().includes(search.toLowerCase()) && !pg.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const FilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Gender */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Gender</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Male', 'Female', 'Unisex'].map(g => (
            <FilterPill key={g} label={g} active={filters.gender === g} onClick={() => setFilter('gender', g)} />
          ))}
        </div>
      </div>

      {/* Food */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Food</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Included', 'Not Included'].map(f => (
            <FilterPill key={f} label={f} active={filters.food === f} onClick={() => setFilter('food', f)} />
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Room Type</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Single', 'Double', 'Triple'].map(o => (
            <FilterPill key={o} label={o} active={filters.occupancy === o} onClick={() => setFilter('occupancy', o)} />
          ))}
        </div>
      </div>

      {/* AC */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>AC</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'AC', 'Non AC'].map(a => (
            <FilterPill key={a} label={a} active={filters.ac === a} onClick={() => setFilter('ac', a)} />
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Availability</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {['All', 'Available Now', 'Available Next Month'].map(av => (
            <FilterPill key={av} label={av} active={filters.availability === av} onClick={() => setFilter('availability', av)} />
          ))}
        </div>
      </div>

      {/* Verified Only */}
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
            background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            transition: 'all 0.2s',
          }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Verified Only</span>
      </label>

      {/* Reset */}
      <button
        onClick={() => setFilters(FILTER_DEFAULTS)}
        style={{ background: 'none', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 9, padding: '8px 0', fontSize: 13, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,74,255,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Page Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.04) 100%)',
        borderBottom: '1px solid rgba(109,74,255,0.08)',
        padding: '40px 24px 32px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>ACCOMMODATION</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
            Find Your <span style={{ color: 'var(--primary)' }}>PG in Bangalore</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            {filtered.length} verified PGs near Spice Garden & surrounding localities
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.45 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by PG name or locality…"
              style={{
                width: '100%', padding: '11px 14px 11px 40px',
                background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(109,74,255,0.14)',
                borderRadius: 12, fontSize: 14, color: 'var(--text-primary)',
                outline: 'none', backdropFilter: 'blur(12px)',
                boxShadow: '0 2px 12px rgba(109,74,255,0.06)',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(109,74,255,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(109,74,255,0.14)'}
            />
          </div>
        </div>
      </div>

      {/* Mobile filter toggle */}
      <div style={{ display: 'none', padding: '12px 16px', borderBottom: '1px solid rgba(109,74,255,0.08)' }} className="mobile-filter-toggle">
        <button
          onClick={() => setMobileFiltersOpen(o => !o)}
          style={{ background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.15)', color: 'var(--primary)', padding: '8px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', width: '100%' }}
        >
          ⚙️ Filters {filtered.length !== PG_LISTINGS.length && `(Active)`}
        </button>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }} className="pg-layout">

        {/* Sidebar */}
        <aside style={{
          background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(255,255,255,0.7)',
          borderRadius: 18, padding: '22px 20px', backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 20px rgba(109,74,255,0.06)', position: 'sticky', top: 24,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚙️</span> Filters
          </div>
          <FilterPanel />
        </aside>

        {/* Listings */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>No PGs match your filters</div>
              <div style={{ fontSize: 14 }}>Try adjusting or resetting your filters.</div>
            </div>
          ) : (
            <motion.div
              layout
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}
            >
              <AnimatePresence>
                {filtered.map((pg, i) => (
                  <PgCard
                    key={pg.id}
                    pg={pg}
                    onViewDetails={(id) => onNavigate && onNavigate('pgdetails')}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Responsive overrides via style tag */}
      <style>{`
        @media (max-width: 900px) {
          .pg-layout { grid-template-columns: 1fr !important; }
          aside { position: static !important; display: none; }
          .mobile-filter-toggle { display: block !important; }
        }
        @media (max-width: 480px) {
          .pg-layout { padding: 16px !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
