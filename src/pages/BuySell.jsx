import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const LISTINGS = [
  {
    id: 1, name: 'Dell Inspiron 15 Laptop', category: 'Electronics',
    price: 28000, originalPrice: 55000,
    seller: 'Rahul K.', sellerAvatar: 'RK', sellerRating: 4.8,
    condition: 'Good', posted: '2 days ago',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    description: 'Core i5 10th Gen, 8GB RAM, 512GB SSD. Works perfectly, minor scratches on lid. Selling due to upgrade.',
    location: 'HSR Layout', saved: false, featured: true,
  },
  {
    id: 2, name: 'Wooden Study Table (4ft × 2ft)', category: 'Furniture',
    price: 2800, originalPrice: 6500,
    seller: 'Neha T.', sellerAvatar: 'NT', sellerRating: 4.6,
    condition: 'Like New', posted: '1 day ago',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80',
    description: 'Solid wood study table with drawer. Purchased 8 months ago, no scratches. Comes with chair if needed.',
    location: 'Koramangala 6th Block', saved: false, featured: false,
  },
  {
    id: 3, name: 'Hero Splendor Plus (2021)', category: 'Bikes',
    price: 52000, originalPrice: 72000,
    seller: 'Arjun M.', sellerAvatar: 'AM', sellerRating: 4.9,
    condition: 'Good', posted: '3 days ago',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    description: '2021 model, 18,000 km run. Single owner, all documents clear. Recently serviced. Selling because relocating.',
    location: 'BTM Layout', saved: false, featured: true,
  },
  {
    id: 4, name: 'GATE CSE Previous 10 Years Papers', category: 'Books',
    price: 350, originalPrice: 800,
    seller: 'Kiran S.', sellerAvatar: 'KS', sellerRating: 4.5,
    condition: 'Good', posted: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80',
    description: 'Set of 4 books with solutions. Some highlighting but all readable. Great for last-minute prep.',
    location: 'HSR Layout', saved: false, featured: false,
  },
  {
    id: 5, name: 'Whirlpool 1.5 Ton AC (2022)', category: 'Appliances',
    price: 18000, originalPrice: 38000,
    seller: 'Divya R.', sellerAvatar: 'DR', sellerRating: 4.7,
    condition: 'Good', posted: '5 days ago',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
    description: '3-star rating, inverter AC. Works perfectly, recently gas recharged. Shifting to new apartment with AC included.',
    location: 'Bellandur', saved: false, featured: false,
  },
  {
    id: 6, name: 'JBL Flip 6 Bluetooth Speaker', category: 'Electronics',
    price: 4500, originalPrice: 9000,
    seller: 'Vikram D.', sellerAvatar: 'VD', sellerRating: 4.9,
    condition: 'Like New', posted: '1 day ago',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
    description: 'Barely used, bought 4 months ago. Comes with original box, cable, and warranty card. No scratches.',
    location: 'Sarjapur Road', saved: false, featured: true,
  },
  {
    id: 7, name: 'Single Bed with Storage (5ft × 3ft)', category: 'Furniture',
    price: 3500, originalPrice: 9000,
    seller: 'Pooja V.', sellerAvatar: 'PV', sellerRating: 4.6,
    condition: 'Good', posted: '1 week ago',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    description: 'Sturdy single bed with hydraulic storage. Small stain on headboard (shown in photo). Mattress not included.',
    location: 'HSR 27th Main', saved: false, featured: false,
  },
  {
    id: 8, name: 'Ola Electric S1 Air (2023)', category: 'Bikes',
    price: 75000, originalPrice: 95000,
    seller: 'Suresh N.', sellerAvatar: 'SN', sellerRating: 4.8,
    condition: 'Excellent', posted: '2 days ago',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    description: '2023 Ola S1 Air, 12,000 km, one owner, all documents clear. Battery health at 96%. Charger included.',
    location: 'Electronic City', saved: false, featured: true,
  },
  {
    id: 9, name: 'LG 32" FHD Monitor (2022)', category: 'Electronics',
    price: 9500, originalPrice: 18000,
    seller: 'Meera P.', sellerAvatar: 'MP', sellerRating: 4.7,
    condition: 'Like New', posted: '3 days ago',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    description: 'IPS panel, 75Hz, HDMI + VGA. Zero dead pixels. Comes with stand, HDMI cable, and original box.',
    location: 'Koramangala', saved: false, featured: false,
  },
  {
    id: 10, name: 'Data Structures & Algorithms Bundle (6 books)', category: 'Books',
    price: 600, originalPrice: 2200,
    seller: 'Aditya K.', sellerAvatar: 'AK', sellerRating: 4.5,
    condition: 'Good', posted: '6 hours ago',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80',
    description: 'CLRS, CTCI, Grokking Algorithms, Leetcode patterns notebook, and 2 more. Light underlining in 2 books.',
    location: 'HSR Layout', saved: false, featured: false,
  },
  {
    id: 11, name: 'Godrej Refrigerator 260L (2021)', category: 'Appliances',
    price: 12000, originalPrice: 25000,
    seller: 'Ravi S.', sellerAvatar: 'RS', sellerRating: 4.6,
    condition: 'Good', posted: '4 days ago',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80',
    description: '260L double door, 3-star, works great. Minor dent on side panel, but functionally perfect. Buyer arranges transport.',
    location: 'BTM 2nd Stage', saved: false, featured: false,
  },
  {
    id: 12, name: 'Ergonomic Office Chair', category: 'Furniture',
    price: 4200, originalPrice: 12000,
    seller: 'Anjali S.', sellerAvatar: 'AS', sellerRating: 4.9,
    condition: 'Like New', posted: '2 days ago',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80',
    description: 'Green Soul Evoq chair, adjustable lumbar, armrests, and height. Used for 6 months WFH, switching to standing desk.',
    location: 'Bellandur Gate', saved: false, featured: false,
  },
  {
    id: 13, name: 'Sony WH-1000XM4 Headphones', category: 'Electronics',
    price: 13500, originalPrice: 28000,
    seller: 'Dev T.', sellerAvatar: 'DT', sellerRating: 4.8,
    condition: 'Excellent', posted: '1 day ago',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    description: 'Best ANC headphones. Bought 1 year ago, used lightly. Original box, all accessories, and warranty till Dec 2025.',
    location: 'Haralur Road', saved: false, featured: true,
  },
  {
    id: 14, name: 'Washing Machine (Samsung 6.5kg)', category: 'Appliances',
    price: 10000, originalPrice: 22000,
    seller: 'Priya L.', sellerAvatar: 'PL', sellerRating: 4.7,
    condition: 'Good', posted: '1 week ago',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80',
    description: 'Top-load fully automatic. Works perfectly, no issues. Selling because shifting to a PG. Buyer arranges transport.',
    location: 'HSR Sector 2', saved: false, featured: false,
  },
  {
    id: 15, name: 'Cycle — Hero Sprint 26T (MTB)', category: 'Bikes',
    price: 4500, originalPrice: 9000,
    seller: 'Nishant P.', sellerAvatar: 'NP', sellerRating: 4.6,
    condition: 'Good', posted: '5 days ago',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80',
    description: '21-gear mountain bike, hydraulic brakes. Purchased 1.5 years ago, serviced 2 months back. Tyres recently changed.',
    location: 'Agara Lake, HSR', saved: false, featured: false,
  },
];

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Bikes', 'Books', 'Appliances'];

const CAT_CONFIG = {
  Electronics: { color: '#0284C7', bg: 'rgba(2,132,199,0.1)',   icon: '💻' },
  Furniture:   { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   icon: '🪑' },
  Bikes:       { color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: '🏍️' },
  Books:       { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  icon: '📚' },
  Appliances:  { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   icon: '🏠' },
};

const CONDITION_CONFIG = {
  'Excellent': { color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  'Like New':  { color: '#0284C7', bg: 'rgba(2,132,199,0.1)' },
  'Good':      { color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  'Fair':      { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ item, onSave }) {
  const catCfg = CAT_CONFIG[item.category] || CAT_CONFIG.Electronics;
  const condCfg = CONDITION_CONFIG[item.condition] || CONDITION_CONFIG.Good;
  const discount = Math.round((1 - item.price / item.originalPrice) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.84)',
        border: item.featured ? '1.5px solid rgba(109,74,255,0.25)' : '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(18px)',
        boxShadow: item.featured ? '0 6px 28px rgba(109,74,255,0.12)' : '0 4px 20px rgba(109,74,255,0.07)',
        transition: 'all 0.28s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      whileHover={{ y: -6, boxShadow: '0 20px 52px rgba(109,74,255,0.15)' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={item.image}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {item.featured && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(109,74,255,0.9)', color: '#fff', padding: '3px 10px', borderRadius: 999, backdropFilter: 'blur(8px)' }}>⭐ Featured</span>}
          <span style={{ fontSize: 10.5, fontWeight: 600, background: `${catCfg.color}dd`, color: '#fff', padding: '3px 10px', borderRadius: 999 }}>{catCfg.icon} {item.category}</span>
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave(item.id)}
          style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', transition: 'transform 0.2s', color: item.saved ? '#7C3AED' : '#9CA3AF' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >{item.saved ? '🔖' : '🔖'}</button>

        {/* Discount badge */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(5,150,105,0.9)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
          {discount}% off
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Name */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 660, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 8 }}>{item.name}</div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>₹{item.price.toLocaleString()}</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{item.originalPrice.toLocaleString()}</span>
        </div>

        {/* Condition + posted */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 999, color: condCfg.color, background: condCfg.bg }}>{item.condition}</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>• {item.posted}</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>📍 {item.location}</span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>{item.description}</div>

        {/* Seller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '10px 12px', background: 'rgba(109,74,255,0.04)', border: '1px solid rgba(109,74,255,0.1)', borderRadius: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(109,74,255,0.12)', border: '1.5px solid rgba(109,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{item.sellerAvatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.seller}</div>
            <div style={{ fontSize: 11, color: '#F59E0B' }}>★ {item.sellerRating}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Seller</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(109,74,255,0.28)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,74,255,0.38)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,74,255,0.28)'; }}
          >View Details</button>
          <button
            style={{ background: 'rgba(109,74,255,0.06)', border: '1.5px solid rgba(109,74,255,0.15)', color: 'var(--primary)', padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,74,255,0.06)'; }}
          >📞 Contact</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuySell({ onNavigate }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState(LISTINGS);
  const [sortBy, setSortBy] = useState('newest');

  let filtered = listings.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'discount') filtered = [...filtered].sort((a, b) => (1 - b.price / b.originalPrice) - (1 - a.price / a.originalPrice));

  const handleSave = (id) => setListings(prev => prev.map(l => l.id === id ? { ...l, saved: !l.saved } : l));

  const totalValue = listings.reduce((a, l) => a + l.originalPrice, 0);
  const totalSavings = listings.reduce((a, l) => a + (l.originalPrice - l.price), 0);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,74,255,0.06) 0%, rgba(143,123,255,0.03) 100%)', borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>MARKETPLACE</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.8, marginBottom: 6 }}>
              Buy & sell <span style={{ color: 'var(--primary)' }}>locally</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', marginBottom: 24 }}>Pre-loved items from neighbours in your locality</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                { label: 'Active listings', val: listings.length, icon: '📦' },
                { label: 'Categories', val: 5, icon: '🗂️' },
                { label: 'Avg. savings', val: `${Math.round((totalSavings / totalValue) * 100)}%`, icon: '💰' },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 18px', backdropFilter: 'blur(12px)' }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
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
                placeholder="Search phones, furniture, bikes…"
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

      {/* Listings grid */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> listings
            {category !== 'All' && <span> in <strong style={{ color: 'var(--primary)' }}>{category}</strong></span>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(109,74,255,0.15)', borderRadius: 9, padding: '8px 14px', fontSize: 13, color: 'var(--text-secondary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest discount</option>
            </select>
            <button
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >+ Sell Something</button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(109,74,255,0.1)', borderRadius: 20 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No listings found</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Try a different category or search term</div>
              <button onClick={() => { setCategory('All'); setSearch(''); }} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Show all listings</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
              {filtered.map(item => (
                <ListingCard key={item.id} item={item} onSave={handleSave} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
