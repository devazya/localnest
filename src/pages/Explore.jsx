import { useState } from 'react';
import { motion } from 'framer-motion';
import { EVENT_DATA, PG_DATA } from '../data/index';
import {
  PGIcon, GymIcon, ShopsIcon, CafesIcon, BuySellIcon,
  RidesIcon, EventsIcon, ServicesIcon,
} from '../assets/icons/index.jsx';

/* ─────────────────────────────────────
   CATEGORIES
───────────────────────────────────── */
const POPULAR_CATS = [
  { id:'pgs',     label:'PG',         count:'243 listings', Icon: PGIcon,      bg:'#F0EDFF', route:'pgs'       },
  { id:'gyms',    label:'Gym',         count:'128 gyms',    Icon: GymIcon,     bg:'#F0EDFF', route:'gyms'      },
  { id:'shops',   label:'Shops',       count:'310+ shops',  Icon: ShopsIcon,   bg:'#EBF5FF', route:'shops'     },
  { id:'cafes',   label:'Cafes',       count:'85 cafes',    Icon: CafesIcon,   bg:'#FFF4EC', route:'shops'     },
  { id:'buysell', label:'Buy & Sell',  count:'420+ items',  Icon: BuySellIcon, bg:'#F0EDFF', route:'buysell'   },
  { id:'rides',   label:'Rides',       count:'54 rides',    Icon: RidesIcon,   bg:'#EBF5FF', route:'rideshare' },
  { id:'events',  label:'Events',      count:'38 events',   Icon: EventsIcon,  bg:'#FFF4EC', route:'events'    },
  { id:'services',label:'Services',    count:'120+ svcs',   Icon: ServicesIcon,bg:'#F0EDFF', route:'shops'     },
];

/* ─────────────────────────────────────
   UPCOMING EVENTS DATA
───────────────────────────────────── */
const EVENTS_DATA = [
  {
    id:1, title:'Weekend Football', location:'Green Park', going:24,
    month:'MAY', day:'18',
    image:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&q=75',
  },
  {
    id:2, title:'Yoga Morning', location:'Sunrise Park', going:32,
    month:'MAY', day:'20',
    image:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=75',
  },
  {
    id:3, title:'Open Mic Night', location:'Community Center', going:18,
    month:'MAY', day:'25',
    image:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=75',
  },
];

/* ─────────────────────────────────────
   RECOMMENDED
───────────────────────────────────── */
const RECOMMENDED = [
  {
    id:1, name:'Comfort Living PG', verified:true, route:'pgdetails',
    image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    rating:4.6, reviews:86, distance:'800m away',
    amenities:['Single Room','Wi-Fi'],
    price:'₹6,500', unit:'/mo',
  },
];

const FILTER_TABS = ['All','PG','Gym','Shops','Cafes','Events','Rides'];

/* ═══════════════════════════════════════════════
   EXPLORE PAGE
═══════════════════════════════════════════════ */
export default function Explore({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('All');
  const [favs, setFavs] = useState({});

  const toggleFav = (id) => setFavs(f => ({ ...f, [id]: !f[id] }));

  return (
    <div style={{ background:'#fff', minHeight:'100vh', paddingBottom:'calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px)' }}>

      {/* ── Page header ── */}
      <div style={{ padding:'14px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'#0D0820', margin:0, letterSpacing:-0.5 }}>
            Explore
          </h1>
          {/* Map icon */}
          <button style={{ width:38, height:38, borderRadius:11, background:'#F5F4FF', border:'1.5px solid rgba(109,74,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </button>
        </div>

        {/* Search + Filter row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:9, background:'#F7F6FF', border:'1.5px solid rgba(109,74,255,0.1)', borderRadius:13, padding:'0 14px', height:46 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize:13.5, color:'#9CA3AF' }}>Search PGs, Gyms, Shops...</span>
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:6, background:'#F7F6FF', border:'1.5px solid rgba(109,74,255,0.1)', borderRadius:13, padding:'0 14px', height:46, cursor:'pointer', flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            <span style={{ fontSize:13, fontWeight:600, color:'#6D4AFF' }}>Filters</span>
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none', paddingBottom:14 }}>
          {FILTER_TABS.map(tab => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale:0.94 }}
              style={{
                padding:'8px 18px', borderRadius:99, fontSize:13.5, fontWeight:600,
                cursor:'pointer', flexShrink:0, border:'1.5px solid',
                transition:'all 0.18s',
                background: activeTab===tab ? '#6D4AFF' : '#fff',
                color:       activeTab===tab ? '#fff'    : '#374151',
                borderColor: activeTab===tab ? '#6D4AFF' : 'rgba(0,0,0,0.1)',
                boxShadow:   activeTab===tab ? '0 3px 12px rgba(109,74,255,0.28)' : 'none',
              }}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Popular Categories ── */}
      <section style={{ padding:'0 20px', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'#0D0820', margin:0, letterSpacing:-0.3 }}>
            Explore Everything
          </h2>
          <button onClick={() => {}} style={{ fontSize:13, fontWeight:600, color:'#6D4AFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            View all
          </button>
        </div>

        {/* 4-col grid, 2 rows */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {POPULAR_CATS.map((cat, i) => (
            <motion.button
              key={cat.id}
              onClick={() => onNavigate(cat.route)}
              whileTap={{ scale:0.93 }}
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.3, delay:i*0.04, ease:[0.22,1,0.36,1] }}
              style={{
                background: cat.bg,
                border: 'none',
                borderRadius: 16,
                padding: '14px 6px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }}
            >
              {/* 3D clay icon from library */}
              <div style={{ width:54, height:54, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <cat.Icon size={54} />
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:'#0D0820', lineHeight:1.2 }}>{cat.label}</div>
                <div style={{ fontSize:10, color:'#9CA3AF', marginTop:2, fontWeight:500 }}>{cat.count}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'#0D0820', margin:0, letterSpacing:-0.3 }}>
            Upcoming Events
          </h2>
          <button onClick={() => onNavigate('events')} style={{ fontSize:13, fontWeight:600, color:'#6D4AFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            View all
          </button>
        </div>

        <div style={{ display:'flex', gap:14, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:4, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
          {EVENTS_DATA.map(ev => (
            <motion.button
              key={ev.id}
              whileTap={{ scale:0.97 }}
              onClick={() => onNavigate('events')}
              style={{ width:176, flexShrink:0, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0 }}
            >
              <div style={{ position:'relative', height:128, borderRadius:16, overflow:'hidden', marginBottom:10 }}>
                <img src={ev.image} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                {/* Date badge */}
                <div style={{
                  position:'absolute', top:8, left:8,
                  background:'#EF4444', color:'#fff',
                  borderRadius:8, padding:'4px 8px', textAlign:'center', minWidth:40,
                }}>
                  <div style={{ fontSize:8, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase', lineHeight:1 }}>{ev.month}</div>
                  <div style={{ fontSize:18, fontWeight:800, lineHeight:1.1 }}>{ev.day}</div>
                </div>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'#0D0820', marginBottom:4, lineHeight:1.25 }}>
                {ev.title}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:6 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ fontSize:11.5, color:'#9CA3AF' }}>{ev.location}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ display:'flex' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:18, height:18, borderRadius:'50%', background:`hsl(${260+i*20},60%,${60+i*5}%)`, border:'2px solid #fff', marginLeft:i?-6:0 }} />
                  ))}
                </div>
                <span style={{ fontSize:11.5, color:'#6B7280', fontWeight:500 }}>{ev.going} going</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Recommended For You ── */}
      <section style={{ padding:'0 20px', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'#0D0820', margin:0, letterSpacing:-0.3 }}>
            Recommended for You
          </h2>
          <button onClick={() => onNavigate('pgs')} style={{ fontSize:13, fontWeight:600, color:'#6D4AFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            View all
          </button>
        </div>

        {RECOMMENDED.map(item => (
          <motion.div
            key={item.id}
            whileTap={{ scale:0.985 }}
            onClick={() => onNavigate(item.route)}
            style={{ display:'flex', gap:14, background:'#fff', border:'1.5px solid rgba(0,0,0,0.07)', borderRadius:18, overflow:'hidden', cursor:'pointer', boxShadow:'0 2px 14px rgba(0,0,0,0.07)', marginBottom:12 }}
          >
            <div style={{ width:110, height:110, flexShrink:0, position:'relative' }}>
              <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
            </div>
            <div style={{ flex:1, padding:'12px 14px 12px 0', minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontSize:14.5, fontWeight:700, color:'#0D0820', lineHeight:1.2, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {item.name}
                </div>
                <button onClick={e => { e.stopPropagation(); toggleFav(item.id); }} style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, marginLeft:6, padding:0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={favs[item.id]?'#EF4444':'none'} stroke={favs[item.id]?'#EF4444':'#9CA3AF'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap' }}>
                {item.verified && (
                  <span style={{ fontSize:10, fontWeight:700, color:'#059669', background:'rgba(5,150,105,0.1)', border:'1px solid rgba(5,150,105,0.2)', borderRadius:99, padding:'2px 7px', display:'flex', alignItems:'center', gap:3 }}>
                    ✓ Verified
                  </span>
                )}
                <span style={{ fontSize:11, color:'#F59E0B' }}>★</span>
                <span style={{ fontSize:11.5, fontWeight:600, color:'#0D0820' }}>{item.rating}</span>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>({item.reviews})</span>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>·</span>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>📍 {item.distance}</span>
              </div>
              <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                {item.amenities.map(a => (
                  <span key={a} style={{ fontSize:10.5, color:'#6B7280', background:'#F5F4FF', border:'1px solid rgba(109,74,255,0.12)', borderRadius:99, padding:'2px 8px', fontWeight:500 }}>{a}</span>
                ))}
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:'#0D0820', fontFamily:'var(--font-display)' }}>
                {item.price} <span style={{ fontSize:12, fontWeight:500, color:'#9CA3AF' }}>{item.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
