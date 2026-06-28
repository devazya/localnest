import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocalityNetwork from '../components/hero/LocalityNetwork';
import { COMMUNITY_POSTS, EVENT_DATA, LOCAL_PULSE, PG_DATA } from '../data/index';
import { supabase } from '../services/supabase/client';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────
   LIVE ACTIVITIES (floating card cycle)
───────────────────────────────────── */
const ACTIVITIES = [
  { id:1, nodeId:'rides',  icon:'🚗', title:'Ride to Electronic City', sub:'2 seats left',            route:'rideshare' },
  { id:2, nodeId:'events', icon:'📅', title:'Weekend Football',         sub:'Today at 6:00 PM',        route:'events'    },
  { id:3, nodeId:'pg',     icon:'🏠', title:'GreenNest PG',             sub:'₹8,500 · Available now',  route:'pgs'       },
  { id:4, nodeId:'cafe',   icon:'☕', title:'Brew Cafe',                 sub:'20% OFF today',           route:'shops'     },
  { id:5, nodeId:'gym',    icon:'💪', title:"Gold's Gym",               sub:'Free trial today',         route:'gyms'      },
];

function useLiveActivity() {
  const [current, setCurrent] = useState(ACTIVITIES[0]);
  const idx = useRef(0);
  useEffect(() => {
    const show = () => {
      setCurrent(ACTIVITIES[idx.current % ACTIVITIES.length]);
      idx.current++;
      setTimeout(() => setCurrent(null), 4000);
    };
    const t1 = setTimeout(show, 1200);
    const iv = setInterval(show, 6000);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);
  return current;
}

/* ─────────────────────────────────────
   LIVE UPDATES section data
───────────────────────────────────── */
const LIVE_UPDATES = [
  { id:1, icon:'🚗', title:'Ride to Electronic City', sub:'2 seats left',      route:'rideshare' },
  { id:2, icon:'⚽', title:'Weekend Football Match',   sub:'Today 6 PM',         route:'events'    },
  { id:3, icon:'☕', title:'Cafe 20% OFF\nGareo 30% OFF', sub:'Green Sector',   route:'shops'     },
];

/* ─────────────────────────────────────
   UPCOMING EVENTS section data
───────────────────────────────────── */
const UPCOMING_EVENTS = [
  {
    id:1, icon:'⚽', bg:'#FFF3E0',
    title:'Weekend Football Match',
    time:'Today • 6:00 PM',
    location:'Green Park, Koramangala',
    avatars:['#6D4AFF','#EC4899','#10B981'],
    count:24,
  },
  {
    id:2, icon:'🧘', bg:'#E8F5E9',
    title:'Community Yoga Session',
    time:'Tomorrow • 7:00 AM',
    location:'Sunrise Park',
    avatars:['#F59E0B','#6D4AFF','#3B82F6'],
    count:18,
  },
  {
    id:3, icon:'🎤', bg:'#F3E8FF',
    title:'Open Mic Night',
    time:'25 May • 7:30 PM',
    location:'The Local Cafe',
    avatars:['#EF4444','#10B981','#6D4AFF'],
    count:35,
  },
];

/* ─────────────────────────────────────
   POST TAG CONFIG
───────────────────────────────────── */
const POST_TAG = {
  announcement: { label:'Announcement', color:'#D97706', bg:'rgba(217,119,6,0.1)' },
  ride:         { label:'Ride',          color:'#0284C7', bg:'rgba(2,132,199,0.1)' },
  event:        { label:'Event',         color:'#7C3AED', bg:'rgba(124,58,237,0.1)' },
  'buy-sell':   { label:'Buy/Sell',      color:'#059669', bg:'rgba(5,150,105,0.1)' },
  roommate:     { label:'Roommate',      color:'#EC4899', bg:'rgba(236,72,153,0.1)' },
  help:         { label:'Help',          color:'#6B7280', bg:'rgba(107,114,128,0.1)' },
};

/* ═══════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════ */

/* ── Top header ── */
function HomeHeader({ onNavigate }) {
  const { user } = useAuth();
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const emoji    = h < 12 ? '👋' : h < 17 ? '☀️' : '🌙';

  return (
    <div style={{ padding:'16px 20px 0', background:'#fff' }}>
      {/* Location + Notif + Avatar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <button style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'rgba(109,74,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:13.5, fontWeight:700, color:'#0D0820', lineHeight:1.2, display:'flex', alignItems:'center', gap:4 }}>
              Green Sector
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>Bangalore</div>
          </div>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button style={{ position:'relative', width:38, height:38, borderRadius:11, background:'#fff', border:'1.5px solid rgba(0,0,0,0.07)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 6px rgba(0,0,0,0.07)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{ position:'absolute', top:5, right:5, width:15, height:15, background:'#EF4444', borderRadius:'50%', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:7.5, fontWeight:800, color:'#fff' }}>3</span>
          </button>
          {user ? (
            <img
              src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=6D4AFF&color=fff`}
              alt="avatar"
              onClick={() => onNavigate('profile')}
              style={{ width:40, height:40, borderRadius:13, objectFit:'cover', cursor:'pointer', border:'2px solid rgba(109,74,255,0.18)' }}
            />
          ) : (
            <button onClick={() => onNavigate('profile')} style={{ width:40, height:40, borderRadius:13, background:'#E9E5FF', border:'2px solid rgba(109,74,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:26, fontWeight:800, color:'#0D0820', fontFamily:'var(--font-display)', letterSpacing:-0.5, lineHeight:1.18 }}>
          {greeting}! {emoji}
        </div>
        <div style={{ fontSize:13.5, color:'#6B7280', marginTop:5 }}>
          Discover, connect &amp; belong to your locality
        </div>
      </div>
    </div>
  );
}

/* ── Locality Network Card ── */
function NetworkCard({ onNavigate, liveActivity }) {
  return (
    <div style={{ margin:'0 20px 20px', background:'#fff', border:'1.5px solid rgba(109,74,255,0.08)', borderRadius:22, overflow:'hidden', boxShadow:'0 4px 24px rgba(109,74,255,0.09), 0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Card header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'14px 18px 10px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
            <span style={{ width:7, height:7, background:'#10B981', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 5px rgba(16,185,129,0.65)' }} />
            <span style={{ fontSize:10, fontWeight:800, color:'#9CA3AF', letterSpacing:1.3, textTransform:'uppercase' }}>LOCAL PULSE</span>
          </div>
          <div style={{ fontSize:13, color:'#4B5563', fontWeight:500 }}>Live community activity</div>
        </div>
        <div style={{ background:'rgba(109,74,255,0.08)', border:'1.5px solid rgba(109,74,255,0.14)', borderRadius:99, padding:'5px 13px', display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:6, height:6, background:'#10B981', borderRadius:'50%', display:'inline-block' }} />
          <span style={{ fontSize:12, fontWeight:700, color:'#6D4AFF' }}>186 online</span>
        </div>
      </div>

      {/* SVG Network */}
      <div style={{ height:276, position:'relative' }}>
        <LocalityNetwork onNavigate={onNavigate} highlightNode={liveActivity?.nodeId} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════ */
export default function Home({ onNavigate }) {
  const liveActivity = useLiveActivity();

  const fu = (delay = 0) => ({
    initial:{ opacity:0, y:14 },
    whileInView:{ opacity:1, y:0 },
    viewport:{ once:true, margin:'-24px' },
    transition:{ duration:0.4, ease:[0.22,1,0.36,1], delay },
  });

  return (
    <div style={{ background:'#F5F4FF', minHeight:'100vh', paddingBottom:'calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px)' }}>

      {/* ── Header ── */}
      <HomeHeader onNavigate={onNavigate} />

      {/* ── Locality Network (Local Pulse) ── */}
      <motion.div {...fu(0)} style={{ marginTop:4 }}>
        <NetworkCard onNavigate={onNavigate} liveActivity={liveActivity} />
      </motion.div>

      {/* ── Live Updates ── */}
      <motion.section {...fu(0.05)} style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 20px', marginBottom:14 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'#9CA3AF', letterSpacing:1.2, textTransform:'uppercase' }}>LIVE UPDATES</span>
          <span style={{ background:'#6D4AFF', color:'#fff', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:99, letterSpacing:0.4 }}>LIVE</span>
        </div>
        <div style={{ display:'flex', gap:12, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:4, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
          {LIVE_UPDATES.map(item => (
            <motion.button
              key={item.id}
              whileTap={{ scale:0.97 }}
              onClick={() => onNavigate(item.route)}
              style={{
                flexShrink:0, width:145,
                background:'#fff', border:'1.5px solid rgba(109,74,255,0.08)',
                borderRadius:18, padding:'14px 14px 16px',
                boxShadow:'0 2px 14px rgba(0,0,0,0.07)',
                cursor:'pointer', textAlign:'left',
                display:'flex', flexDirection:'column', gap:8,
              }}
            >
              <div style={{ fontSize:28 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1D1D1F', lineHeight:1.3, marginBottom:4, whiteSpace:'pre-line' }}>{item.title}</div>
                <div style={{ fontSize:11.5, color:'#6D4AFF', fontWeight:600 }}>{item.sub}</div>
              </div>
            </motion.button>
          ))}
          <div style={{ width:8, flexShrink:0 }} />
        </div>
      </motion.section>

      {/* ── Upcoming Events ── */}
      <motion.section {...fu(0.08)} style={{ padding:'0 20px', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'#0D0820', letterSpacing:-0.3, margin:0 }}>
            Upcoming Events
          </h2>
          <button onClick={() => onNavigate('events')} style={{ fontSize:13, fontWeight:600, color:'#6D4AFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>
            View all
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {UPCOMING_EVENTS.map(ev => (
            <motion.button
              key={ev.id}
              whileTap={{ scale:0.985 }}
              onClick={() => onNavigate('events')}
              style={{
                display:'flex', alignItems:'center', gap:14,
                background:'#fff', border:'1px solid rgba(0,0,0,0.06)',
                borderRadius:18, padding:'14px 16px',
                boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
                cursor:'pointer', textAlign:'left', width:'100%',
              }}
            >
              {/* Event icon */}
              <div style={{
                width:52, height:52, borderRadius:14, flexShrink:0,
                background:ev.bg,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:26,
              }}>
                {ev.icon}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#1D1D1F', lineHeight:1.3, marginBottom:3 }}>{ev.title}</div>
                <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:2 }}>{ev.time}</div>
                <div style={{ fontSize:12, color:'#9CA3AF' }}>{ev.location}</div>
              </div>

              {/* Avatar stack + count */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
                <div style={{ display:'flex' }}>
                  {ev.avatars.map((color, i) => (
                    <div key={i} style={{
                      width:26, height:26, borderRadius:'50%',
                      background:color, border:'2px solid #fff',
                      marginLeft: i > 0 ? -9 : 0,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize:11.5, color:'#6D4AFF', fontWeight:700 }}>+{ev.count}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

    </div>
  );
}
