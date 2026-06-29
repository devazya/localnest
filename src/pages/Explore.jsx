import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────── */
const C = {
  purple:      '#6D4AFF',
  purpleDeep:  '#5538E8',
  purpleLight: '#8B5CF6',
  purpleBg:    '#F0EDFF',
  cardBg:      '#FCFAFF',
  cardShadow:  '0 12px 40px rgba(109,76,255,0.08), 0 2px 8px rgba(109,76,255,0.04)',
  cardShadowHover: '0 20px 60px rgba(109,76,255,0.14), 0 4px 16px rgba(109,76,255,0.08)',
  white:       '#ffffff',
  text:        '#0D0820',
  textMuted:   '#9CA3AF',
  textSub:     '#6B7280',
  border:      'rgba(109,74,255,0.08)',
  green:       '#22C55E',
  red:         '#EF4444',
  orange:      '#F59E0B',
  blue:        '#3B82F6',
};

/* ─────────────────────────────────────
   CATEGORY CHIPS  — "All" removed as per spec
───────────────────────────────────── */
const CATEGORIES = [
  { id:'pg',       label:'PG & Stays', emoji:'🏠' },
  { id:'food',     label:'Food & Cafe',emoji:'☕' },
  { id:'fitness',  label:'Fitness',    emoji:'💪' },
  { id:'shopping', label:'Shops',      emoji:'🛍' },
  { id:'events',   label:'Events',     emoji:'📅' },
  { id:'travel',   label:'Travel',     emoji:'🚗' },
  { id:'services', label:'Services',   emoji:'🛠' },
];

/* ─────────────────────────────────────
   MUST TRY
───────────────────────────────────── */
const MUST_TRY = [
  { id:1, title:'Cafe Aroma',    subtitle:'Best Coffee & Ambience',   badge:'TOP RATED',       badgeColor:'#6D4AFF', rating:4.8, reviews:256, image:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80' },
  { id:2, title:'Oye! Momos',   subtitle:'Best Momos in Town',       badge:'LOCAL FAVOURITE',  badgeColor:'#059669', rating:4.7, reviews:198, image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { id:3, title:'Nandi Hills',  subtitle:'Perfect Weekend Escape',   badge:'SUNRISE SPOT',     badgeColor:'#D97706', rating:4.9, reviews:312, image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
  { id:4, title:'The Book Nook',subtitle:'Cozy Book Cafe',           badge:'HIDDEN GEM',       badgeColor:'#7C3AED', rating:4.6, reviews:142, image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' },
  { id:5, title:'Cubbon Park',  subtitle:'Morning Walk Bliss',       badge:'COMMUNITY PICK',   badgeColor:'#0284C7', rating:4.8, reviews:421, image:'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80' },
];

/* ─────────────────────────────────────
   MAP STATS
───────────────────────────────────── */
const MAP_STATS = [
  { icon:'☕', label:'12 Cafes'       },
  { icon:'🏋', label:'8 Gyms'        },
  { icon:'🛍', label:'15 Shops'      },
  { icon:'🏠', label:'6 PGs & Stays' },
  { icon:'📅', label:'5 Events'      },
];

/* ─────────────────────────────────────
   MAP MARKERS
───────────────────────────────────── */
const MAP_MARKERS = [
  { id:'m1', lat:12.9719, lng:77.5946, color:'#6D4AFF', emoji:'💪', name:'IronCore Fitness',    category:'Gym',         dist:'800m',  rating:4.7, offer:'7 Days Free', isOpen:true  },
  { id:'m2', lat:12.9705, lng:77.5920, color:'#F59E0B', emoji:'☕', name:'Brew & Bites Cafe',   category:'Cafe',        dist:'450m',  rating:4.5, offer:'15% OFF',    isOpen:true  },
  { id:'m3', lat:12.9730, lng:77.5965, color:'#22C55E', emoji:'🛍', name:'D-Mart',              category:'Supermarket', dist:'900m',  rating:4.4, offer:'5% OFF',     isOpen:true  },
  { id:'m4', lat:12.9698, lng:77.5975, color:'#EF4444', emoji:'📅', name:'Weekend Yoga Class',  category:'Events',      dist:'600m',  rating:4.8, offer:'',           isOpen:true  },
  { id:'m5', lat:12.9745, lng:77.5935, color:'#3B82F6', emoji:'🏠', name:'GreenNest PG',        category:'PG',          dist:'1.2km', rating:4.6, offer:'Available',  isOpen:true  },
  { id:'m6', lat:12.9688, lng:77.5950, color:'#22C55E', emoji:'🛍', name:'More Supermarket',    category:'Supermarket', dist:'1.1km', rating:4.3, offer:'5% OFF',     isOpen:false },
  { id:'m7', lat:12.9712, lng:77.5988, color:'#6D4AFF', emoji:'💪', name:"Gold's Gym",          category:'Gym',         dist:'1.5km', rating:4.9, offer:'Free Trial', isOpen:true  },
];

/* ─────────────────────────────────────
   NEARBY PLACES
───────────────────────────────────── */
const NEARBY_PLACES = [
  { id:1, name:'Starbucks',         category:'Cafe',        dist:'650m',  rating:4.6, reviews:128, offer:'20% OFF',    isOpen:true,  image:'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=300&q=80' },
  { id:2, name:'IronCore Fitness',  category:'Gym',         dist:'800m',  rating:4.7, reviews:96,  offer:'7 Days Free',isOpen:true,  image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
  { id:3, name:'Brew & Bites Cafe', category:'Cafe',        dist:'450m',  rating:4.5, reviews:84,  offer:'15% OFF',    isOpen:true,  image:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=300&q=80' },
  { id:4, name:'D-Mart',            category:'Supermarket', dist:'900m',  rating:4.4, reviews:72,  offer:'5% OFF',     isOpen:true,  image:'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&q=80' },
  { id:5, name:'More Supermarket',  category:'Supermarket', dist:'1.1km', rating:4.3, reviews:56,  offer:'',           isOpen:false, image:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
];

const NEARBY_FILTERS = ['Nearest','Top Rated','Open Now','More'];

/* ─────────────────────────────────────
   WEEKEND PLANS
───────────────────────────────────── */
const WEEKEND_PLANS = [
  { id:1, title:'Nandi Hills Sunrise Trip', day:'SAT', date:'18', time:'Sat, 6:30 AM',  joined:4,  max:8,  badgeColor:'#EF4444', participants:['#6D4AFF','#EC4899','#10B981'], extra:3, image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
  { id:2, title:'Football Match',           day:'SUN', date:'19', time:'Sun, 7:00 AM',  joined:6,  max:10, badgeColor:'#EF4444', participants:['#F59E0B','#6D4AFF','#3B82F6'], extra:5, image:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80' },
  { id:3, title:'Cubbon Park Picnic',       day:'SAT', date:'18', time:'Sat, 3:00 PM',  joined:12, max:15, badgeColor:'#7C3AED', participants:['#10B981','#EC4899','#6D4AFF'], extra:5, image:'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=400&q=80' },
  { id:4, title:'Movie Night',              day:'SUN', date:'19', time:'Sun, 7:00 PM',  joined:9,  max:12, badgeColor:'#EF4444', participants:['#3B82F6','#F59E0B','#6D4AFF'], extra:9, image:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80' },
];

/* ─────────────────────────────────────
   LEAFLET SCRIPT LOADER
───────────────────────────────────── */
function useLeafletScript() {
  const [ready, setReady] = useState(!!window.L);
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

/* ─────────────────────────────────────
   REAL LEAFLET MAP COMPONENT
───────────────────────────────────── */
const LeafletMap = memo(function LeafletMap({ onMarkerClick, compact = false, onViewFullMap }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initMap = () => {
      const L = window.L;
      if (!L) { setTimeout(initMap, 100); return; }

      const CENTER = [12.9716, 77.5946];

      const map = L.map(containerRef.current, {
        center: CENTER,
        zoom: compact ? 14 : 15,
        zoomControl: !compact,
        scrollWheelZoom: !compact,
        dragging: !compact,
        attributionControl: false,
        tap: false,
      });

      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const makeIcon = (color, emoji) => L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${color};
          display:flex;align-items:center;justify-content:center;
          font-size:16px;
          box-shadow:0 4px 14px ${color}66;
          border:2.5px solid white;
          transition:transform 0.15s;
        ">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const youIcon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="background:#6D4AFF;color:#fff;font-size:10px;font-weight:700;border-radius:99px;padding:4px 12px;white-space:nowrap;box-shadow:0 2px 8px rgba(109,74,255,0.5);">You are here</div>
          <div style="width:14px;height:14px;border-radius:50%;background:#6D4AFF;border:3px solid white;box-shadow:0 0 0 6px rgba(109,74,255,0.2);"></div>
        </div>`,
        iconSize: [90, 48],
        iconAnchor: [45, 48],
      });

      L.marker(CENTER, { icon: youIcon }).addTo(map);

      MAP_MARKERS.forEach(m => {
        const marker = L.marker([m.lat, m.lng], { icon: makeIcon(m.color, m.emoji) }).addTo(map);
        marker.on('click', () => onMarkerClick && onMarkerClick(m));
        markersRef.current.push(marker);
      });
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, []); // eslint-disable-line

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {compact && (
        /* Transparent overlay captures tap → open full map */
        <div
          onClick={onViewFullMap}
          style={{ position: 'absolute', inset: 0, zIndex: 400, cursor: 'pointer', background: 'transparent' }}
        />
      )}
    </div>
  );
});

/* ─────────────────────────────────────
   COMPACT MAP CARD
   Full-width interactive map.
   Floating glass stats panel: bottom-left,
   intentionally sized so it never covers
   the centre of the map.
───────────────────────────────────── */
function ExploreMapCard({ onViewFullMap }) {
  const leafletReady    = useLeafletScript();
  const [selectedMarker, setSelectedMarker] = useState(null);

  return (
    /*
      Outer card — overflow:hidden is the ONLY thing
      that clips the map inside the rounded corners.
      No child should use position:fixed.
    */
    <div style={{
      margin: '0 20px',
      borderRadius: 28,
      overflow: 'hidden',
      position: 'relative',
      /* 340px map height as per spec */
      height: 340,
      background: '#E8EBF0',
      /* Premium map shadow */
      boxShadow:
        '0 20px 60px rgba(109,74,255,0.16),' +
        '0 6px 20px rgba(109,74,255,0.10),' +
        '0 2px 6px rgba(0,0,0,0.06)',
    }}>

      {/* ── Full-width real map ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {leafletReady ? (
          <LeafletMap compact onViewFullMap={onViewFullMap} onMarkerClick={setSelectedMarker} />
        ) : (
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        )}
      </div>

      {/*
        

      

      {/* ── Marker mini bottom-sheet (inside card) ── */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              zIndex: 600,
              background: C.white,
              borderRadius: '20px 20px 0 0',
              padding: '14px 16px 18px',
              boxShadow: '0 -6px 30px rgba(109,74,255,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: selectedMarker.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, border: '2px solid white',
                boxShadow: `0 4px 12px ${selectedMarker.color}44`,
                flexShrink: 0,
              }}>{selectedMarker.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{selectedMarker.name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: C.orange }}>★ {selectedMarker.rating}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>· {selectedMarker.dist}</span>
                  {selectedMarker.offer && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.purpleBg, borderRadius: 99, padding: '1px 7px' }}>{selectedMarker.offer}</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, color: selectedMarker.isOpen ? '#059669' : C.textMuted, background: selectedMarker.isOpen ? '#ECFDF5' : '#F3F4F6', borderRadius: 99, padding: '1px 7px' }}>
                    {selectedMarker.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                <motion.button whileTap={{ scale: 0.94 }} style={{ padding: '7px 14px', background: C.purple, border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Directions
                </motion.button>
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => setSelectedMarker(null)} style={{ padding: '7px 10px', background: C.purpleBg, border: 'none', borderRadius: 10, color: C.purple, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  ✕
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────
   FULL MAP PAGE  (dedicated screen)
───────────────────────────────────── */
function FullMapPage({ onClose }) {
  const leafletReady  = useLeafletScript();
  const [activeFilter, setActiveFilter] = useState('');
  const [selected, setSelected]         = useState(null);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: '#F1F3F4', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 700,
        padding: 'calc(env(safe-area-inset-top,0px) + 12px) 16px 10px',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.border}`,
        boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <motion.button whileTap={{ scale: 0.94 }} onClick={onClose}
            style={{ width: 38, height: 38, borderRadius: 12, background: C.purpleBg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </motion.button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#F7F6FF', border: `1.5px solid ${C.border}`, borderRadius: 13, padding: '0 13px', height: 42 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search on map..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: C.text, outline: 'none', fontFamily: 'var(--font-sans)' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '6px 11px', flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }}/>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669' }}>Live</span>
          </div>
        </div>
        {/* Category chips — "All" also removed from full map */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveFilter(activeFilter === cat.id ? '' : cat.id)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 99, border: '1.5px solid',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
                background: activeFilter === cat.id ? C.purple : C.white,
                color: activeFilter === cat.id ? '#fff' : C.textSub,
                borderColor: activeFilter === cat.id ? C.purple : C.border,
              }}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real full-screen map */}
      <div style={{ flex: 1, position: 'relative', marginTop: 116 }}>
        {leafletReady ? (
          <LeafletMap onMarkerClick={setSelected} />
        ) : (
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        )}
      </div>

      {/* Marker bottom sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 710, background: 'transparent' }} />
            <motion.div
              key="sheet"
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 720,
                background: C.white, borderRadius: '28px 28px 0 0',
                padding: '0 20px calc(env(safe-area-inset-bottom,0px) + 28px)',
                boxShadow: '0 -10px 50px rgba(109,74,255,0.18)',
              }}
            >
              <div style={{ width: 40, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 99, margin: '14px auto 18px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: selected.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, border: '3px solid white',
                  boxShadow: `0 6px 18px ${selected.color}55`, flexShrink: 0,
                }}>{selected.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{selected.category}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, color: C.orange, fontWeight: 600 }}>★ {selected.rating}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>· {selected.dist} away</span>
                    {selected.offer && <span style={{ fontSize: 11, fontWeight: 700, color: C.purple, background: C.purpleBg, borderRadius: 99, padding: '2px 9px' }}>{selected.offer}</span>}
                    <span style={{ fontSize: 11, fontWeight: 700, color: selected.isOpen ? '#059669' : C.textMuted, background: selected.isOpen ? '#ECFDF5' : '#F3F4F6', borderRadius: 99, padding: '2px 9px' }}>
                      {selected.isOpen ? '● Open Now' : '● Closed'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button whileTap={{ scale: 0.96 }} style={{ flex: 2, background: C.purple, border: 'none', borderRadius: 16, padding: '14px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(109,74,255,0.35)' }}>
                  Directions →
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} style={{ flex: 1, background: C.purpleBg, border: 'none', borderRadius: 16, padding: '14px', color: C.purple, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Details
                </motion.button>
                <motion.button whileTap={{ scale: 0.94 }} style={{ width: 48, background: '#FEF2F2', border: 'none', borderRadius: 16, padding: '14px 0', color: C.red, fontSize: 18, cursor: 'pointer' }}>
                  🔖
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   LAZY IMAGE with skeleton
───────────────────────────────────── */
function LazyImg({ src, alt, style: s }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr]       = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: C.purpleBg }}>
      {!loaded && !err && <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />}
      {err ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.purpleBg, fontSize: 28 }}>🏙️</div>
      ) : (
        <img
          src={src} alt={alt} loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          style={{ ...s, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPLORE PAGE
═══════════════════════════════════════════════ */
export default function Explore({ onNavigate }) {
  const { user }    = useAuth();
  /* No "all" default — first real category is pre-selected */
  const [activeCategory, setActiveCategory] = useState('pg');
  const [nearbyFilter, setNearbyFilter]     = useState('Nearest');
  const [bookmarks, setBookmarks]           = useState({});
  const [joinedPlans, setJoinedPlans]       = useState({});
  const [showFullMap, setShowFullMap]       = useState(false);
  const [searchFocused, setSearchFocused]   = useState(false);

  const toggleBookmark = useCallback((id) => setBookmarks(b => ({ ...b, [id]: !b[id] })), []);
  const toggleJoin     = useCallback((id) => setJoinedPlans(j => ({ ...j, [id]: !j[id] })), []);

  const fu = (delay = 0) => ({
    initial:     { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true, margin: '-16px' },
    transition:  { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay },
  });

  return (
    /*
      paddingBottom = nav height + safe area + 28px breathing room.
      28px is within the 24–32px spec.  No extra blank screen.
    */
    <div style={{
      background: C.white,
      minHeight: '100vh',
      paddingBottom: 'calc(var(--bottom-nav-h, 70px) + env(safe-area-inset-bottom, 0px) + 28px)',
    }}>

      {/* ══════════════════════════════
          STICKY HEADER + SEARCH + CHIPS
      ══════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: '0 4px 24px rgba(109,74,255,0.06)',
      }}>
        <div style={{ padding: '16px 20px 0' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.7, lineHeight: 1.15 }}>
                Explore
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 13, color: C.textMuted }}>Discover everything in</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>Green Sector</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={C.purple}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={{
                position: 'relative', width: 40, height: 40, borderRadius: 13,
                background: '#F7F6FF', border: `1.5px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, background: C.red, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>3</span>
              </button>
              {user ? (
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=6D4AFF&color=fff`}
                  alt="avatar"
                  onClick={() => onNavigate('profile')}
                  style={{ width: 40, height: 40, borderRadius: 13, objectFit: 'cover', cursor: 'pointer', border: `2px solid ${C.border}` }}
                />
              ) : (
                <button onClick={() => onNavigate('profile')} style={{ width: 40, height: 40, borderRadius: 13, background: C.purpleBg, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* Search row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.div
              animate={{ boxShadow: searchFocused ? `0 0 0 2.5px ${C.purple}, 0 4px 20px rgba(109,74,255,0.14)` : '0 4px 16px rgba(109,74,255,0.08)' }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                background: '#F7F6FF',
                border: `1.5px solid ${searchFocused ? C.purple : 'rgba(109,74,255,0.12)'}`,
                borderRadius: 16, padding: '0 12px', height: 48,
                transition: 'border-color 0.18s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search anything nearby..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: C.text, outline: 'none', fontFamily: 'var(--font-sans)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EDFFF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '4px 9px', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#22C55E"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Green Sector</span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              style={{
                width: 48, height: 48, borderRadius: 15,
                background: C.purpleBg, border: `1.5px solid rgba(109,74,255,0.14)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
            </motion.button>
          </div>

          {/* ── Category chips — "All" removed, starts with PG & Stays ── */}
          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 14,
          }}>
            {CATEGORIES.map((cat, i) => {
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    padding: '9px 14px',
                    borderRadius: 16,
                    minWidth: 64,
                    border: `1.5px solid ${active ? C.purple : 'rgba(109,74,255,0.1)'}`,
                    background: active ? C.purpleBg : C.white,
                    cursor: 'pointer',
                    boxShadow: active
                      ? '0 4px 18px rgba(109,74,255,0.22)'
                      : '0 2px 8px rgba(109,74,255,0.04)',
                    transition: 'all 0.18s',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: active ? 700 : 500,
                    color: active ? C.purple : C.textSub,
                    whiteSpace: 'nowrap',
                  }}>
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          SECTION 1 — MUST TRY IN BANGALORE
          Editorial cards, images dominate.
      ══════════════════════════════ */}
      <motion.section {...fu(0)} style={{ marginTop: 28, marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4 }}>
            Must Try in Bangalore ✨
          </h2>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: C.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingLeft: 20, paddingRight: 20, paddingBottom: 10, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {MUST_TRY.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.38 }}
              whileTap={{ scale: 0.972, y: -2 }}
              style={{
                width: 182,
                flexShrink: 0,
                background: C.cardBg,
                borderRadius: 24,               /* spec: 24px */
                boxShadow: '0 12px 40px rgba(109,76,255,0.08), 0 2px 8px rgba(109,76,255,0.04)',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Large editorial image — images dominate */}
              <div style={{ position: 'relative', height: 192 }}>
                <LazyImg
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Rich gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 52%)' }} />
                {/* Badge */}
                <div style={{
                  position: 'absolute', top: 11, left: 11,
                  background: item.badgeColor, color: '#fff',
                  fontSize: 8.5, fontWeight: 800, letterSpacing: 0.6,
                  padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
                }}>
                  {item.badge}
                </div>
                {/* Bookmark */}
                <motion.button
                  whileTap={{ scale: 0.78, rotate: -12 }}
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(`mt-${item.id}`); }}
                  style={{
                    position: 'absolute', top: 9, right: 9,
                    width: 33, height: 33, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.93)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.16)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24"
                    fill={bookmarks[`mt-${item.id}`] ? C.purple : 'none'}
                    stroke={bookmarks[`mt-${item.id}`] ? C.purple : '#6B7280'}
                    strokeWidth="2.2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </motion.button>
              </div>

              {/* Info — premium spacing */}
              <div style={{ padding: '14px 15px 16px' }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 3, lineHeight: 1.25 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 11, lineHeight: 1.4 }}>
                  {item.subtitle}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13, color: C.orange }}>★</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.rating}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>({item.reviews})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════
          SECTION 2 — EXPLORE ON MAP
          340px, premium shadow, 28px radius,
          increased spacing above & below.
      ══════════════════════════════ */}
      <motion.section {...fu(0.04)} style={{ marginBottom: 36 }}>
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={C.purple}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4 }}>
              Explore on Map
            </h2>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginLeft: 24 }}>See what's around you</div>
        </div>
        <ExploreMapCard onViewFullMap={() => setShowFullMap(true)} />
      </motion.section>

      {/* ══════════════════════════════
          SECTION 3 — NEARBY PLACES
          Taller images, floating cards.
      ══════════════════════════════ */}
      <motion.section {...fu(0.06)} style={{ marginBottom: 36 }}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4, marginBottom: 3 }}>
            Nearby Places
          </h2>
          <div style={{ fontSize: 13, color: C.textMuted }}>Top places near you</div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 10, paddingLeft: 20, paddingRight: 20, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NEARBY_FILTERS.map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.93 }}
              onClick={() => setNearbyFilter(f)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 16px', borderRadius: 99,
                border: `1.5px solid ${nearbyFilter === f ? C.purple : 'rgba(109,74,255,0.1)'}`,
                background: nearbyFilter === f ? C.purpleBg : C.white,
                color: nearbyFilter === f ? C.purple : C.textSub,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                boxShadow: nearbyFilter === f ? '0 4px 14px rgba(109,74,255,0.18)' : 'none',
                transition: 'all 0.16s',
              }}
            >
              {f === 'Nearest'  && <svg width="11" height="11" viewBox="0 0 24 24" fill={nearbyFilter === f ? C.purple : C.textMuted}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
              {f === 'Top Rated'&& <span>⭐</span>}
              {f === 'Open Now' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: nearbyFilter === f ? C.purple : C.green, display: 'inline-block' }}/>}
              {f === 'More'     && <span>···</span>}
              {f}
            </motion.button>
          ))}
        </div>

        {/* Floating cards — taller images, better shadow */}
        <div style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingRight: 20, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
          {NEARBY_PLACES.map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.970, y: -2 }}
              style={{
                width: 158,
                flexShrink: 0,
                background: C.cardBg,
                borderRadius: 24,                /* spec: 24px */
                boxShadow: '0 12px 40px rgba(109,76,255,0.08), 0 2px 8px rgba(109,76,255,0.04)',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Taller image */}
              <div style={{ position: 'relative', height: 142 }}>
                <LazyImg
                  src={place.image}
                  alt={place.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: place.isOpen ? 'rgba(22,163,74,0.88)' : 'rgba(100,116,139,0.85)',
                  color: '#fff', fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                  backdropFilter: 'blur(4px)',
                }}>
                  {place.isOpen ? 'Open' : 'Closed'}
                </div>
                <motion.button
                  whileTap={{ scale: 0.78, rotate: -12 }}
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(`np-${place.id}`); }}
                  style={{
                    position: 'absolute', top: 7, right: 7, width: 29, height: 29, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.93)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24"
                    fill={bookmarks[`np-${place.id}`] ? C.purple : 'none'}
                    stroke={bookmarks[`np-${place.id}`] ? C.purple : '#6B7280'}
                    strokeWidth="2.2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </motion.button>
              </div>

              {/* Info — improved spacing */}
              <div style={{ padding: '12px 13px 14px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3, lineHeight: 1.3 }}>{place.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 7 }}>{place.category} · {place.dist}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: place.offer ? 8 : 11 }}>
                  <span style={{ fontSize: 11.5, color: C.orange }}>★</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>{place.rating}</span>
                  <span style={{ fontSize: 10.5, color: C.textMuted }}>({place.reviews})</span>
                </div>
                {place.offer && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.purpleBg, borderRadius: 99, padding: '3px 9px', display: 'inline-block', marginBottom: 10 }}>
                    {place.offer}
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%', padding: '9px 0',
                    background: 'linear-gradient(135deg, #6D4AFF, #8B5CF6)',
                    border: 'none', borderRadius: 12,
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(109,74,255,0.3)',
                  }}
                >
                  Visit →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════
          SECTION 4 — WEEKEND PLANS
          Keep layout, improve image,
          stronger shadow, better spacing.
          marginBottom: 0 — page ends here.
      ══════════════════════════════ */}
      <motion.section {...fu(0.08)} style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4, marginBottom: 3 }}>
              Weekend Plans Near You
            </h2>
            <div style={{ fontSize: 13, color: C.textMuted }}>Join others or create your own plan</div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: C.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginTop: 2 }}>
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingRight: 20, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 6 }}>
          {WEEKEND_PLANS.map((plan, i) => {
            const joined = joinedPlans[plan.id];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.968, y: -2 }}
                style={{
                  width: 178,
                  flexShrink: 0,
                  background: C.cardBg,
                  borderRadius: 24,              /* spec: 24px */
                  /* Stronger shadow for weekend plan cards */
                  boxShadow:
                    '0 14px 44px rgba(109,76,255,0.10),' +
                    '0 4px 12px rgba(109,76,255,0.06)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {/* Cover image — larger */}
                <div style={{ position: 'relative', height: 158 }}>
                  <LazyImg
                    src={plan.image}
                    alt={plan.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 52%)' }} />
                  {/* Date badge */}
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: plan.badgeColor, color: '#fff',
                    borderRadius: 12, padding: '5px 10px', textAlign: 'center',
                    minWidth: 44,
                    boxShadow: `0 4px 12px ${plan.badgeColor}66`,
                  }}>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', lineHeight: 1 }}>{plan.day}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{plan.date}</div>
                  </div>
                </div>

                {/* Info — better spacing */}
                <div style={{ padding: '13px 14px 15px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 5 }}>{plan.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>
                    {plan.time} · {plan.joined}/{plan.max} Joined
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Avatar stack */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {plan.participants.map((color, idx) => (
                        <div key={idx} style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: color, border: '2px solid white',
                          marginLeft: idx > 0 ? -8 : 0,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        }} />
                      ))}
                      <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6, fontWeight: 600 }}>+{plan.extra}</span>
                    </div>
                    {/* Join button */}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={(e) => { e.stopPropagation(); toggleJoin(plan.id); }}
                      style={{
                        padding: '6px 16px',
                        background: joined ? C.purple : 'transparent',
                        border: `1.5px solid ${joined ? C.purple : 'rgba(0,0,0,0.14)'}`,
                        borderRadius: 99,
                        color: joined ? '#fff' : C.textSub,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.18s',
                        boxShadow: joined ? '0 4px 14px rgba(109,74,255,0.35)' : 'none',
                      }}
                    >
                      {joined ? '✓ Joined' : 'Join'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Full Map Page ── */}
      <AnimatePresence>
        {showFullMap && <FullMapPage onClose={() => setShowFullMap(false)} />}
      </AnimatePresence>
    </div>
  );
}
