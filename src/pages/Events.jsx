import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 1,
    title: 'Sunday Cricket Tournament',
    category: 'Sports',
    date: 'Sun, Jun 29',
    time: '7:00 AM – 1:00 PM',
    location: 'HSR Layout Ground, Sector 4',
    attendees: 64,
    maxAttendees: 80,
    cover: 'https://images.unsplash.com/photo-1540747913346-19212a4b423c?w=600&q=80',
    organizer: 'HSR Sports Club',
    fee: '₹200/team',
    description: 'Annual 6-over cricket tournament open to all localities. Register your team of 8 by Saturday evening. Prizes for top 3 teams, refreshments included.',
    interested: false,
    joined: false,
    tags: ['Cricket', 'Outdoor'],
  },
  {
    id: 2,
    title: 'Startup Founders Meetup — Bangalore South',
    category: 'Networking',
    date: 'Thu, Jul 3',
    time: '6:30 PM – 9:00 PM',
    location: 'IndiQube Edge, BTM Layout',
    attendees: 38,
    maxAttendees: 60,
    cover: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80',
    organizer: 'BLR Founders Network',
    fee: 'Free',
    description: 'Monthly informal gathering for startup founders, indie hackers, and product builders in South Bangalore. Lightning talks + open networking over pizza.',
    interested: false,
    joined: false,
    tags: ['Startups', 'Networking'],
  },
  {
    id: 3,
    title: 'GATE 2027 Study Group — Weekly Session',
    category: 'Study Groups',
    date: 'Sat, Jun 28',
    time: '10:00 AM – 1:00 PM',
    location: 'HSR BDA Library, 27th Main',
    attendees: 18,
    maxAttendees: 25,
    cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    organizer: 'GATE Prep Community',
    fee: 'Free',
    description: 'Every Saturday morning study session for GATE CSE aspirants. Covers previous year papers, topic-wise discussion, and doubt clearing. Bring your notes and laptop.',
    interested: false,
    joined: false,
    tags: ['GATE', 'Study'],
  },
  {
    id: 4,
    title: 'Coorg Weekend Trip — 12 Spots Only',
    category: 'Weekend Trips',
    date: 'Sat–Sun, Jul 5–6',
    time: 'Departs 5:00 AM Sat',
    location: 'Pickup: Silk Board Flyover',
    attendees: 9,
    maxAttendees: 12,
    cover: 'https://images.unsplash.com/photo-1446034295857-c39f8844fad4?w=600&q=80',
    organizer: 'Weekend Wanders BLR',
    fee: '₹2,200/person',
    description: 'Two-day trip to Coorg — Abbey Falls, Raja\'s Seat, plantation walk, and a homestay stay. Transport, meals (6), and stay included. Split equally among group.',
    interested: false,
    joined: false,
    tags: ['Trip', 'Nature'],
  },
  {
    id: 5,
    title: 'Open Mic Night at The Brew Collective',
    category: 'Meetups',
    date: 'Fri, Jul 4',
    time: '7:30 PM – 11:00 PM',
    location: 'The Brew Collective, Koramangala 5th Block',
    attendees: 52,
    maxAttendees: 100,
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
    organizer: 'BLR Open Mic',
    fee: '₹150 cover',
    description: 'Monthly open mic for musicians, comedians, poets, and storytellers. 5-minute slots available — signup at the door. Drinks on discounted offer for performers.',
    interested: false,
    joined: false,
    tags: ['Music', 'Social'],
  },
  {
    id: 6,
    title: 'Badminton Doubles Tournament — HSR',
    category: 'Sports',
    date: 'Sun, Jul 6',
    time: '8:00 AM – 12:00 PM',
    location: 'HSR Badminton Academy, Sector 7',
    attendees: 24,
    maxAttendees: 32,
    cover: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
    organizer: 'HSR Shuttlers Club',
    fee: '₹300/pair',
    description: 'Mixed doubles round-robin tournament. Open to all levels. Rackets available on loan. Prize worth ₹3,000 for winners. Register as a pair.',
    interested: false,
    joined: false,
    tags: ['Badminton', 'Tournament'],
  },
  {
    id: 7,
    title: 'UI/UX Design Portfolio Review Night',
    category: 'Networking',
    date: 'Wed, Jul 2',
    time: '5:30 PM – 8:00 PM',
    location: 'WeWork Galaxy, Residency Road',
    attendees: 27,
    maxAttendees: 40,
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    organizer: 'Design Café BLR',
    fee: 'Free',
    description: 'Bring your portfolio (physical or Figma) and get live feedback from senior designers and hiring managers. Ideal for freshers and mid-level designers seeking jobs or freelance work.',
    interested: false,
    joined: false,
    tags: ['Design', 'Portfolio'],
  },
  {
    id: 8,
    title: 'Kannada Language Exchange Meetup',
    category: 'Meetups',
    date: 'Sat, Jun 28',
    time: '4:00 PM – 6:00 PM',
    location: 'Café Coffee Day, 27th Main HSR',
    attendees: 14,
    maxAttendees: 20,
    cover: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    organizer: 'Learn Kannada BLR',
    fee: 'Free',
    description: 'Casual language exchange for those learning Kannada. Native speakers pair with learners. All levels welcome — from complete beginners to conversational. Just show up!',
    interested: false,
    joined: false,
    tags: ['Language', 'Kannada'],
  },
  {
    id: 9,
    title: 'Early Morning Yoga at the Park',
    category: 'Sports',
    date: 'Daily (Mon–Sat)',
    time: '6:00 AM – 7:15 AM',
    location: 'Agara Lake Park, HSR Layout',
    attendees: 31,
    maxAttendees: 50,
    cover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    organizer: 'Wellness Circle HSR',
    fee: '₹500/month',
    description: 'Outdoor morning yoga sessions at the park. All levels welcome. Yoga mats provided on request. Free trial for the first session — just show up in comfortable clothes.',
    interested: false,
    joined: false,
    tags: ['Yoga', 'Wellness'],
  },
  {
    id: 10,
    title: 'Nandi Hills Sunrise Cycling Ride',
    category: 'Weekend Trips',
    date: 'Sun, Jul 13',
    time: 'Departs 3:30 AM',
    location: 'Pickup: HSR BDA Complex',
    attendees: 16,
    maxAttendees: 20,
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    organizer: 'BLR Cycling Community',
    fee: '₹300/person',
    description: 'Pre-dawn departure to Nandi Hills for a sunrise cycle ascent. Must have a road or hybrid cycle. Pace is moderate. Breakfast stop at Chikballapur on return.',
    interested: false,
    joined: false,
    tags: ['Cycling', 'Nandi Hills'],
  },
];

const CATEGORIES = ['All', 'Sports', 'Meetups', 'Study Groups', 'Weekend Trips', 'Networking'];

const CAT_CONFIG = {
  Sports:         { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   icon: '⚽' },
  Meetups:        { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  icon: '🎉' },
  'Study Groups': { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   icon: '📚' },
  'Weekend Trips':{ color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: '🏕️' },
  Networking:     { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   icon: '🤝' },
};

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onToggleInterest, onJoin }) {
  const cfg = CAT_CONFIG[event.category] || CAT_CONFIG.Meetups;
  const fillPct = Math.min(100, Math.round((event.attendees / event.maxAttendees) * 100));
  const isAlmostFull = fillPct >= 80;

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
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'all 0.28s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      whileHover={{ y: -6, boxShadow: '0 20px 52px rgba(109,74,255,0.14)' }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={event.cover}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
        {/* Category badge */}
        <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999, color: '#fff', background: `${cfg.color}cc`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {cfg.icon} {event.category}
        </div>
        {/* Interest button */}
        <button
          onClick={() => onToggleInterest(event.id)}
          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >{event.interested ? '⭐' : '☆'}</button>
        {/* Date on image */}
        <div style={{ position: 'absolute', bottom: 12, left: 14, color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{event.date}</div>
        </div>
        {isAlmostFull && (
          <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10.5, fontWeight: 600, background: '#DC2626', color: '#fff', padding: '3px 10px', borderRadius: 999 }}>Almost Full</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 660, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 10 }}>{event.title}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>🕐</span><span>{event.time}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>📍</span><span>{event.location}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>👤</span><span>{event.organizer}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: event.fee === 'Free' ? '#059669' : 'var(--primary)', background: event.fee === 'Free' ? 'rgba(5,150,105,0.1)' : 'rgba(109,74,255,0.08)', padding: '2px 8px', borderRadius: 999 }}>{event.fee}</span>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>{event.description}</div>

        {/* Attendees progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>👥 {event.attendees} attending</span>
            <span>{event.maxAttendees - event.attendees} spots left</span>
          </div>
          <div style={{ height: 4, background: 'rgba(109,74,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${fillPct}%`, background: isAlmostFull ? 'linear-gradient(to right, #DC2626, #F59E0B)' : 'linear-gradient(to right, var(--primary), #8B5CF6)', borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {event.tags.map(tag => (
            <span key={tag} style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 6, padding: '2px 9px', fontSize: 11.5, color: 'var(--primary)' }}>#{tag}</span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onToggleInterest(event.id)}
            style={{
              flex: 1,
              background: event.interested ? 'rgba(245,158,11,0.1)' : 'rgba(109,74,255,0.06)',
              border: event.interested ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid rgba(109,74,255,0.15)',
              color: event.interested ? '#D97706' : 'var(--primary)',
              padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >{event.interested ? '⭐ Interested' : '☆ Interested'}</button>
          <button
            onClick={() => onJoin(event.id)}
            style={{
              flex: 1,
              background: event.joined ? 'rgba(5,150,105,0.1)' : 'var(--primary)',
              color: event.joined ? '#059669' : '#fff',
              border: event.joined ? '1.5px solid rgba(5,150,105,0.3)' : 'none',
              padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: event.joined ? 'none' : '0 4px 14px rgba(109,74,255,0.28)',
            }}
          >{event.joined ? '✓ Joined' : 'Join Event'}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Events({ onNavigate }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState(EVENTS);

  const filtered = events.filter(e => {
    const matchCat = category === 'All' || e.category === category;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleInterest = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, interested: !e.interested } : e));
  const handleJoin = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, joined: !e.joined, attendees: e.joined ? e.attendees - 1 : e.attendees + 1 } : e));

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero banner */}
      <div style={{ position: 'relative', padding: '56px 24px 40px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(109,74,255,0.08) 0%, rgba(143,123,255,0.04) 50%, rgba(59,130,246,0.04) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 320, height: 320, background: 'radial-gradient(circle, rgba(109,74,255,0.1), transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>EVENTS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -1, marginBottom: 8, lineHeight: 1.1 }}>
              Things to do<br /><span style={{ color: 'var(--primary)' }}>around you</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, marginBottom: 32, lineHeight: 1.6 }}>
              Tournaments, study sessions, weekend trips and more — all happening in your locality
            </p>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { label: 'Events this week', val: 10 },
                { label: 'Free events', val: events.filter(e => e.fee === 'Free').length },
                { label: 'Categories', val: 5 },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{val}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 540, marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by event name or location…"
                style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            {/* Category filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => {
                const cfg = CAT_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                      border: category === cat ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                      background: category === cat ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
                      color: category === cat ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >{cfg ? cfg.icon + ' ' : ''}{cat}</button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Events grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> events
            {category !== 'All' && <span> in <strong style={{ color: 'var(--primary)' }}>{category}</strong></span>}
          </div>
          <button
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >+ List an Event</button>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No events found</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Try a different category or search</div>
              <button onClick={() => { setCategory('All'); setSearch(''); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Show all events</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
              {filtered.map(event => (
                <EventCard key={event.id} event={event} onToggleInterest={handleInterest} onJoin={handleJoin} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
