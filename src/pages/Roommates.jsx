import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const PROFILES = [
  {
    id: 1, name: 'Aditya Sharma', avatar: '👨‍💻', initials: 'AS',
    age: 24, occupation: 'Software Engineer at Infosys',
    lookingFor: 'Looking for Room',
    budget: '8,000–12,000', moveIn: 'Jul 1, 2026',
    location: 'HSR Layout or Koramangala', gender: 'Male',
    bio: 'Quiet, clean, and respectful. Work from office 4 days a week. Love cooking on weekends and watch cricket religiously.',
    badges: ['Professional', 'Non Smoker', 'Early Riser'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    languages: ['English', 'Hindi', 'Telugu'],
  },
  {
    id: 2, name: 'Priya Nair', avatar: '👩‍🎓', initials: 'PN',
    age: 22, occupation: 'MBA Student at IIMB',
    lookingFor: 'Looking for Roommate',
    budget: '6,000–9,000', moveIn: 'Jun 28, 2026',
    location: 'BTM Layout', gender: 'Female',
    bio: 'MBA 1st year at IIMB. Super organized and love keeping shared spaces tidy. Looking for a flat near campus or BTM.',
    badges: ['Student', 'Non Smoker', 'Pet Friendly'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=200&q=80',
    languages: ['English', 'Malayalam', 'Hindi'],
  },
  {
    id: 3, name: 'Karan Mehta', avatar: '👨‍🎨', initials: 'KM',
    age: 27, occupation: 'UX Designer at Swiggy',
    lookingFor: 'Looking for Flatmate',
    budget: '10,000–15,000', moveIn: 'Jul 15, 2026',
    location: 'Koramangala', gender: 'Male',
    bio: 'Designer who works from cafes often. Have a decent 2BHK in Koramangala, looking for one more flatmate to split the rent.',
    badges: ['Professional', 'Pet Friendly'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    languages: ['English', 'Hindi', 'Punjabi'],
  },
  {
    id: 4, name: 'Sneha Iyer', avatar: '👩‍⚕️', initials: 'SI',
    age: 25, occupation: 'Doctor at Manipal Hospital',
    lookingFor: 'Looking for Room',
    budget: '9,000–13,000', moveIn: 'Jul 10, 2026',
    location: 'Bellandur or Sarjapur', gender: 'Female',
    bio: 'Working at Manipal Hospital, night shifts 2-3 times a week. Very clean and self-sufficient. Looking for quiet female roommates.',
    badges: ['Professional', 'Non Smoker', 'Early Riser'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    languages: ['English', 'Tamil', 'Kannada'],
  },
  {
    id: 5, name: 'Rohit Desai', avatar: '👨‍🔬', initials: 'RD',
    age: 23, occupation: 'Data Analyst at Amazon',
    lookingFor: 'Looking for Roommate',
    budget: '7,000–10,000', moveIn: 'Aug 1, 2026',
    location: 'HSR Layout', gender: 'Male',
    bio: 'Data nerd, gym 5 days a week, very organized. Have a 3BHK flat in HSR looking for 2 roommates for rooms vacated in July.',
    badges: ['Professional', 'Non Smoker'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    languages: ['English', 'Marathi', 'Hindi'],
  },
  {
    id: 6, name: 'Anjali Rao', avatar: '👩‍💼', initials: 'AR',
    age: 26, occupation: 'Product Manager at Zepto',
    lookingFor: 'Looking for Flatmate',
    budget: '12,000–18,000', moveIn: 'Jul 5, 2026',
    location: 'Koramangala or Indiranagar', gender: 'Female',
    bio: 'Love cooking elaborate meals on Sundays. Have a 2BHK in Koramangala 5th Block. Looking for one working female professional.',
    badges: ['Professional', 'Pet Friendly', 'Early Riser'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    languages: ['English', 'Telugu', 'Hindi'],
  },
  {
    id: 7, name: 'Vikram Shetty', avatar: '👨‍🏫', initials: 'VS',
    age: 28, occupation: 'Backend Engineer at Flipkart',
    lookingFor: 'Looking for Room',
    budget: '8,000–11,000', moveIn: 'Jul 20, 2026',
    location: 'Whitefield or Bellandur', gender: 'Male',
    bio: 'WFH mostly, quiet, and love DIY electronics projects. Have a cat — looking for pet-friendly accommodation only.',
    badges: ['Professional', 'Pet Friendly', 'Night Owl'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1520409364224-63400afe26e5?w=200&q=80',
    languages: ['English', 'Kannada', 'Hindi'],
  },
  {
    id: 8, name: 'Divya Krishnan', avatar: '👩‍🎓', initials: 'DK',
    age: 21, occupation: 'Engineering Student at RV College',
    lookingFor: 'Looking for Room',
    budget: '4,000–6,500', moveIn: 'Jun 30, 2026',
    location: 'JP Nagar or BTM', gender: 'Female',
    bio: 'Final year CSE. Mostly in college or studying. Looking for a quiet PG or shared flat near JP Nagar / BTM. Budget is strict.',
    badges: ['Student', 'Non Smoker'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    languages: ['English', 'Tamil', 'Kannada'],
  },
  {
    id: 9, name: 'Nikhil Gupta', avatar: '👨‍🚀', initials: 'NG',
    age: 29, occupation: 'Senior DevOps at TCS',
    lookingFor: 'Looking for Flatmate',
    budget: '10,000–14,000', moveIn: 'Jul 1, 2026',
    location: 'Electronic City', gender: 'Male',
    bio: 'Have a furnished 3BHK in Electronic City Phase 1. Looking for 2 working professionals. I cook dinner most weekdays.',
    badges: ['Professional', 'Non Smoker', 'Early Riser'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&q=80',
    languages: ['English', 'Hindi', 'Bhojpuri'],
  },
  {
    id: 10, name: 'Meera Venkat', avatar: '👩‍🎤', initials: 'MV',
    age: 24, occupation: 'Graphic Designer (Freelance)',
    lookingFor: 'Looking for Room',
    budget: '6,000–9,000', moveIn: 'Jul 7, 2026',
    location: 'HSR Layout or Domlur', gender: 'Female',
    bio: 'Freelance designer, mostly WFH. Keep odd hours sometimes but always quiet after 10pm. Love plants and indie music.',
    badges: ['Non Smoker', 'Pet Friendly'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    languages: ['English', 'Tamil', 'Hindi'],
  },
  {
    id: 11, name: 'Saurav Jha', avatar: '👨‍🎓', initials: 'SJ',
    age: 22, occupation: 'CA Articleship at Deloitte',
    lookingFor: 'Looking for Room',
    budget: '5,000–7,500', moveIn: 'Jul 1, 2026',
    location: 'Koramangala or HSR', gender: 'Male',
    bio: 'Long days at work, quiet at home. Very clean and organized. Not looking for parties — just a stable place with good connectivity.',
    badges: ['Student', 'Non Smoker'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    languages: ['English', 'Hindi', 'Maithili'],
  },
  {
    id: 12, name: 'Tanya Bose', avatar: '👩‍💻', initials: 'TB',
    age: 26, occupation: 'Marketing Manager at Urban Company',
    lookingFor: 'Looking for Flatmate',
    budget: '9,000–13,000', moveIn: 'Jul 20, 2026',
    location: 'Indiranagar or Domlur', gender: 'Female',
    bio: 'Have a 2BHK in Indiranagar. Looking for one female professional to move in. I travel for work 1 week/month. Open to pets.',
    badges: ['Professional', 'Pet Friendly'],
    connected: false, saved: false,
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
    languages: ['English', 'Bengali', 'Hindi'],
  },
];

const LOOKING_FOR_OPTIONS = ['All', 'Looking for Room', 'Looking for Roommate', 'Looking for Flatmate'];

const BADGE_CONFIG = {
  'Student':       { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   icon: '🎓' },
  'Professional':  { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', icon: '💼' },
  'Non Smoker':    { color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: '🚭' },
  'Pet Friendly':  { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   icon: '🐾' },
  'Early Riser':   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: '🌅' },
  'Night Owl':     { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '🦉' },
};

const LOOKING_CONFIG = {
  'Looking for Room':     { color: '#0284C7', bg: 'rgba(2,132,199,0.08)',  icon: '🏠' },
  'Looking for Roommate': { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', icon: '🤝' },
  'Looking for Flatmate': { color: '#059669', bg: 'rgba(5,150,105,0.08)',  icon: '🏘️' },
};

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile, onConnect, onSave }) {
  const lookCfg = LOOKING_CONFIG[profile.lookingFor] || LOOKING_CONFIG['Looking for Room'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.84)',
        border: profile.connected ? '1.5px solid rgba(109,74,255,0.3)' : '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: profile.connected ? '0 6px 28px rgba(109,74,255,0.13)' : '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'all 0.28s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      whileHover={{ y: -6, boxShadow: '0 20px 52px rgba(109,74,255,0.14)' }}
    >
      {/* Top: photo area */}
      <div style={{ position: 'relative', height: 140, background: 'linear-gradient(135deg, rgba(109,74,255,0.1), rgba(143,123,255,0.06))', overflow: 'hidden', flexShrink: 0 }}>
        {/* Decorative pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(109,74,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Save btn */}
        <button
          onClick={() => onSave(profile.id)}
          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', zIndex: 2 }}
        >{profile.saved ? '🔖' : '🔖'}</button>

        {/* Looking for badge */}
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999, color: lookCfg.color, background: `${lookCfg.color}22`, backdropFilter: 'blur(8px)', border: `1px solid ${lookCfg.color}33`, display: 'flex', alignItems: 'center', gap: 4 }}>
          {lookCfg.icon} {profile.lookingFor}
        </div>

        {/* Avatar */}
        <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profile.photo}
              alt={profile.name}
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 16px rgba(109,74,255,0.2)' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(109,74,255,0.15), rgba(143,123,255,0.08))', border: '3px solid #fff', display: 'none', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--primary)', boxShadow: '0 4px 16px rgba(109,74,255,0.2)' }}>
              {profile.initials}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '38px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Name + age */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, textAlign: 'center' }}>
          {profile.name}, {profile.age}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' }}>{profile.occupation}</div>

        {/* Info row */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 14 }}>💰</span> ₹{profile.budget}/mo
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 14 }}>📅</span> {profile.moveIn}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 3, textAlign: 'center' }}>
          <span>📍</span>{profile.location}
        </div>

        {/* Bio */}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14, textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%' }}>{profile.bio}</div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
          {profile.badges.map(badge => {
            const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG['Non Smoker'];
            return (
              <span key={badge} style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', gap: 3 }}>
                {cfg.icon} {badge}
              </span>
            );
          })}
        </div>

        {/* Languages */}
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 16 }}>
          🗣️ {profile.languages.join(' · ')}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            onClick={() => onConnect(profile.id)}
            style={{
              flex: 1,
              background: profile.connected ? 'rgba(5,150,105,0.1)' : 'var(--primary)',
              color: profile.connected ? '#059669' : '#fff',
              border: profile.connected ? '1.5px solid rgba(5,150,105,0.3)' : 'none',
              padding: '9px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: profile.connected ? 'none' : '0 4px 14px rgba(109,74,255,0.28)',
            }}
            onMouseEnter={e => { if (!profile.connected) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(109,74,255,0.38)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = profile.connected ? 'none' : '0 4px 14px rgba(109,74,255,0.28)'; }}
          >{profile.connected ? '✓ Connected' : '🤝 Connect'}</button>
          <button
            onClick={() => onSave(profile.id)}
            style={{
              background: profile.saved ? 'rgba(109,74,255,0.1)' : 'rgba(109,74,255,0.06)',
              border: profile.saved ? '1.5px solid rgba(109,74,255,0.3)' : '1.5px solid rgba(109,74,255,0.15)',
              color: 'var(--primary)',
              padding: '9px 13px', borderRadius: 10, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >{profile.saved ? '🔖' : '🔖'}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Roommates({ onNavigate }) {
  const [lookingFor, setLookingFor] = useState('All');
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [profiles, setProfiles] = useState(PROFILES);

  const filtered = profiles.filter(p => {
    const matchLooking = lookingFor === 'All' || p.lookingFor === lookingFor;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.occupation.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchGender = genderFilter === 'All' || p.gender === genderFilter;
    return matchLooking && matchSearch && matchGender;
  });

  const handleConnect = (id) => setProfiles(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
  const handleSave = (id) => setProfiles(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

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

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { label: 'Active profiles', val: profiles.length, icon: '👥' },
                { label: 'Looking for room', val: profiles.filter(p => p.lookingFor === 'Looking for Room').length, icon: '🏠' },
                { label: 'Rooms available', val: profiles.filter(p => p.lookingFor === 'Looking for Roommate' || p.lookingFor === 'Looking for Flatmate').length, icon: '🏘️' },
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

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 540, marginBottom: 18 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, occupation, or location…"
                style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(8px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(109,74,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,74,255,0.15)'}
              />
            </div>

            {/* Filters row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Looking for filters */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LOOKING_FOR_OPTIONS.map(opt => {
                  const cfg = LOOKING_CONFIG[opt];
                  return (
                    <button
                      key={opt}
                      onClick={() => setLookingFor(opt)}
                      style={{
                        padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
                        border: lookingFor === opt ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                        background: lookingFor === opt ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
                        color: lookingFor === opt ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 3,
                      }}
                    >{cfg ? cfg.icon + ' ' : ''}{opt}</button>
                  );
                })}
              </div>

              {/* Gender filter */}
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                {['All', 'Male', 'Female'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    style={{
                      padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
                      border: genderFilter === g ? '1.5px solid rgba(109,74,255,0.4)' : '1.5px solid rgba(109,74,255,0.12)',
                      background: genderFilter === g ? 'rgba(109,74,255,0.1)' : 'rgba(255,255,255,0.7)',
                      color: genderFilter === g ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.18s',
                    }}
                  >{g === 'Male' ? '👨 ' : g === 'Female' ? '👩 ' : ''}{g}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profiles grid */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> people found
          </div>
          <button
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >+ Create Profile</button>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No profiles found</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Try adjusting your filters or search</div>
              <button onClick={() => { setLookingFor('All'); setSearch(''); setGenderFilter('All'); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Clear all filters</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 22 }}>
              {filtered.map(profile => (
                <ProfileCard key={profile.id} profile={profile} onConnect={handleConnect} onSave={handleSave} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
