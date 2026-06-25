import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

/* ── Full PG Detail Data ── */
const PG_DETAILS_MAP = {
  'pg-001': {
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
    vacancy: true,
    availableFrom: 'Immediately',
    description: 'Spacious double-sharing rooms in the heart of Spice Garden. Walking distance from multiple Tech Parks. Freshly cooked South Indian meals twice a day. High-speed 100Mbps WiFi, weekly housekeeping, and 24/7 power backup included. Ideal for working professionals and students.',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80',
    ],
    amenities: [
      { icon: '📶', label: 'WiFi 100Mbps' },
      { icon: '❄️', label: 'AC' },
      { icon: '🍱', label: 'Food Included' },
      { icon: '👕', label: 'Laundry' },
      { icon: '🔌', label: 'Power Backup' },
      { icon: '💧', label: 'RO Water' },
      { icon: '📹', label: 'CCTV' },
      { icon: '🛋️', label: 'Common Area' },
    ],
    owner: {
      name: 'Ramesh Kumar',
      phone: '+91 98450 12345',
      avatar: 'RK',
      responseRate: '95%',
      memberSince: 'Jan 2022',
      photo: null,
    },
    reviewsList: [
      { id: 1, name: 'Arjun S.', avatar: 'AS', rating: 5, date: 'May 2026', comment: 'Best PG I have stayed in Bangalore. Food quality is excellent and the owner is very responsive. Highly recommend!' },
      { id: 2, name: 'Kiran M.', avatar: 'KM', rating: 4, date: 'Apr 2026', comment: 'Good location, close to Bellandur. WiFi is fast. The rooms are spacious for double sharing. Minor issues with housekeeping but overall great.' },
      { id: 3, name: 'Rohit P.', avatar: 'RP', rating: 5, date: 'Mar 2026', comment: 'Very safe area, friendly residents. Power backup is solid, no issues during outages. Would stay again.' },
      { id: 4, name: 'Suresh T.', avatar: 'ST', rating: 4, date: 'Feb 2026', comment: 'Value for money. ₹8500 for AC double with food is hard to beat in Spice Garden area.' },
      { id: 5, name: 'Dev A.', avatar: 'DA', rating: 5, date: 'Jan 2026', comment: 'Clean, well-maintained. The Ramesh uncle is super helpful. All bills included makes budgeting easy.' },
    ],
    nearby: [
      { icon: '🚇', label: 'Bommanahalli Metro', distance: '0.8 km', walk: '10 min' },
      { icon: '💪', label: 'Fitness First Gym', distance: '0.4 km', walk: '5 min' },
      { icon: '☕', label: 'Third Wave Coffee', distance: '0.6 km', walk: '7 min' },
      { icon: '💊', label: 'Apollo Pharmacy', distance: '0.2 km', walk: '3 min' },
      { icon: '🛒', label: 'More Supermarket', distance: '0.5 km', walk: '6 min' },
    ],
  },
  'pg-002': {
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
    vacancy: true,
    availableFrom: 'Immediately',
    description: 'Premium single-occupancy rooms exclusively for working women and female students. 24/7 CCTV surveillance, biometric entry, and a dedicated study lounge. Home-style North and South Indian meals. Monthly events and a supportive community of professionals.',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=900&q=80',
    ],
    amenities: [
      { icon: '📶', label: 'WiFi 200Mbps' },
      { icon: '❄️', label: 'AC' },
      { icon: '🍱', label: 'Food Included' },
      { icon: '📹', label: 'CCTV 24/7' },
      { icon: '🏋️', label: 'Gym Access' },
      { icon: '🧹', label: 'Housekeeping' },
      { icon: '💧', label: 'RO Water' },
      { icon: '🚗', label: 'Parking' },
    ],
    owner: {
      name: 'Sunita Rao',
      phone: '+91 99001 87654',
      avatar: 'SR',
      responseRate: '99%',
      memberSince: 'Mar 2020',
      photo: null,
    },
    reviewsList: [
      { id: 1, name: 'Priya K.', avatar: 'PK', rating: 5, date: 'Jun 2026', comment: 'Absolutely love it here. Super safe, clean, and the food is home-like. Aunty is very caring.' },
      { id: 2, name: 'Meera S.', avatar: 'MS', rating: 5, date: 'May 2026', comment: 'Best girls PG in HSR. Single room for 11k is a steal. The gym access is a bonus!' },
      { id: 3, name: 'Anika T.', avatar: 'AT', rating: 4, date: 'Apr 2026', comment: 'Very professional setup. Biometric entry gives peace of mind. Minor complaint: parking can get cramped.' },
      { id: 4, name: 'Riya B.', avatar: 'RB', rating: 5, date: 'Mar 2026', comment: 'The community here is the best part. Monthly events help you connect with fellow residents.' },
      { id: 5, name: 'Sneh P.', avatar: 'SP', rating: 5, date: 'Feb 2026', comment: 'WiFi is blazing fast, essential for WFH. Housekeeping is thorough and consistent.' },
    ],
    nearby: [
      { icon: '🚇', label: 'HSR Layout Metro', distance: '1.0 km', walk: '12 min' },
      { icon: '💪', label: 'Cult.fit Studio', distance: '0.5 km', walk: '6 min' },
      { icon: '☕', label: 'Blue Tokai Coffee', distance: '0.7 km', walk: '8 min' },
      { icon: '💊', label: 'MedPlus Pharmacy', distance: '0.3 km', walk: '4 min' },
      { icon: '🛒', label: 'D-Mart HSR', distance: '0.9 km', walk: '11 min' },
    ],
  },
  'pg-003': {
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
    vacancy: false,
    availableFrom: 'Next Month',
    description: 'Modern co-living space designed for young professionals and entrepreneurs. Features a rooftop terrace with city views, weekly community events, and a curated network of like-minded residents. Currently at full capacity — join our waitlist for next availability.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=900&q=80',
    ],
    amenities: [
      { icon: '📶', label: 'WiFi 300Mbps' },
      { icon: '❄️', label: 'AC' },
      { icon: '🌇', label: 'Rooftop Terrace' },
      { icon: '🔌', label: 'Power Backup' },
      { icon: '🏍️', label: 'Bike Parking' },
      { icon: '🎉', label: 'Community Hall' },
      { icon: '📦', label: 'Storage Locker' },
      { icon: '🛋️', label: 'Coworking Desk' },
    ],
    owner: {
      name: 'Aditya Menon',
      phone: '+91 97400 55123',
      avatar: 'AM',
      responseRate: '88%',
      memberSince: 'Aug 2023',
      photo: null,
    },
    reviewsList: [
      { id: 1, name: 'Varun N.', avatar: 'VN', rating: 5, date: 'May 2026', comment: 'The rooftop alone is worth it. Incredible views. Community vibe is unmatched.' },
      { id: 2, name: 'Ananya R.', avatar: 'AR', rating: 4, date: 'Apr 2026', comment: 'Premium property. Only issue is no food included, but there are tons of restaurants in Koramangala.' },
      { id: 3, name: 'Kabir S.', avatar: 'KS', rating: 4, date: 'Mar 2026', comment: 'Great for networking. Met my co-founder here. Aditya runs really well thought-out events.' },
      { id: 4, name: 'Tara M.', avatar: 'TM', rating: 5, date: 'Feb 2026', comment: 'The coworking desk is a lifesaver for freelancers. Best co-living in Koramangala.' },
      { id: 5, name: 'Raj V.', avatar: 'RV', rating: 4, date: 'Jan 2026', comment: 'Pricey but justified. Everything is top-quality and the location is prime.' },
    ],
    nearby: [
      { icon: '🚇', label: 'Koramangala Metro', distance: '1.2 km', walk: '14 min' },
      { icon: '💪', label: 'Gold Gym Koramangala', distance: '0.6 km', walk: '7 min' },
      { icon: '☕', label: 'Starbucks 5th Block', distance: '0.3 km', walk: '4 min' },
      { icon: '💊', label: 'Wellness Forever', distance: '0.4 km', walk: '5 min' },
      { icon: '🛒', label: 'Star Bazaar Koramangala', distance: '0.8 km', walk: '9 min' },
    ],
  },
};

const SIMILAR_PGS = [
  { id: 'pg-001', name: 'Sunrise Boys PG', rent: 8500, rating: 4.6, location: 'Spice Garden', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80' },
  { id: 'pg-002', name: 'Green Valley Girls PG', rent: 11000, rating: 4.8, location: 'HSR Layout', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80' },
  { id: 'pg-003', name: 'Urban Nest Co-living', rent: 14500, rating: 4.4, location: 'Koramangala', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80' },
  { id: 'pg-001', name: 'Sunrise Boys PG', rent: 8500, rating: 4.6, location: 'Spice Garden', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80' },
];

/* ── Stars ── */
function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#F59E0B' : '#E5E7EB', fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

export default function PgDetails({ pgId, onNavigate }) {
  const pg = PG_DETAILS_MAP[pgId] || PG_DETAILS_MAP['pg-001'];
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Back */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 0' }}>
        <button
          onClick={() => onNavigate('pgs')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}
        >
          ← Back to PG Listings
        </button>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>

        {/* ── Image Gallery ── */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: 420, background: '#EDE9FE', marginBottom: 10 }}>
            <img
              src={pg.images[activeImage]}
              alt={pg.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
            />
            {/* Arrows */}
            {activeImage > 0 && (
              <button onClick={() => setActiveImage(a => a - 1)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>‹</button>
            )}
            {activeImage < pg.images.length - 1 && (
              <button onClick={() => setActiveImage(a => a + 1)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>›</button>
            )}
            {/* Counter */}
            <div style={{ position: 'absolute', bottom: 14, right: 16, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, padding: '4px 10px', borderRadius: 999, backdropFilter: 'blur(6px)' }}>
              {activeImage + 1} / {pg.images.length}
            </div>
          </div>
          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: 10 }}>
            {pg.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                style={{
                  width: 80, height: 60, borderRadius: 10, overflow: 'hidden', padding: 0, border: i === activeImage ? '2.5px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.18s',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }} className="details-layout">

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Overview */}
            <motion.div {...fadeUp(0.05)} style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: 24, backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {pg.verified && <span className="badge badge-blue">✓ Verified</span>}
                    <span className={`badge ${pg.vacancy ? 'badge-green' : 'badge-red'}`}>{pg.vacancy ? 'Available Now' : 'Currently Full'}</span>
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5, marginBottom: 4 }}>{pg.name}</h1>
                  <div style={{ fontSize: 13.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📍 {pg.location} · <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{pg.distance}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>₹{pg.rent.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/month</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Deposit: ₹{pg.deposit.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {[pg.gender, pg.occupancy, pg.furnishing, pg.ac ? 'AC' : 'Non-AC', pg.food ? 'Food Included' : 'No Food'].map(m => (
                  <span key={m} style={{ background: 'rgba(109,74,255,0.06)', border: '1px solid rgba(109,74,255,0.12)', borderRadius: 7, padding: '4px 11px', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{m}</span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Stars rating={pg.rating} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{pg.rating}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({pg.reviews} reviews)</span>
              </div>

              <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{pg.description}</p>

              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, fontSize: 13, color: '#059669', fontWeight: 500 }}>
                📅 Available from: {pg.availableFrom}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div {...fadeUp(0.1)} style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: 24, backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.06)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {pg.amenities.map(a => (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(109,74,255,0.05)', border: '1px solid rgba(109,74,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{a.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div {...fadeUp(0.15)} style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: 24, backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stars rating={pg.rating} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{pg.rating}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ 5</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {pg.reviewsList.map(r => (
                  <div key={r.id} style={{ borderBottom: '1px solid rgba(109,74,255,0.07)', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, rgba(109,74,255,0.15), rgba(143,123,255,0.1))', border: '1px solid rgba(109,74,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--primary)', flexShrink: 0 }}>{r.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</span>
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.date}</span>
                        </div>
                        <div style={{ marginBottom: 6 }}><Stars rating={r.rating} /></div>
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Nearby */}
            <motion.div {...fadeUp(0.2)} style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: 24, backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.06)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Nearby Places</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pg.nearby.map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'rgba(109,74,255,0.04)', border: '1px solid rgba(109,74,255,0.08)', borderRadius: 11 }}>
                    <div style={{ fontSize: 22, width: 36, textAlign: 'center' }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.walk} walk</div>
                    </div>
                    <span className="badge badge-muted">{n.distance}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Owner + Actions sticky */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>

            {/* Owner Card */}
            <motion.div {...fadeUp(0.08)} style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: 22, backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.08)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Owner / Caretaker</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, rgba(109,74,255,0.2), rgba(143,123,255,0.12))', border: '2px solid rgba(109,74,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--primary)', flexShrink: 0 }}>
                  {pg.owner.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{pg.owner.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Member since {pg.owner.memberSince}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, background: 'rgba(109,74,255,0.05)', border: '1px solid rgba(109,74,255,0.1)', borderRadius: 10, padding: '10px 0', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{pg.owner.responseRate}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Response Rate</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(109,74,255,0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#5B38E8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = ''; }}
                >📞 Call Owner</button>
                <button style={{ background: 'rgba(16,185,129,0.09)', border: '1.5px solid rgba(16,185,129,0.2)', color: '#059669', padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.16)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.09)'}
                >💬 WhatsApp</button>
                <button style={{ background: 'rgba(109,74,255,0.07)', border: '1.5px solid rgba(109,74,255,0.14)', color: 'var(--primary)', padding: '11px 0', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,74,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(109,74,255,0.07)'}
                >📅 Schedule Visit</button>
              </div>
            </motion.div>

            {/* Similar PGs Carousel */}
            <motion.div {...fadeUp(0.12)} style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: 20, backdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(109,74,255,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Similar PGs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SIMILAR_PGS.filter(s => s.id !== pg.id).slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    onClick={() => onNavigate('pg-details', s.id)}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: 12, transition: 'background 0.18s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,74,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 64, height: 50, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>📍 {s.location}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>₹{s.rent.toLocaleString()}/mo</div>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#F59E0B', fontWeight: 600, flexShrink: 0 }}>★ {s.rating}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .details-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
