import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

const TYPE_FILTERS = ['All', 'daily', 'weekdays', 'weekend', 'one_time'];

const TYPE_LABELS = {
  daily:    'Daily',
  weekdays: 'Weekdays',
  weekend:  'Weekend',
  one_time: 'One Time',
};

const TYPE_CONFIG = {
  daily:    { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   icon: '🔄' },
  weekdays: { color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: '🏢' },
  weekend:  { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', icon: '🌅' },
  one_time: { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   icon: '🎯' },
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
function RideSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.84)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 20, padding: '20px 22px', backdropFilter: 'blur(18px)' }}>
          <div style={{ height: 12, width: '40%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 18 }} />
          <div style={{ height: 15, width: '80%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 10 }} />
          <div style={{ height: 15, width: '65%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 18 }} />
          <div style={{ height: 11, width: '90%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 20 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(109,74,255,0.07)' }} />
            <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(109,74,255,0.05)' }} />
            <div style={{ width: 80, height: 32, borderRadius: 10, background: 'rgba(109,74,255,0.07)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

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

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditRideModal({ ride, onClose, onUpdated }) {
  const [f, setF] = useState({
    from_location: ride.from_location,
    to_location: ride.to_location,
    ride_date: ride.ride_date,
    ride_time: ride.ride_time || '',
    seats_available: ride.seats_available,
    vehicle_type: ride.vehicle_type || '',
    price_per_seat: ride.price_per_seat || '',
    ride_type: ride.ride_type || 'one_time',
    notes: ride.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { width: '100%', padding: '10px 13px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  const submit = async () => {
    if (!f.from_location || !f.to_location || !f.ride_date) { setError('From, To and Date are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('rides').update({
      from_location: f.from_location,
      to_location: f.to_location,
      ride_date: f.ride_date,
      ride_time: f.ride_time || null,
      seats_available: parseInt(f.seats_available),
      vehicle_type: f.vehicle_type || null,
      price_per_seat: f.price_per_seat ? parseFloat(f.price_per_seat) : 0,
      ride_type: f.ride_type,
      notes: f.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', ride.id);
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
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>✏️ Edit Ride</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>
        {error && <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 9, padding: '9px 14px', marginBottom: 14 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>FROM *</label><input value={f.from_location} onChange={set('from_location')} style={inputStyle} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TO *</label><input value={f.to_location} onChange={set('to_location')} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>DATE *</label><input type="date" value={f.ride_date} onChange={set('ride_date')} style={inputStyle} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TIME</label><input type="time" value={f.ride_time} onChange={set('ride_time')} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>SEATS</label><input type="number" min="1" max="8" value={f.seats_available} onChange={set('seats_available')} style={inputStyle} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>VEHICLE</label><input value={f.vehicle_type} onChange={set('vehicle_type')} placeholder="Car, Bike…" style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>PRICE/SEAT (₹)</label><input type="number" value={f.price_per_seat} onChange={set('price_per_seat')} placeholder="0 = free" style={inputStyle} /></div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TYPE</label>
            <select value={f.ride_type} onChange={set('ride_type')} style={{ ...inputStyle, cursor: 'pointer' }}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>NOTES</label>
          <textarea value={f.notes} onChange={set('notes')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 600, border: '1.5px solid rgba(109,74,255,0.18)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ flex: 2, padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 700, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({ ride, user, isJoined, onJoin, onLeave, onDelete, onEdit }) {
  const cfg = TYPE_CONFIG[ride.ride_type] || TYPE_CONFIG['one_time'];
  const seatsLeft = ride.seats_available;
  const seatsColor = seatsLeft === 0 ? '#DC2626' : seatsLeft <= 1 ? '#D97706' : '#059669';
  const isOwner = user && ride.user_id === user.id;
  const isFull = seatsLeft === 0;
  const profile = ride.profiles;
  const displayName = profile?.full_name || profile?.username || 'Resident';
  const avatarText = initials(displayName);

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
        borderRadius: 20, padding: '20px 22px',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.28s ease',
      }}
      whileHover={{ y: -5, boxShadow: '0 18px 48px rgba(109,74,255,0.13)' }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(to bottom, ${cfg.color}, ${cfg.color}44)`, borderRadius: '20px 0 0 20px' }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', gap: 4 }}>
            {cfg.icon} {TYPE_LABELS[ride.ride_type] || ride.ride_type}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: seatsColor, background: `${seatsColor}14`, padding: '3px 10px', borderRadius: 999 }}>
            {isFull ? 'Full' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669', border: '2px solid #059669' }} />
              <div style={{ width: 2, height: 20, background: 'linear-gradient(to bottom, #059669, #7C3AED)', borderRadius: 2 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '2px solid #7C3AED' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{ride.from_location}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--primary)' }}>{ride.to_location}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          {ride.ride_time && <span>🕐 <strong style={{ color: 'var(--text-secondary)' }}>{ride.ride_time}</strong></span>}
          <span>📅 {new Date(ride.ride_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {ride.vehicle_type && <span>🚗 {ride.vehicle_type}</span>}
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(ride.created_at)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(109,74,255,0.1)', border: '1.5px solid rgba(109,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)', overflow: 'hidden' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : avatarText}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{isOwner ? 'You' : displayName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Driver</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginRight: 6 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: !ride.price_per_seat ? '#059669' : 'var(--primary)', lineHeight: 1 }}>
              {!ride.price_per_seat ? 'Free' : `₹${ride.price_per_seat}`}
            </div>
            {ride.price_per_seat > 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per person</div>}
          </div>

          {isOwner ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onEdit(ride)}
                style={{ background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.18)', color: 'var(--primary)', padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                ✏️ Edit
              </button>
              <button onClick={() => onDelete(ride.id)}
                style={{ background: 'none', border: '1.5px solid rgba(220,38,38,0.2)', color: '#DC2626', padding: '8px 10px', borderRadius: 10, fontSize: 12, cursor: 'pointer' }}>
                🗑
              </button>
            </div>
          ) : (
            <button
              onClick={() => isJoined ? onLeave(ride.id) : onJoin(ride.id)}
              disabled={isFull && !isJoined}
              style={{
                background: isJoined ? 'rgba(5,150,105,0.1)' : isFull ? 'rgba(107,114,128,0.1)' : 'var(--primary)',
                color: isJoined ? '#059669' : isFull ? '#6B7280' : '#fff',
                border: isJoined ? '1.5px solid rgba(5,150,105,0.3)' : isFull ? '1.5px solid rgba(107,114,128,0.2)' : 'none',
                padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: isFull && !isJoined ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: !isJoined && !isFull ? '0 4px 14px rgba(109,74,255,0.28)' : 'none',
              }}
            >{isJoined ? '✓ Joined' : isFull ? 'Full' : 'Join Ride'}</button>
          )}
        </div>

        {ride.notes && (
          <div style={{ marginTop: 12, padding: '9px 12px', background: 'rgba(109,74,255,0.04)', borderRadius: 9, fontSize: 12.5, color: 'var(--text-muted)', borderLeft: '3px solid rgba(109,74,255,0.2)' }}>
            {ride.notes}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RideShare({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [editRide, setEditRide] = useState(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  // Fetch rides
  const fetchRides = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rides')
      .select('*, profiles:user_id(id, full_name, username, avatar_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setRides(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  // Fetch user's joined rides
  useEffect(() => {
    if (!user) { setJoinedIds(new Set()); return; }
    supabase.from('ride_participants').select('ride_id').eq('user_id', user.id)
      .then(({ data }) => setJoinedIds(new Set((data || []).map(r => r.ride_id))));
  }, [user]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel('rides-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, async (payload) => {
        const { data } = await supabase.from('rides').select('*, profiles:user_id(id, full_name, username, avatar_url)').eq('id', payload.new.id).single();
        if (data) setRides(prev => [data, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides' }, (payload) => {
        setRides(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rides' }, (payload) => {
        setRides(prev => prev.filter(r => r.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleJoin = async (rideId) => {
    if (!user) return;
    const { error } = await supabase.from('ride_participants').insert({ ride_id: rideId, user_id: user.id });
    if (!error) {
      setJoinedIds(prev => new Set([...prev, rideId]));
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, seats_available: Math.max(0, r.seats_available - 1) } : r));
    }
  };

  const handleLeave = async (rideId) => {
    if (!user) return;
    const { error } = await supabase.from('ride_participants').delete().eq('ride_id', rideId).eq('user_id', user.id);
    if (!error) {
      setJoinedIds(prev => { const n = new Set(prev); n.delete(rideId); return n; });
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, seats_available: r.seats_available + 1 } : r));
    }
  };

  const handleDelete = async (rideId) => {
    if (!window.confirm('Delete this ride? This cannot be undone.')) return;
    await supabase.from('rides').delete().eq('id', rideId);
  };

  const filtered = rides.filter(r => {
    const matchFilter = filter === 'All' || r.ride_type === filter;
    const matchSearch = !search
      || r.from_location.toLowerCase().includes(search.toLowerCase())
      || r.to_location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeRides = rides.filter(r => r.seats_available > 0).length;
  const totalSeats = rides.reduce((a, r) => a + (r.seats_available || 0), 0);
  const uniqueRoutes = new Set(rides.map(r => r.to_location)).size;

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

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <StatCard icon="🚗" value={activeRides} label="Active rides" color="#6D4AFF" />
              <StatCard icon="💺" value={totalSeats} label="Seats available" color="#059669" />
              <StatCard icon="🗺️" value={uniqueRoutes} label="Routes" color="#0284C7" />
            </div>

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

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                    border: filter === f ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                    background: filter === f ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
                    color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                >{f === 'All' ? '🚗 All' : `${TYPE_CONFIG[f]?.icon} ${TYPE_LABELS[f]}`}</button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> rides found
          </div>
          <button
            onClick={() => onNavigate?.('post:ride')}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >+ Offer a Ride</button>
        </div>

        {loading ? (
          <RideSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No rides found</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              {search || filter !== 'All' ? 'Try a different search or filter' : 'Be the first to offer a ride!'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(search || filter !== 'All') && (
                <button onClick={() => { setFilter('All'); setSearch(''); }}
                  style={{ background: 'rgba(109,74,255,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(109,74,255,0.2)', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Clear filters
                </button>
              )}
              <button onClick={() => onNavigate?.('post:ride')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Offer a Ride
              </button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {filtered.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  user={user}
                  isJoined={joinedIds.has(ride.id)}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onDelete={handleDelete}
                  onEdit={setEditRide}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {editRide && (
          <EditRideModal
            ride={editRide}
            onClose={() => setEditRide(null)}
            onUpdated={fetchRides}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
