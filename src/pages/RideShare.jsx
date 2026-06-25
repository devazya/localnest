import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const RIDES = [
  { id: 1, from: 'HSR Layout Sector 4', to: 'Whitefield ITPL', time: '8:30 AM', days: 'Mon–Fri', seats: 2, totalSeats: 4, cost: 120, driver: 'Rahul K.', vehicle: 'Swift Dzire', type: 'Office Commute', rating: 4.8, joined: false, avatar: 'RK', verified: true },
  { id: 2, from: 'Koramangala 5th Block', to: 'Electronic City Phase 1', time: '9:00 AM', days: 'Mon–Fri', seats: 1, totalSeats: 3, cost: 100, driver: 'Priya S.', vehicle: 'Honda City', type: 'Office Commute', rating: 4.9, joined: false, avatar: 'PS', verified: true },
  { id: 3, from: 'Bellandur Gate', to: 'Marathahalli Bridge', time: '7:45 AM', days: 'Mon–Sat', seats: 3, totalSeats: 4, cost: 80, driver: 'Amit M.', vehicle: 'Wagon R', type: 'Office Commute', rating: 4.7, joined: false, avatar: 'AM', verified: false },
  { id: 4, from: 'BTM Layout 2nd Stage', to: 'Indiranagar 100ft Road', time: '10:30 AM', days: 'Sat–Sun', seats: 2, totalSeats: 4, cost: 60, driver: 'Sneha T.', vehicle: 'Alto K10', type: 'Weekend', rating: 4.6, joined: false, avatar: 'ST', verified: false },
  { id: 5, from: 'Sarjapur Road (Dommasandra)', to: 'MG Road Metro', time: '8:15 AM', days: 'Mon–Fri', seats: 2, totalSeats: 3, cost: 150, driver: 'Vikram D.', vehicle: 'Creta', type: 'Office Commute', rating: 5.0, joined: false, avatar: 'VD', verified: true },
  { id: 6, from: 'HSR Layout BDA Complex', to: 'Lal Bagh West Gate', time: '6:00 AM', days: 'Sat', seats: 3, totalSeats: 5, cost: 0, driver: 'Divya R.', vehicle: 'Ertiga', type: 'Weekend', rating: 4.8, joined: false, avatar: 'DR', verified: true },
  { id: 7, from: 'Bommanahalli Signal', to: 'Manyata Tech Park', time: '8:45 AM', days: 'One-time (Fri)', seats: 1, totalSeats: 2, cost: 130, driver: 'Karan J.', vehicle: 'Baleno', type: 'One Time', rating: 4.5, joined: false, avatar: 'KJ', verified: false },
  { id: 8, from: 'Agara Lake (HSR)', to: 'Outer Ring Road (Marathahalli)', time: '7:30 AM', days: 'Mon–Fri', seats: 2, totalSeats: 4, cost: 90, driver: 'Nisha P.', vehicle: 'Tiago', type: 'Office Commute', rating: 4.7, joined: false, avatar: 'NP', verified: false },
  { id: 9, from: 'Haralur Road', to: 'Koramangala 1st Block', time: '9:30 AM', days: 'Sat–Sun', seats: 4, totalSeats: 4, cost: 50, driver: 'Ravi K.', vehicle: 'Innova', type: 'Weekend', rating: 4.9, joined: false, avatar: 'RK', verified: true },
  { id: 10, from: 'Somasundarapalya', to: 'Silk Board Junction', time: '8:00 AM', days: 'Mon–Fri', seats: 1, totalSeats: 3, cost: 70, driver: 'Anjali S.', vehicle: 'i20', type: 'Office Commute', rating: 4.8, joined: false, avatar: 'AS', verified: true },
  { id: 11, from: 'Electronic City Phase 2', to: 'JP Nagar 6th Phase', time: '7:00 PM', days: 'One-time (Today)', seats: 2, totalSeats: 3, cost: 110, driver: 'Suresh N.', vehicle: 'Verna', type: 'One Time', rating: 4.6, joined: false, avatar: 'SN', verified: false },
  { id: 12, from: 'Begur Road', to: 'Brookefield Mall', time: '10:00 AM', days: 'Sun', seats: 3, totalSeats: 4, cost: 40, driver: 'Meera V.', vehicle: 'Swift', type: 'Weekend', rating: 4.7, joined: false, avatar: 'MV', verified: true },
];

const TYPE_FILTERS = ['All', 'Office Commute', 'Weekend', 'One Time'];

const TYPE_CONFIG = {
  'Office Commute': { color: '#0284C7', bg: 'rgba(2,132,199,0.1)', icon: '🏢' },
  'Weekend':        { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', icon: '🌅' },
  'One Time':       { color: '#D97706', bg: 'rgba(217,119,6,0.1)',  icon: '🎯' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.84)', border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 16, padding: '20px 24px', backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 160,
      }}
    >
      <div style={{ width: 44, height: 44, background: `${color}14`, border: `1px solid ${color}22`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({ ride, onJoin }) {
  const cfg = TYPE_CONFIG[ride.type] || TYPE_CONFIG['One Time'];
  const seatsLeft = ride.seats;
  const seatsColor = seatsLeft <= 1 ? '#DC2626' : seatsLeft <= 2 ? '#D97706' : '#059669';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.84)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20,
        padding: '20px 22px',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'all 0.28s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ y: -5, boxShadow: '0 18px 48px rgba(109,74,255,0.13)' }}
    >
      {/* Subtle left accent */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(to bottom, ${cfg.color}, ${cfg.color}44)`, borderRadius: '20px 0 0 20px' }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Type badge + seats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', gap: 4 }}>
            {cfg.icon} {ride.type}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: seatsColor, background: `${seatsColor}14`, padding: '3px 10px', borderRadius: 999 }}>
            {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
          </span>
        </div>

        {/* Route */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669', border: '2px solid #059669' }} />
              <div style={{ width: 2, height: 20, background: 'linear-gradient(to bottom, #059669, #7C3AED)', borderRadius: 2 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '2px solid #7C3AED' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{ride.from}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--primary)' }}>{ride.to}</div>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>🕐 <strong style={{ color: 'var(--text-secondary)' }}>{ride.time}</strong></span>
          <span>📅 {ride.days}</span>
          <span>🚗 {ride.vehicle}</span>
          <span style={{ color: '#F59E0B' }}>★ <strong>{ride.rating}</strong></span>
        </div>

        {/* Driver + cost + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(109,74,255,0.1)', border: '1.5px solid rgba(109,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{ride.avatar}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {ride.driver}
                {ride.verified && <span style={{ fontSize: 9, background: 'rgba(109,74,255,0.1)', color: 'var(--primary)', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Driver</div>
            </div>
          </div>

          {/* Cost */}
          <div style={{ textAlign: 'right', marginRight: 6 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: ride.cost === 0 ? '#059669' : 'var(--primary)', lineHeight: 1 }}>
              {ride.cost === 0 ? 'Free' : `₹${ride.cost}`}
            </div>
            {ride.cost > 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per person</div>}
          </div>

          <button
            onClick={() => onJoin(ride.id)}
            style={{
              background: ride.joined ? 'rgba(5,150,105,0.1)' : 'var(--primary)',
              color: ride.joined ? '#059669' : '#fff',
              border: ride.joined ? '1.5px solid rgba(5,150,105,0.3)' : 'none',
              padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: ride.joined ? 'none' : '0 4px 14px rgba(109,74,255,0.28)',
            }}
            onMouseEnter={e => { if (!ride.joined) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(109,74,255,0.38)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ride.joined ? 'none' : '0 4px 14px rgba(109,74,255,0.28)'; }}
          >{ride.joined ? '✓ Joined' : 'Join Ride'}</button>

          <button
            style={{
              background: 'rgba(109,74,255,0.06)', border: '1.5px solid rgba(109,74,255,0.15)',
              color: 'var(--primary)', padding: '8px 12px', borderRadius: 10, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.06)'; }}
          >📞</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RideShare({ onNavigate }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [rides, setRides] = useState(RIDES);

  const filtered = rides.filter(r => {
    const matchFilter = filter === 'All' || r.type === filter;
    const matchSearch = !search || r.from.toLowerCase().includes(search.toLowerCase()) || r.to.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeRides = rides.filter(r => r.seats > 0).length;
  const totalSeats = rides.reduce((a, r) => a + r.seats, 0);
  const todayRoutes = new Set(rides.map(r => r.to)).size;

  const handleJoin = (id) => setRides(prev => prev.map(r => r.id === id ? { ...r, joined: !r.joined } : r));

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>RIDE SHARING</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
              Share the <span style={{ color: 'var(--primary)' }}>commute</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', marginBottom: 28 }}>Split costs, cut traffic stress — find rides going your way</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <StatCard icon="🚗" value={activeRides} label="Active rides" color="#6D4AFF" />
              <StatCard icon="💺" value={totalSeats} label="Seats available" color="#059669" />
              <StatCard icon="🗺️" value={todayRoutes} label="Routes today" color="#0284C7" />
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 18, maxWidth: 600 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by area, landmark, or destination…"
                style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                    border: filter === f ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                    background: filter === f ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
                    color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                >
                  {f === 'All' ? '🚗 ' : TYPE_CONFIG[f]?.icon + ' '}{f}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rides Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> rides found
          </div>
          <button
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >+ Offer a Ride</button>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No rides found</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Try a different search or filter</div>
              <button onClick={() => { setFilter('All'); setSearch(''); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Clear filters</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {filtered.map(ride => (
                <RideCard key={ride.id} ride={ride} onJoin={handleJoin} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
