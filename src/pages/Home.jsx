import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocalityNetwork from '../components/hero/LocalityNetwork';
import { supabase } from '../services/supabase/client';
import Segment1Home from '../components/home/segment1/Segment1Home';

/* Hero photo slideshow removed — replaced with an atmospheric gradient.
   SLIDESHOW_IMAGES / useSlideshow intentionally removed; the future
   animated neighbourhood hero will replace this space. */

/* ─────────────────────────────────────
   LIVE ACTIVITIES (floating card cycle) — static UI, intentional
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
   LIVE UPDATES — static UI cards, intentional
───────────────────────────────────── */
const LIVE_UPDATES = [
  { id:1, icon:'🚗', title:'Ride Available',        sub:'Vikram → Electronic City • 2 seats left',   tag:'RIDE',    tagColor:'#0284C7', tagBg:'rgba(2,132,199,0.1)',   route:'rideshare' },
  { id:2, icon:'☕', title:'Cafe Aroma – 20% OFF',  sub:'New cafe opened 500m away',                 tag:'OFFER',   tagColor:'#059669', tagBg:'rgba(5,150,105,0.1)',   route:'shops'     },
  { id:3, icon:'⚡', title:'Power Cut Tonight',     sub:'Sectors 3–6 from 11PM to 1AM',              tag:'ALERT',   tagColor:'#D97706', tagBg:'rgba(217,119,6,0.1)',   route:'community' },
  { id:4, icon:'🚧', title:'Road Work – 5th Main',  sub:'Plan alternate routes this week',           tag:'NOTICE',  tagColor:'#7C3AED', tagBg:'rgba(124,58,237,0.1)', route:'community' },
  { id:5, icon:'🏏', title:'Cricket This Sunday',   sub:'Box cricket at Green Arena • 15 interested', tag:'SPORTS',  tagColor:'#6D4AFF', tagBg:'rgba(109,74,255,0.1)', route:'events'    },
  { id:6, icon:'🐾', title:'Lost Brown Labrador',   sub:'Last seen near Cubbon Park',                tag:'LOST',    tagColor:'#EF4444', tagBg:'rgba(239,68,68,0.1)',  route:'community' },
  { id:7, icon:'🔔', title:'Apartment AGM – Sat',   sub:'Block C Clubhouse at 10AM',                 tag:'NOTICE',  tagColor:'#7C3AED', tagBg:'rgba(124,58,237,0.1)', route:'community' },
];

/* ─────────────────────────────────────
   DEALS & OFFERS — static UI, intentional (no deals table in schema)
───────────────────────────────────── */
const DEALS = [
  { id:1, name:'Cafe Brew',    offer:'Buy 1 Get 1',   sub:'All Beverages',         dist:'650m',   emoji:'☕', color:'#FFF3E0', accent:'#F59E0B', route:'shops' },
  { id:2, name:'District',     offer:'25% OFF',       sub:'Movie Tickets',          dist:'1.2 km', emoji:'🎬', color:'#EDE9FE', accent:'#6D4AFF', route:'shops' },
  { id:3, name:"Gold's Gym",  offer:'7 Days Free',   sub:'Trial membership',       dist:'800m',   emoji:'💪', color:'#ECFDF5', accent:'#059669', route:'gyms'  },
  { id:4, name:"Domino's",    offer:'₹200 OFF',      sub:'Orders above ₹399',      dist:'1.5 km', emoji:'🍕', color:'#FEF2F2', accent:'#EF4444', route:'shops' },
  { id:5, name:'Green Salon',  offer:'40% OFF',       sub:'All Services',           dist:'1.5 km', emoji:'✂️', color:'#F5F3FF', accent:'#7C3AED', route:'shops' },
  { id:6, name:'Playo Sports', offer:'Book @ ₹150',   sub:'Badminton & Football',   dist:'500m',   emoji:'🏸', color:'#EFF6FF', accent:'#3B82F6', route:'shops' },
];

/* ─────────────────────────────────────
   NEARBY BUSINESSES — static UI, intentional (shops page has real data)
───────────────────────────────────── */
const NEARBY_BUSINESSES = [
  { id:1, name:'Starbucks',       type:'Café',     rating:'4.6', dist:'300m',  offer:'20% off all frappuccinos', emoji:'☕', color:'#ECFDF5', sponsored:true,  route:'shops' },
  { id:2, name:'Playo Sports',    type:'Sports',   rating:'4.8', dist:'500m',  offer:'Book a slot from ₹150',    emoji:'🏸', color:'#EFF6FF', sponsored:false, route:'shops' },
  { id:3, name:'Apollo Pharmacy', type:'Medical',  rating:'4.5', dist:'200m',  offer:'15% off on generic meds',  emoji:'💊', color:'#FEF2F2', sponsored:false, route:'shops' },
  { id:4, name:'Chai Point',      type:'Café',     rating:'4.3', dist:'800m',  offer:'Buy 2 get 1 free today',   emoji:'🍵', color:'#FFF3E0', sponsored:true,  route:'shops' },
  { id:5, name:"Domino's",       type:'Food',     rating:'4.1', dist:'1.5 km', offer:'₹200 OFF above ₹399',     emoji:'🍕', color:'#FEF2F2', sponsored:false, route:'shops' },
];

/* ─────────────────────────────────────
   ACTIVE COMMUNITIES — static UI, intentional
───────────────────────────────────── */
const COMMUNITIES = [
  { name:'🏸 Badminton',   color:'rgba(109,74,255,0.1)',  text:'#6D4AFF' },
  { name:'📸 Photography', color:'rgba(59,130,246,0.1)',  text:'#3B82F6' },
  { name:'🚴 Cycling',     color:'rgba(34,197,94,0.1)',   text:'#059669' },
  { name:'💪 Gym',         color:'rgba(239,68,68,0.1)',   text:'#EF4444' },
  { name:'💻 Coding',      color:'rgba(245,158,11,0.1)',  text:'#D97706' },
  { name:'⚽ Football',    color:'rgba(139,92,246,0.1)',  text:'#7C3AED' },
  { name:'🏃 Running',     color:'rgba(20,184,166,0.1)',  text:'#0D9488' },
  { name:'🎵 Music',       color:'rgba(244,63,94,0.1)',   text:'#E11D48' },
];

/* ─────────────────────────────────────
   Helpers
───────────────────────────────────── */
function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

// Map community post type to tag config
const POST_TAG_CONFIG = {
  announcement: { label:'ANNOUNCEMENT', color:'#D97706', bg:'rgba(217,119,6,0.1)',   icon:'📢' },
  ride:         { label:'RIDE',          color:'#0284C7', bg:'rgba(2,132,199,0.1)',   icon:'🚗' },
  event:        { label:'EVENT',         color:'#7C3AED', bg:'rgba(124,58,237,0.1)',  icon:'🎉' },
  'buy-sell':   { label:'BUY/SELL',      color:'#059669', bg:'rgba(5,150,105,0.1)',   icon:'🛒' },
  roommate:     { label:'ROOMMATE',      color:'#EC4899', bg:'rgba(236,72,153,0.1)',  icon:'🏠' },
  help:         { label:'HELP',          color:'#6B7280', bg:'rgba(107,114,128,0.1)', icon:'🆘' },
  post:         { label:'POST',          color:'#6D4AFF', bg:'rgba(109,74,255,0.1)',  icon:'💬' },
};

// Event category → gradient
const EVENT_GRAD = {
  Sports:          'linear-gradient(135deg,#059669,#064E3B)',
  Meetups:         'linear-gradient(135deg,#7C3AED,#4F1FA3)',
  'Study Groups':  'linear-gradient(135deg,#D97706,#92400E)',
  'Weekend Trips': 'linear-gradient(135deg,#0284C7,#1E3A5F)',
  Networking:      'linear-gradient(135deg,#DC2626,#7F1D1D)',
  Cultural:        'linear-gradient(135deg,#9333EA,#4A1D96)',
  Workshop:        'linear-gradient(135deg,#0891B2,#164E63)',
  Other:           'linear-gradient(135deg,#6B7280,#374151)',
  meetup:          'linear-gradient(135deg,#7C3AED,#4F1FA3)',
  workshop:        'linear-gradient(135deg,#0891B2,#164E63)',
  party:           'linear-gradient(135deg,#EC4899,#831843)',
  sports:          'linear-gradient(135deg,#059669,#064E3B)',
  cultural:        'linear-gradient(135deg,#9333EA,#4A1D96)',
  other:           'linear-gradient(135deg,#6B7280,#374151)',
};

const EVENT_ICON = {
  Sports:'⚽', Meetups:'🎉', 'Study Groups':'📚', 'Weekend Trips':'🏕️',
  Networking:'🤝', Cultural:'🎭', Workshop:'🛠️', Other:'📌',
  meetup:'🎉', workshop:'🛠️', party:'🎊', sports:'⚽', cultural:'🎭', other:'📌',
};

/* ═══════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════ */

/* ── Ride Hub Bottom Sheet ── */
const RIDE_PRICES = {
  uber:   [
    { type:'UberGo', time:'3 min', price:'₹120' },
    { type:'Sedan',  time:'5 min', price:'₹180' },
    { type:'UberXL', time:'8 min', price:'₹240' },
  ],
  ola:    [
    { type:'Mini',  time:'4 min', price:'₹110' },
    { type:'Prime', time:'6 min', price:'₹165' },
    { type:'Auto',  time:'2 min', price:'₹85'  },
    { type:'Bike',  time:'1 min', price:'₹45'  },
  ],
  rapido: [
    { type:'Bike', time:'2 min', price:'₹40'  },
    { type:'Auto', time:'3 min', price:'₹80'  },
    { type:'Cab',  time:'5 min', price:'₹115' },
  ],
};

function RideSheet({ onClose }) {
  const [tab, setTab]           = useState('compare');
  const [destination, setDest]  = useState('');
  const [searched, setSearched] = useState(false);
  const [form, setForm]         = useState({ from:'Green Sector, Bangalore', to:'', time:'', seats:'1', amount:'', gender:'Any', notes:'' });

  const handleSearch = () => { if (destination.trim()) setSearched(true); };
  const updateForm   = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,8,32,0.55)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', zIndex:300 }} />
      <motion.div
        initial={{ y:'100%' }}
        animate={{ y:0 }}
        exit={{ y:'100%' }}
        transition={{ type:'spring', damping:28, stiffness:300 }}
        style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderRadius:'32px 32px 0 0', zIndex:301, maxHeight:'88vh', overflowY:'auto', paddingBottom:'calc(env(safe-area-inset-bottom,0px) + 24px)', boxShadow:'0 -8px 40px rgba(109,74,255,0.18)' }}
      >
        <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
          <div style={{ width:40, height:4, borderRadius:99, background:'rgba(0,0,0,0.1)' }} />
        </div>
        <div style={{ display:'flex', margin:'8px 20px 0', background:'#F3F0FF', borderRadius:14, padding:4 }}>
          {[{id:'compare',label:'🚗 Compare Rides'},{id:'community',label:'🤝 Community Ride'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'9px 0', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all 180ms ease', background:tab===t.id?'#6D4AFF':'transparent', color:tab===t.id?'#fff':'#7C6FCD' }}>{t.label}</button>
          ))}
        </div>

        {tab === 'compare' && (
          <div style={{ padding:'20px 20px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'#F8F7FF', borderRadius:14, padding:'12px 14px', marginBottom:10 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#22C55E', flexShrink:0, display:'inline-block' }} />
              <div>
                <div style={{ fontSize:11, color:'#9CA3AF' }}>Current location</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#0D0820' }}>Green Sector, Bangalore</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'#F8F7FF', border:'1.5px solid #EDE9FE', borderRadius:14, padding:'12px 14px', marginBottom:16 }}>
              <span style={{ width:8, height:8, borderRadius:2, background:'#6D4AFF', flexShrink:0, display:'inline-block' }} />
              <input type="text" placeholder="Where to?" value={destination} onChange={e => setDest(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSearch()} style={{ flex:1, border:'none', background:'transparent', fontSize:14, fontWeight:500, color:'#0D0820', fontFamily:'var(--font-sans)', outline:'none' }} />
              {destination && (
                <button onClick={handleSearch} style={{ background:'#6D4AFF', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, padding:'6px 14px', cursor:'pointer', fontFamily:'var(--font-sans)' }}>Go</button>
              )}
            </div>
            {searched ? (
              <>
                <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:14 }}>Rides to <strong style={{ color:'#0D0820' }}>{destination}</strong></div>
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
                  {Object.entries(RIDE_PRICES).map(([provider, rides]) => (
                    <div key={provider} style={{ background:'#F8F7FF', borderRadius:16, padding:'14px 16px', border:'1px solid #EDE9FE' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0D0820', marginBottom:10, textTransform:'capitalize', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ width:10, height:10, borderRadius:'50%', background: provider==='uber'?'#000':provider==='ola'?'#FFCC00':'#F5A623', display:'inline-block' }} />{provider}
                      </div>
                      {rides.map(r => (
                        <div key={r.type} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                          <span style={{ fontSize:13, color:'#4A4060' }}>{r.type}</span>
                          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                            <span style={{ fontSize:12, color:'#9CA3AF' }}>{r.time}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:'#6D4AFF', minWidth:40, textAlign:'right' }}>{r.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {['Uber','Ola','Rapido'].map(p => (
                  <button key={p} onClick={() => window.open(p==='Uber'?'uber://':p==='Ola'?'olacabs://':'rapido://', '_blank')} style={{ display:'block', width:'100%', marginBottom:10, padding:'14px', background:'linear-gradient(135deg,#6D4AFF,#8B5CF6)', border:'none', borderRadius:14, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-sans)' }}>Book on {p} →</button>
                ))}
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#C4BAE8', fontSize:14 }}>Enter a destination to compare ride prices</div>
            )}
          </div>
        )}

        {tab === 'community' && (
          <div style={{ padding:'20px 20px 0' }}>
            <p style={{ fontSize:13, color:'#6B7280', marginBottom:16, lineHeight:1.6 }}>Already booking a ride? Let neighbours split the fare with you.</p>
            {[
              { label:'Leaving from', key:'from', type:'text', placeholder:'Green Sector, Bangalore' },
              { label:'Destination',  key:'to',   type:'text', placeholder:'Electronic City, Phase 1' },
              { label:'Departure time', key:'time', type:'datetime-local' },
              { label:'Seats available', key:'seats', type:'number', placeholder:'2' },
              { label:'Contribution per seat (₹)', key:'amount', type:'number', placeholder:'80' },
              { label:'Notes', key:'notes', type:'text', placeholder:'I am booking Uber Go' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#9CA3AF', marginBottom:6 }}>{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} value={form[field.key]} onChange={e => updateForm(field.key, e.target.value)} style={{ width:'100%', boxSizing:'border-box', background:'#F8F7FF', border:'1.5px solid #EDE9FE', borderRadius:14, padding:'12px 14px', fontSize:14, color:'#0D0820', fontFamily:'var(--font-sans)', outline:'none' }} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#9CA3AF', marginBottom:6 }}>Gender preference</label>
              <div style={{ display:'flex', gap:8 }}>
                {['Any','Women only','Men only'].map(g => (
                  <button key={g} onClick={() => updateForm('gender',g)} style={{ padding:'8px 14px', borderRadius:99, border:'1.5px solid', borderColor:form.gender===g?'#6D4AFF':'#EDE9FE', background:form.gender===g?'#EDE9FE':'#fff', color:form.gender===g?'#6D4AFF':'#9CA3AF', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-sans)' }}>{g}</button>
                ))}
              </div>
            </div>
            <button style={{ width:'100%', background:'linear-gradient(135deg,#6D4AFF,#8B5CF6)', border:'none', borderRadius:16, padding:'15px', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-sans)' }}>Post Ride 🚀</button>
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ── Locality Network Card (solid card — sits on the white content sheet) ── */
function NetworkCard({ onNavigate, liveActivity, onlineCount }) {
  return (
    <div style={{ background:'#ffffff', border:'1px solid rgba(109,74,255,0.06)', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 48px -20px rgba(109,74,255,0.16), 0 2px 8px rgba(24,14,64,0.03)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'18px 20px 10px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
            <span style={{ width:6, height:6, background:'#3E8368', borderRadius:'50%', display:'inline-block' }} />
            <span style={{ fontSize:9.5, fontWeight:700, color:'#ABA6BF', letterSpacing:1.2, textTransform:'uppercase' }}>Local Pulse</span>
          </div>
          <div style={{ fontSize:13, color:'#241B3D', fontWeight:500 }}>Live community activity</div>
        </div>
        <div style={{ background:'#F5F3FA', borderRadius:99, padding:'5px 12px', display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:5, height:5, background:'#3E8368', borderRadius:'50%', display:'inline-block' }} />
          <span style={{ fontSize:11, fontWeight:600, color:'#5B5568' }}>{onlineCount || 0} online</span>
        </div>
      </div>
      <div style={{ height:200, position:'relative' }}>
        <LocalityNetwork onNavigate={onNavigate} highlightNode={liveActivity?.nodeId} />
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, onViewAll }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', marginBottom:14 }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'#0D0820', letterSpacing:-0.3, margin:0 }}>{title}</h2>
      {onViewAll && (
        <button onClick={onViewAll} style={{ fontSize:13, fontWeight:600, color:'#6D4AFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>View All →</button>
      )}
    </div>
  );
}

/* ── Ride Hub Card ── */
function RideHub({ onOpen }) {
  const UberCar = () => (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
      <ellipse cx="36" cy="37" rx="26" ry="3" fill="rgba(0,0,0,0.10)"/>
      <rect x="5" y="20" width="60" height="15" rx="5" fill="#1A1A2E"/>
      <path d="M14 20 C16 7 24 4 31 4 L45 4 C52 4 57 9 59 20Z" fill="#16213E"/>
      <path d="M18 20 C20 10 26 7 31 7 L45 7 C52 7 56 13 58 20Z" fill="rgba(140,200,255,0.22)"/>
      <rect x="17" y="8" width="12" height="10" rx="1.5" fill="rgba(140,200,255,0.18)"/>
      <rect x="31" y="7" width="16" height="11" rx="1.5" fill="rgba(140,200,255,0.22)"/>
      <circle cx="18" cy="34" r="6" fill="#0D0D1A"/><circle cx="18" cy="34" r="3" fill="#374151"/><circle cx="18" cy="34" r="1.2" fill="#9CA3AF"/>
      <circle cx="54" cy="34" r="6" fill="#0D0D1A"/><circle cx="54" cy="34" r="3" fill="#374151"/><circle cx="54" cy="34" r="1.2" fill="#9CA3AF"/>
      <rect x="62" y="22" width="6" height="4" rx="1.2" fill="#FEF3C7"/>
      <rect x="4" y="22" width="5" height="4" rx="1.2" fill="#EF4444" opacity="0.7"/>
    </svg>
  );
  const OlaCar = () => (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
      <ellipse cx="36" cy="37" rx="26" ry="3" fill="rgba(0,0,0,0.10)"/>
      <rect x="5" y="20" width="60" height="15" rx="5" fill="#14532D"/>
      <path d="M14 20 C16 7 24 4 31 4 L45 4 C52 4 57 9 59 20Z" fill="#166534"/>
      <path d="M18 20 C20 10 26 7 31 7 L45 7 C52 7 56 13 58 20Z" fill="rgba(74,222,128,0.20)"/>
      <rect x="17" y="8" width="12" height="10" rx="1.5" fill="rgba(74,222,128,0.16)"/>
      <rect x="31" y="7" width="16" height="11" rx="1.5" fill="rgba(74,222,128,0.20)"/>
      <circle cx="18" cy="34" r="6" fill="#052E16"/><circle cx="18" cy="34" r="3" fill="#166534"/><circle cx="18" cy="34" r="1.2" fill="#4ADE80"/>
      <circle cx="54" cy="34" r="6" fill="#052E16"/><circle cx="54" cy="34" r="3" fill="#166534"/><circle cx="54" cy="34" r="1.2" fill="#4ADE80"/>
      <rect x="62" y="22" width="6" height="4" rx="1.2" fill="#FEF3C7"/>
      <rect x="4" y="22" width="5" height="4" rx="1.2" fill="#FFCC00" opacity="0.9"/>
    </svg>
  );
  const RapidoBike = () => (
    <svg width="72" height="42" viewBox="0 0 72 42" fill="none">
      <ellipse cx="36" cy="40" rx="24" ry="2.5" fill="rgba(0,0,0,0.10)"/>
      <circle cx="14" cy="30" r="10" fill="#78350F"/><circle cx="14" cy="30" r="6.5" fill="#92400E"/><circle cx="14" cy="30" r="3" fill="#F59E0B"/><circle cx="14" cy="30" r="1.2" fill="#FEF3C7"/>
      <circle cx="56" cy="30" r="10" fill="#78350F"/><circle cx="56" cy="30" r="6.5" fill="#92400E"/><circle cx="56" cy="30" r="3" fill="#F59E0B"/><circle cx="56" cy="30" r="1.2" fill="#FEF3C7"/>
      <line x1="14" y1="30" x2="36" y2="26" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 28 C18 18 26 14 34 14 L46 15 C52 16 58 22 58 28" stroke="#D97706" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M28 14 C32 6 42 5 50 10 L58 18 L52 22 L34 20 Z" fill="#F59E0B"/>
      <ellipse cx="38" cy="16" rx="9" ry="5" fill="#D97706"/>
      <path d="M26 18 C30 14 44 14 50 18 L46 22 L28 22 Z" fill="#78350F"/>
      <line x1="56" y1="18" x2="56" y2="30" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="14" x2="62" y2="12" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="62" cy="12" r="2.5" fill="#1A1A1A"/>
      <ellipse cx="61" cy="20" rx="4" ry="3" fill="#FEF3C7"/>
      <path d="M14 32 C10 34 6 34 4 33" stroke="#92400E" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const PROVIDERS = [
    { name:'Uber',   logo:'U', logoBg:'#000000', logoColor:'#ffffff', Car: UberCar   },
    { name:'Ola',    logo:'O', logoBg:'#22C55E', logoColor:'#ffffff', Car: OlaCar    },
    { name:'Rapido', logo:'R', logoBg:'#F59E0B', logoColor:'#ffffff', Car: RapidoBike },
  ];

  return (
    <div style={{ margin:'0 20px 24px', borderRadius:24, overflow:'hidden', background:'linear-gradient(105deg, #ffffff 0%, #ffffff 52%, #6D4AFF 52%, #5B3FE0 100%)', boxShadow:'0 2px 0 rgba(109,74,255,0.06), 0 14px 44px rgba(109,74,255,0.16)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'18px 18px 14px' }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:'#0D0820', fontFamily:'var(--font-display)', letterSpacing:0.3, textTransform:'uppercase', marginBottom:3 }}>Compare &amp; Choose Ride</div>
          <div style={{ fontSize:11.5, color:'#9CA3AF', lineHeight:1.5 }}>Find the best ride or share and split the bill</div>
        </div>
        <motion.button whileTap={{ scale:0.95 }} onClick={onOpen} style={{ display:'flex', alignItems:'center', gap:5, background:'#ffffff', border:'1.5px solid #6D4AFF', borderRadius:99, padding:'8px 14px', color:'#6D4AFF', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, fontFamily:'var(--font-sans)', boxShadow:'0 2px 10px rgba(109,74,255,0.14)', whiteSpace:'nowrap' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Where to?
        </motion.button>
      </div>
      <div style={{ display:'flex', alignItems:'stretch', minHeight:170, position:'relative' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:9, padding:'4px 8px 14px 16px', background:'linear-gradient(90deg, #ffffff 60%, rgba(109,74,255,0.0) 100%)', position:'relative', zIndex:1 }}>
          {PROVIDERS.map(p => (
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', borderRadius:14, padding:'7px 10px 7px 8px', boxShadow:'0 1px 0 rgba(255,255,255,1) inset, 0 4px 14px rgba(109,74,255,0.12), 0 1px 4px rgba(0,0,0,0.06)', border:'1px solid rgba(109,74,255,0.10)' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:p.logoBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.20)' }}>
                <span style={{ fontSize:11, fontWeight:900, color:p.logoColor, fontFamily:'var(--font-display)', letterSpacing:-0.5 }}>{p.logo}</span>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:'#0D0820', fontFamily:'var(--font-sans)', flex:1, letterSpacing:-0.2 }}>{p.name}</span>
              <div style={{ flexShrink:0 }}><p.Car /></div>
            </div>
          ))}
        </div>
        <div style={{ width:118, flexShrink:0, position:'relative', overflow:'hidden', background:'transparent' }}>
          <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(90deg, #ffffff 0%, rgba(109,74,255,0) 35%)', pointerEvents:'none' }}/>
          <svg viewBox="0 0 118 185" preserveAspectRatio="xMidYMax meet" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} fill="none">
            <circle cx="80" cy="25" r="55" fill="rgba(255,255,255,0.05)"/>
            <rect x="2" y="80" width="20" height="105" rx="3" fill="rgba(255,255,255,0.09)"/>
            <rect x="24" y="52" width="24" height="133" rx="3" fill="rgba(255,255,255,0.12)"/>
            <rect x="50" y="72" width="16" height="113" rx="2" fill="rgba(255,255,255,0.08)"/>
            <rect x="68" y="40" width="22" height="145" rx="3" fill="rgba(255,255,255,0.12)"/>
            <rect x="92" y="68" width="20" height="117" rx="2" fill="rgba(255,255,255,0.09)"/>
            {[[5,85],[5,97],[5,109],[12,85],[12,97],[12,109],[27,57],[27,69],[27,81],[27,93],[35,57],[35,69],[35,81],[53,77],[53,89],[53,101],[59,77],[59,89],[71,46],[71,58],[71,70],[71,82],[80,46],[80,58],[80,70],[80,82],[95,73],[95,85],[95,97],[103,73],[103,85],[103,97]].map(([x,y],i) => (
              <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="#FDE68A" opacity="0.75"/>
            ))}
            <rect x="0" y="160" width="118" height="25" fill="rgba(0,0,0,0.28)"/>
            {[6,28,50,72,94].map((x,i) => <rect key={i} x={x} y="170" width="12" height="2" rx="1" fill="rgba(255,255,255,0.22)"/>)}
            <circle cx="78" cy="18" r="13" fill="#ffffff" opacity="0.96"/>
            <circle cx="78" cy="18" r="5.5" fill="#6D4AFF"/>
            <line x1="78" y1="31" x2="78" y2="45" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
            <g>
              <animateTransform attributeName="transform" attributeType="XML" type="translate" values="-50 0;170 0" dur="3.8s" repeatCount="indefinite" calcMode="linear"/>
              <rect x="0" y="147" width="40" height="12" rx="3.5" fill="#C4B5FD"/>
              <path d="M4 147 C6 138 11 135 18 135 L28 135 C35 135 38 140 40 147Z" fill="#A78BFA"/>
              <rect x="6" y="137" width="13" height="8" rx="1.5" fill="rgba(200,220,255,0.35)"/>
              <rect x="21" y="136" width="15" height="9" rx="1.5" fill="rgba(200,220,255,0.38)"/>
              <circle cx="9" cy="159" r="4.5" fill="#4A3880"/><circle cx="9" cy="159" r="2.2" fill="#7C6FCD"/>
              <circle cx="30" cy="159" r="4.5" fill="#4A3880"/><circle cx="30" cy="159" r="2.2" fill="#7C6FCD"/>
              <rect x="37" y="150" width="4" height="3" rx="0.8" fill="#FEF3C7"/>
            </g>
          </svg>
        </div>
      </div>
      <div style={{ padding:'12px 18px 18px', background:'#ffffff' }}>
        <motion.button whileTap={{ scale:0.98 }} onClick={onOpen} style={{ display:'block', width:'100%', padding:'15px 20px', background:'linear-gradient(135deg,#6D4AFF 0%,#8B5CF6 100%)', border:'none', borderRadius:16, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-sans)', letterSpacing:0.2, textAlign:'center', boxShadow:'0 4px 0 rgba(80,40,180,0.35), 0 8px 24px rgba(109,74,255,0.30)' }}>
          Compare Ride
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════ */
export default function Home({ onNavigate }) {
  const liveActivity  = useLiveActivity();
  const [rideSheetOpen, setRideSheetOpen] = useState(false);

  // ── Live data from Supabase ────────────────────────────────────────────────
  const [communityPosts, setCommunityPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [onlineCount,    setOnlineCount]    = useState(0);

  // Fetch latest 5 community posts for the Buzz section
  const fetchCommunityPosts = useCallback(async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('id, title, content, type, created_at, profiles:user_id(full_name, username)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setCommunityPosts(data);
  }, []);

  // Fetch next 4 upcoming events
  const fetchUpcomingEvents = useCallback(async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('events')
      .select('id, title, category, event_date, event_time, location, attendee_count, max_capacity, images')
      .gte('event_date', now.split('T')[0])
      .eq('status', 'active')
      .order('event_date', { ascending: true })
      .limit(4);
    if (data) setUpcomingEvents(data);
  }, []);

  // Active users count (rough proxy: profiles updated in last 30 min)
  const fetchOnlineCount = useCallback(async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('updated_at', thirtyMinAgo);
    if (count !== null) setOnlineCount(count);
  }, []);

  useEffect(() => {
    fetchCommunityPosts();
    fetchUpcomingEvents();
    fetchOnlineCount();
  }, [fetchCommunityPosts, fetchUpcomingEvents, fetchOnlineCount]);

  // Realtime: new community post → prepend to buzz
  useEffect(() => {
    const ch = supabase
      .channel('home-community-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, async (payload) => {
        const { data } = await supabase
          .from('community_posts')
          .select('id, title, content, type, created_at, profiles:user_id(full_name, username)')
          .eq('id', payload.new.id)
          .single();
        if (data) setCommunityPosts(prev => [data, ...prev].slice(0, 5));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  // ── Animation helper ────────────────────────────────────────────────────────
  const fu = (delay = 0) => ({
    initial:{ opacity:0, y:14 },
    whileInView:{ opacity:1, y:0 },
    viewport:{ once:true, margin:'-24px' },
    transition:{ duration:0.4, ease:[0.22,1,0.36,1], delay },
  });

  // ── Derived data for Community Buzz ────────────────────────────────────────
  const buzzPosts = communityPosts.map(post => {
    const cfg = POST_TAG_CONFIG[post.type] || POST_TAG_CONFIG.post;
    const authorName = post.profiles?.full_name || post.profiles?.username || 'Community Member';
    return {
      id:       post.id,
      icon:     cfg.icon,
      title:    post.title || post.content?.slice(0, 60) || 'Community Post',
      sub:      post.content?.slice(0, 100) || '',
      tag:      cfg.label,
      tagColor: cfg.color,
      time:     timeAgo(post.created_at),
      author:   authorName,
    };
  });

  // ── Derived data for Upcoming Events ───────────────────────────────────────
  const eventCards = upcomingEvents.map(ev => {
    const grad = EVENT_GRAD[ev.category] || EVENT_GRAD.other;
    const icon = EVENT_ICON[ev.category] || '📅';
    const dateStr = formatEventDate(ev.event_date);
    const parts = dateStr.split(' ');
    return {
      id:       ev.id,
      icon,
      bg:       grad,
      dateParts: parts,           // ['SAT', '28', 'JUN']
      title:    ev.title,
      time:     ev.event_time ? ev.event_time.slice(0,5) + ' Onwards' : 'Time TBD',
      location: ev.location || 'Venue TBD',
      count:    ev.attendee_count || 0,
    };
  });

  return (
    <div style={{ background:'#ffffff', minHeight:'100vh', paddingBottom:'calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px)' }}>

      {/* ── Home Segment 1 (Design Spec v2.3) ──
          Hero (header/greeting/weather/search) → Friend → Primary Module Row
          → Context Filters → Dynamic Content Feed. Everything below this is
          out of Segment 1's scope and untouched by this rebuild. */}
      <Segment1Home onNavigate={onNavigate} nearbyPostCount={communityPosts.length} />

      <motion.div {...fu(0.02)} style={{ padding:'24px 20px 0', background:'#ffffff' }}>
        <NetworkCard onNavigate={onNavigate} liveActivity={liveActivity} onlineCount={onlineCount} />
      </motion.div>

      <div style={{ background:'#ffffff' }}>

        {/* ── Ride Hub ── */}
        <motion.div {...fu(0.04)} style={{ paddingTop:4, background:'#ffffff' }}>
          <RideHub onOpen={() => setRideSheetOpen(true)} />
        </motion.div>

        {/* ── Live Updates ── */}
        <motion.section {...fu(0.06)} style={{ marginBottom:32, background:'#ffffff' }}>
          <SectionHeader title="Live Updates" onViewAll={() => onNavigate('community')} />
          <div style={{ display:'flex', gap:14, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:8, background:'#ffffff', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {LIVE_UPDATES.map(item => (
              <motion.button key={item.id} whileTap={{ scale:0.97 }} onClick={() => onNavigate(item.route)} style={{ flexShrink:0, width:210, background:'#ffffff', border:'none', borderRadius:22, padding:'16px', boxShadow:'0 8px 28px rgba(109,74,255,0.10), 0 2px 8px rgba(109,74,255,0.06)', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:item.tagBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{item.icon}</div>
                <div>
                  <div style={{ display:'inline-block', fontSize:9.5, fontWeight:800, color:item.tagColor, background:item.tagBg, padding:'3px 10px', borderRadius:99, marginBottom:8, letterSpacing:0.6 }}>{item.tag}</div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:'#1D1D1F', lineHeight:1.35, marginBottom:5 }}>{item.title}</div>
                  <div style={{ fontSize:11.5, color:'#9CA3AF', lineHeight:1.45 }}>{item.sub}</div>
                </div>
              </motion.button>
            ))}
            <div style={{ width:6, flexShrink:0 }} />
          </div>
        </motion.section>

        {/* ── Deals & Offers ── */}
        <motion.section {...fu(0.08)} style={{ marginBottom:32, background:'#ffffff' }}>
          <SectionHeader title="Deals &amp; Offers" onViewAll={() => onNavigate('shops')} />
          <div style={{ display:'flex', gap:14, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:8, background:'#ffffff', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {DEALS.map(deal => (
              <motion.button key={deal.id} whileTap={{ scale:0.97 }} onClick={() => onNavigate(deal.route)} style={{ flexShrink:0, width:178, background:'#ffffff', border:'none', borderRadius:24, overflow:'hidden', boxShadow:'0 8px 28px rgba(109,74,255,0.10), 0 2px 8px rgba(109,74,255,0.05)', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column' }}>
                <div style={{ height:110, background:deal.color, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ fontSize:52 }}>{deal.emoji}</span>
                  <div style={{ position:'absolute', top:10, left:10, background:deal.accent, borderRadius:99, padding:'4px 12px', fontSize:11, fontWeight:800, color:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>{deal.offer}</div>
                </div>
                <div style={{ padding:'12px 14px 16px' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0D0820', marginBottom:3 }}>{deal.name}</div>
                  <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:6 }}>{deal.sub}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:12 }}>📍 {deal.dist} away</div>
                  <div style={{ background:'#EDE9FE', borderRadius:12, padding:'8px 0', textAlign:'center', fontSize:12, fontWeight:700, color:'#6D4AFF' }}>Claim Offer</div>
                </div>
              </motion.button>
            ))}
            <div style={{ width:6, flexShrink:0 }} />
          </div>
        </motion.section>

        {/* ── Upcoming Events (live from Supabase) ── */}
        <motion.section {...fu(0.10)} style={{ marginBottom:32, background:'#ffffff' }}>
          <SectionHeader title="Upcoming Events" onViewAll={() => onNavigate('events')} />
          <div style={{ display:'flex', gap:14, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:8, background:'#ffffff', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {eventCards.length > 0 ? eventCards.map(ev => (
              <motion.button key={ev.id} whileTap={{ scale:0.97 }} onClick={() => onNavigate('events')} style={{ flexShrink:0, width:210, background:'#ffffff', border:'none', borderRadius:24, overflow:'hidden', boxShadow:'0 8px 28px rgba(109,74,255,0.10), 0 2px 8px rgba(109,74,255,0.05)', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column' }}>
                <div style={{ height:128, background:ev.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ fontSize:52 }}>{ev.icon}</span>
                  <div style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', borderRadius:12, padding:'5px 10px', display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ fontSize:8, fontWeight:800, color:'rgba(255,255,255,0.8)', letterSpacing:0.8, lineHeight:1.2 }}>{ev.dateParts[0]}</div>
                    <div style={{ fontSize:16, fontWeight:900, color:'#fff', lineHeight:1.1 }}>{ev.dateParts[1]}</div>
                    <div style={{ fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:0.5 }}>{ev.dateParts[2]}</div>
                  </div>
                  <div style={{ position:'absolute', top:10, right:10, background:'rgba(255,255,255,0.22)', backdropFilter:'blur(6px)', borderRadius:99, padding:'4px 10px' }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:'#fff' }}>{ev.count} going</span>
                  </div>
                </div>
                <div style={{ padding:'14px 16px 16px' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0D0820', lineHeight:1.35, marginBottom:7 }}>{ev.title}</div>
                  <div style={{ fontSize:11.5, color:'#9CA3AF', marginBottom:4 }}>📍 {ev.location}</div>
                  <div style={{ fontSize:11.5, color:'#6D4AFF', fontWeight:600 }}>⏰ {ev.time}</div>
                </div>
              </motion.button>
            )) : (
              <div style={{ padding:'24px 0', fontSize:13, color:'#9CA3AF' }}>No upcoming events yet — <button onClick={() => onNavigate('events')} style={{ color:'#6D4AFF', background:'none', border:'none', fontWeight:600, cursor:'pointer', fontSize:13 }}>view all events</button></div>
            )}
            <div style={{ width:6, flexShrink:0 }} />
          </div>
        </motion.section>

        {/* ── Community Buzz (live from Supabase) ── */}
        <motion.section {...fu(0.12)} style={{ marginBottom:32, background:'#ffffff' }}>
          <SectionHeader title="Community Buzz" onViewAll={() => onNavigate('community')} />
          <div style={{ display:'flex', flexDirection:'column', gap:14, padding:'0 20px' }}>
            {buzzPosts.length > 0 ? buzzPosts.map(post => (
              <motion.button key={post.id} whileTap={{ scale:0.985 }} onClick={() => onNavigate('community')} style={{ display:'flex', alignItems:'center', gap:14, background:'#ffffff', border:'none', borderRadius:20, padding:'14px 16px', boxShadow:'0 6px 24px rgba(109,74,255,0.08), 0 2px 6px rgba(109,74,255,0.04)', cursor:'pointer', textAlign:'left', width:'100%', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:post.tagColor, borderRadius:'20px 0 0 20px' }} />
                <div style={{ marginLeft:8, width:40, height:40, borderRadius:12, background:`${post.tagColor}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{post.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:9, fontWeight:800, color:post.tagColor, background:`${post.tagColor}15`, padding:'2px 8px', borderRadius:99, letterSpacing:0.5 }}>{post.tag}</span>
                    <span style={{ fontSize:10, color:'#9CA3AF' }}>{post.time}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0D0820', lineHeight:1.3, marginBottom:3, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{post.title}</div>
                  <div style={{ fontSize:11, color:'#6B7280', lineHeight:1.4, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{post.sub}</div>
                </div>
              </motion.button>
            )) : (
              <div style={{ padding:'24px 0', fontSize:13, color:'#9CA3AF' }}>No community posts yet — <button onClick={() => onNavigate('community')} style={{ color:'#6D4AFF', background:'none', border:'none', fontWeight:600, cursor:'pointer', fontSize:13 }}>be the first to post</button></div>
            )}
          </div>
        </motion.section>

        {/* ── Nearby Businesses ── */}
        <motion.section {...fu(0.14)} style={{ marginBottom:32, background:'#ffffff' }}>
          <SectionHeader title="Nearby Businesses" onViewAll={() => onNavigate('shops')} />
          <div style={{ display:'flex', gap:14, overflowX:'auto', paddingLeft:20, paddingRight:20, paddingBottom:8, background:'#ffffff', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {NEARBY_BUSINESSES.map(biz => (
              <motion.button key={biz.id} whileTap={{ scale:0.97 }} onClick={() => onNavigate(biz.route)} style={{ flexShrink:0, width:182, background:'#ffffff', border:'none', borderRadius:24, overflow:'hidden', boxShadow:'0 8px 28px rgba(109,74,255,0.10), 0 2px 8px rgba(109,74,255,0.05)', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column' }}>
                <div style={{ height:108, background:biz.color, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ fontSize:48 }}>{biz.emoji}</span>
                  {biz.sponsored && <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.45)', borderRadius:99, padding:'3px 10px', fontSize:9.5, fontWeight:700, color:'#fff' }}>Sponsored</div>}
                  <div style={{ position:'absolute', top:10, left:10, background:'rgba(255,255,255,0.95)', borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#0D0820' }}>⭐ {biz.rating}</div>
                </div>
                <div style={{ padding:'12px 14px 16px' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0D0820', marginBottom:2 }}>{biz.name}</div>
                  <div style={{ fontSize:11.5, color:'#9CA3AF', marginBottom:5 }}>{biz.type} · 📍 {biz.dist}</div>
                  <div style={{ fontSize:11.5, color:'#6D4AFF', fontWeight:600, marginBottom:12, lineHeight:1.4 }}>{biz.offer}</div>
                  <div style={{ background:'#EDE9FE', borderRadius:12, padding:'8px 0', textAlign:'center', fontSize:12, fontWeight:700, color:'#6D4AFF' }}>Visit →</div>
                </div>
              </motion.button>
            ))}
            <div style={{ width:6, flexShrink:0 }} />
          </div>
        </motion.section>

        {/* ── Active Communities ── */}
        <motion.section {...fu(0.16)} style={{ marginBottom:32, background:'#ffffff' }}>
          <SectionHeader title="Active Communities" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, padding:'0 20px' }}>
            {COMMUNITIES.map(c => (
              <motion.button key={c.name} whileTap={{ scale:0.95 }} onClick={() => onNavigate('community')} style={{ background:c.color, border:'none', borderRadius:99, padding:'11px 20px', fontSize:13, fontWeight:700, color:c.text, cursor:'pointer', fontFamily:'var(--font-sans)', boxShadow:'0 4px 12px rgba(109,74,255,0.10)' }}>{c.name}</motion.button>
            ))}
          </div>
        </motion.section>

      </div>

      <AnimatePresence>
        {rideSheetOpen && <RideSheet onClose={() => setRideSheetOpen(false)} />}
      </AnimatePresence>

    </div>
  );
}
