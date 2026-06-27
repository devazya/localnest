import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase/client';

const CATEGORIES = ['All', 'Sports', 'Meetups', 'Study Groups', 'Weekend Trips', 'Networking', 'Cultural', 'Workshop', 'Other'];

const CAT_CONFIG = {
  Sports:          { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   icon: '⚽' },
  Meetups:         { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  icon: '🎉' },
  'Study Groups':  { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   icon: '📚' },
  'Weekend Trips': { color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: '🏕️' },
  Networking:      { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   icon: '🤝' },
  Cultural:        { color: '#9333EA', bg: 'rgba(147,51,234,0.1)',  icon: '🎭' },
  Workshop:        { color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   icon: '🛠️' },
  Other:           { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '📌' },
  meetup:          { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  icon: '🎉' },
  workshop:        { color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   icon: '🛠️' },
  party:           { color: '#EC4899', bg: 'rgba(236,72,153,0.1)',  icon: '🎊' },
  sports:          { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   icon: '⚽' },
  cultural:        { color: '#9333EA', bg: 'rgba(147,51,234,0.1)',  icon: '🎭' },
  other:           { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '📌' },
};

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function EventSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.84)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(18px)' }}>
          <div style={{ height: 180, background: 'rgba(109,74,255,0.06)' }} />
          <div style={{ padding: '18px 20px' }}>
            <div style={{ height: 16, width: '80%', borderRadius: 6, background: 'rgba(109,74,255,0.07)', marginBottom: 12 }} />
            <div style={{ height: 11, width: '60%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 8 }} />
            <div style={{ height: 11, width: '70%', borderRadius: 6, background: 'rgba(109,74,255,0.05)', marginBottom: 20 }} />
            <div style={{ height: 4, borderRadius: 99, background: 'rgba(109,74,255,0.07)', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, height: 36, borderRadius: 10, background: 'rgba(109,74,255,0.07)' }} />
              <div style={{ flex: 1, height: 36, borderRadius: 10, background: 'rgba(109,74,255,0.07)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Edit Event Modal ─────────────────────────────────────────────────────────
function EditEventModal({ event, onClose, onUpdated }) {
  const [f, setF] = useState({
    title: event.title,
    description: event.description || '',
    event_date: event.event_date,
    event_time: event.event_time || '',
    venue: event.venue || '',
    capacity: event.capacity || '',
    category: event.category || 'meetup',
    fee: event.fee || 'Free',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = { width: '100%', padding: '10px 13px', background: 'rgba(109,74,255,0.04)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  const submit = async () => {
    if (!f.title || !f.event_date) { setError('Title and date are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('events').update({
      title: f.title,
      description: f.description || null,
      event_date: f.event_date,
      event_time: f.event_time || null,
      venue: f.venue || null,
      capacity: f.capacity ? parseInt(f.capacity) : null,
      category: f.category,
      fee: f.fee || 'Free',
      updated_at: new Date().toISOString(),
    }).eq('id', event.id);
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
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>✏️ Edit Event</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>
        {error && <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 9, padding: '9px 14px', marginBottom: 14 }}>{error}</div>}
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TITLE *</label><input value={f.title} onChange={set('title')} style={inputStyle} /></div>
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>DESCRIPTION</label><textarea value={f.description} onChange={set('description')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>DATE *</label><input type="date" value={f.event_date} onChange={set('event_date')} style={inputStyle} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>TIME</label><input type="time" value={f.event_time} onChange={set('event_time')} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>VENUE</label><input value={f.venue} onChange={set('venue')} style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 13 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>CAPACITY</label><input type="number" value={f.capacity} onChange={set('capacity')} style={inputStyle} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>FEE</label><input value={f.fee} onChange={set('fee')} placeholder="Free or ₹200" style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>CATEGORY</label>
          <select value={f.category} onChange={set('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
            {['meetup', 'workshop', 'party', 'sports', 'cultural', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, user, isJoined, isInterested, onJoin, onLeave, onInterest, onDelete, onEdit }) {
  const cfg = CAT_CONFIG[event.category] || CAT_CONFIG.other;
  const fillPct = event.capacity ? Math.min(100, Math.round(((event.attendee_count || 0) / event.capacity) * 100)) : 0;
  const isAlmostFull = fillPct >= 80;
  const isFull = event.capacity && (event.attendee_count || 0) >= event.capacity;
  const isOwner = user && event.user_id === user.id;

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
        borderRadius: 20, overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        display: 'flex', flexDirection: 'column',
      }}
      whileHover={{ y: -6, boxShadow: '0 20px 52px rgba(109,74,255,0.14)' }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}08)` }}>
        {event.images?.[0] ? (
          <img src={event.images[0]} alt={event.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, opacity: 0.3 }}>{cfg.icon}</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999, color: '#fff', background: `${cfg.color}cc`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {cfg.icon} {event.category}
        </div>
        <button onClick={() => onInterest(event.id)}
          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >{isInterested ? '⭐' : '☆'}</button>
        <div style={{ position: 'absolute', bottom: 12, left: 14, color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{formatDate(event.event_date)}</div>
        </div>
        {isAlmostFull && !isFull && (
          <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10.5, fontWeight: 600, background: '#D97706', color: '#fff', padding: '3px 10px', borderRadius: 999 }}>Almost Full</div>
        )}
        {isFull && (
          <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10.5, fontWeight: 600, background: '#DC2626', color: '#fff', padding: '3px 10px', borderRadius: 999 }}>Full</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 660, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 10 }}>{event.title}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
          {event.event_time && (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🕐</span><span>{event.event_time}</span>
            </div>
          )}
          {event.venue && (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>📍</span><span>{event.venue}</span>
            </div>
          )}
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>👤</span>
            <span>{event.profiles?.full_name || event.profiles?.username || 'Organizer'}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: (!event.fee || event.fee === 'Free') ? '#059669' : 'var(--primary)', background: (!event.fee || event.fee === 'Free') ? 'rgba(5,150,105,0.1)' : 'rgba(109,74,255,0.08)', padding: '2px 8px', borderRadius: 999 }}>
              {event.fee || 'Free'}
            </span>
          </div>
        </div>

        {event.description && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
            {event.description}
          </div>
        )}

        {event.capacity && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>👥 {event.attendee_count || 0} attending</span>
              <span>{event.capacity - (event.attendee_count || 0)} spots left</span>
            </div>
            <div style={{ height: 4, background: 'rgba(109,74,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${fillPct}%`, background: isAlmostFull ? 'linear-gradient(to right, #DC2626, #F59E0B)' : 'linear-gradient(to right, var(--primary), #8B5CF6)', borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}

        {event.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {event.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 6, padding: '2px 9px', fontSize: 11.5, color: 'var(--primary)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {isOwner ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(event)}
              style={{ flex: 1, background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.18)', color: 'var(--primary)', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ✏️ Edit
            </button>
            <button onClick={() => onDelete(event.id)}
              style={{ flex: 1, background: 'none', border: '1.5px solid rgba(220,38,38,0.2)', color: '#DC2626', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🗑 Delete
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onInterest(event.id)}
              style={{ flex: 1, background: isInterested ? 'rgba(245,158,11,0.1)' : 'rgba(109,74,255,0.06)', border: isInterested ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid rgba(109,74,255,0.15)', color: isInterested ? '#D97706' : 'var(--primary)', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {isInterested ? '⭐ Interested' : '☆ Interested'}
            </button>
            <button
              onClick={() => isJoined ? onLeave(event.id) : onJoin(event.id)}
              disabled={isFull && !isJoined}
              style={{ flex: 1, background: isJoined ? 'rgba(5,150,105,0.1)' : isFull ? 'rgba(107,114,128,0.1)' : 'var(--primary)', color: isJoined ? '#059669' : isFull ? '#6B7280' : '#fff', border: isJoined ? '1.5px solid rgba(5,150,105,0.3)' : isFull ? '1.5px solid rgba(107,114,128,0.2)' : 'none', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: isFull && !isJoined ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: !isJoined && !isFull ? '0 4px 14px rgba(109,74,255,0.28)' : 'none' }}>
              {isJoined ? '✓ Joined' : isFull ? 'Full' : 'Join Event'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Events({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [interestedIds, setInterestedIds] = useState(new Set());
  const [editEvent, setEditEvent] = useState(null);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription?.unsubscribe();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*, profiles:user_id(id, full_name, username, avatar_url)')
      .eq('status', 'active')
      .order('event_date', { ascending: true });
    setEvents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Fetch user joins + interests
  useEffect(() => {
    if (!user) { setJoinedIds(new Set()); setInterestedIds(new Set()); return; }
    supabase.from('event_attendees').select('event_id').eq('user_id', user.id)
      .then(({ data }) => setJoinedIds(new Set((data || []).map(r => r.event_id))));
    supabase.from('event_interests').select('event_id').eq('user_id', user.id)
      .then(({ data }) => setInterestedIds(new Set((data || []).map(r => r.event_id))));
  }, [user]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel('events-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, async (payload) => {
        const { data } = await supabase.from('events').select('*, profiles:user_id(id, full_name, username, avatar_url)').eq('id', payload.new.id).single();
        if (data) setEvents(prev => [data, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' }, (payload) => {
        setEvents(prev => prev.map(e => e.id === payload.new.id ? { ...e, ...payload.new } : e));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' }, (payload) => {
        setEvents(prev => prev.filter(e => e.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleJoin = async (eventId) => {
    if (!user) return;
    const event = events.find(e => e.id === eventId);
    if (event?.capacity && (event.attendee_count || 0) >= event.capacity) return;
    const { error } = await supabase.from('event_attendees').insert({ event_id: eventId, user_id: user.id });
    if (!error) {
      setJoinedIds(prev => new Set([...prev, eventId]));
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendee_count: (e.attendee_count || 0) + 1 } : e));
    }
  };

  const handleLeave = async (eventId) => {
    if (!user) return;
    const { error } = await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', user.id);
    if (!error) {
      setJoinedIds(prev => { const n = new Set(prev); n.delete(eventId); return n; });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendee_count: Math.max(0, (e.attendee_count || 0) - 1) } : e));
    }
  };

  const handleInterest = async (eventId) => {
    if (!user) return;
    const isInterested = interestedIds.has(eventId);
    if (isInterested) {
      await supabase.from('event_interests').delete().eq('event_id', eventId).eq('user_id', user.id);
      setInterestedIds(prev => { const n = new Set(prev); n.delete(eventId); return n; });
    } else {
      await supabase.from('event_interests').insert({ event_id: eventId, user_id: user.id });
      setInterestedIds(prev => new Set([...prev, eventId]));
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    await supabase.from('events').delete().eq('id', eventId);
  };

  const filtered = events.filter(e => {
    const catMatch = category === 'All' || e.category?.toLowerCase() === category.toLowerCase() || e.category === category;
    const searchMatch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || (e.venue || '').toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const freeCount = events.filter(e => !e.fee || e.fee === 'Free').length;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ position: 'relative', padding: '56px 24px 40px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(109,74,255,0.08) 0%, rgba(143,123,255,0.04) 50%, rgba(59,130,246,0.04) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 320, height: 320, background: 'radial-gradient(circle, rgba(109,74,255,0.1), transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>EVENTS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -1, marginBottom: 8, lineHeight: 1.1 }}>
              Things to do<br /><span style={{ color: 'var(--primary)' }}>around you</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, marginBottom: 32, lineHeight: 1.6 }}>
              Tournaments, study sessions, weekend trips and more — all happening in your locality
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { label: 'Events', val: events.length },
                { label: 'Free events', val: freeCount },
                { label: 'Categories', val: CATEGORIES.length - 1 },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{val}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', maxWidth: 540, marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by event name or location…"
                style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => {
                const cfg = CAT_CONFIG[cat];
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: category === cat ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)', background: category === cat ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)', color: category === cat ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {cfg ? cfg.icon + ' ' : ''}{cat}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> events
            {category !== 'All' && <span> in <strong style={{ color: 'var(--primary)' }}>{category}</strong></span>}
          </div>
          <button onClick={() => onNavigate?.('post:event')}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >+ List an Event</button>
        </div>

        {loading ? (
          <EventSkeleton />
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No events found</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              {search || category !== 'All' ? 'Try a different category or search' : 'Be the first to create an event!'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(search || category !== 'All') && (
                <button onClick={() => { setCategory('All'); setSearch(''); }}
                  style={{ background: 'rgba(109,74,255,0.08)', color: 'var(--primary)', border: '1.5px solid rgba(109,74,255,0.2)', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Show all events
                </button>
              )}
              <button onClick={() => onNavigate?.('post:event')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Create Event
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
            <AnimatePresence>
              {filtered.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                  isJoined={joinedIds.has(event.id)}
                  isInterested={interestedIds.has(event.id)}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onInterest={handleInterest}
                  onDelete={handleDelete}
                  onEdit={setEditEvent}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editEvent && (
          <EditEventModal
            event={editEvent}
            onClose={() => setEditEvent(null)}
            onUpdated={fetchEvents}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
