import { useState, useRef, useEffect, useCallback, memo, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LetsPlaySection = lazy(() => import('../components/home/sections/LetsPlaySection'));
const NeighbourhoodPicksSection = lazy(() => import('../components/home/sections/NeighbourhoodPicksSection'));

/* ─────────────────────────────────────
   CATEGORY PNG ASSETS
───────────────────────────────────── */
import pgIcon       from '../assets/icons/PG & Stays.png';
import foodIcon     from '../assets/icons/Food & Cafes.png';
import buySellIcon  from '../assets/icons/Buy & Sell.png';
import shopsIcon    from '../assets/icons/Shops.png';
import eventsIcon   from '../assets/icons/Events.png';
import ridesIcon    from '../assets/icons/Rides.png';

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

const CATEGORIES = [
  { id:'pg',       label:'PG & Stays', emoji:'🏠' },
  { id:'food',     label:'Food & Cafe',emoji:'☕' },
  { id:'fitness',  label:'Fitness',    emoji:'💪' },
  { id:'shopping', label:'Shops',      emoji:'🛍' },
  { id:'events',   label:'Events',     emoji:'📅' },
  { id:'travel',   label:'Travel',     emoji:'🚗' },
  { id:'services', label:'Services',   emoji:'🛠' },
];

const MUST_TRY = [
  { id:1, title:'Rameshwaram Cafe',    famous:'Ghee Podi Idli & Filter Coffee',  badge:'TOP RATED',       badgeColor:'#6D4AFF', rating:4.8, dist:'1.2 km', image:'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80' },
  { id:2, title:"Brahmin's Coffee Bar", famous:'Filter Coffee',                   badge:'LOCAL FAVOURITE',  badgeColor:'#059669', rating:4.7, dist:'2.1 km', image:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80' },
  { id:3, title:'CTR Malleshwaram',    famous:'Benne Masala Dosa',               badge:'HERITAGE',         badgeColor:'#B45309', rating:4.6, dist:'3.4 km', image:'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80' },
  { id:4, title:'Oye! Momos',          famous:'Steamed Momos',                   badge:'TRENDING',         badgeColor:'#DC2626', rating:4.5, dist:'0.9 km', image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
  { id:5, title:'Toit Brewery',        famous:'Craft Beer',                       badge:'BEST SELLER',      badgeColor:'#7C3AED', rating:4.7, dist:'4.2 km', image:'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80' },
  { id:6, title:'Third Wave Coffee',   famous:'Specialty Coffee',                badge:'TOP RATED',        badgeColor:'#6D4AFF', rating:4.6, dist:'1.8 km', image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80' },
  { id:7, title:'Cubbon Park',         famous:'Morning Walks',                   badge:'HIDDEN GEM',       badgeColor:'#16A34A', rating:4.8, dist:'5.1 km', image:'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&q=80' },
  { id:8, title:'Ironhill Brewery',    famous:'Rooftop Dining',                  badge:'TRENDING',         badgeColor:'#DC2626', rating:4.5, dist:'6.3 km', image:'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80' },
  { id:9, title:'Nandi Hills',         famous:'Sunrise View',                    badge:'MUST VISIT',       badgeColor:'#0284C7', rating:4.9, dist:'58 km',  image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
];

const SEARCH_HINTS = [
  'Search nearby cafés...',
  'Search affordable PGs...',
  'Search local shops...',
  "Search today's offers...",
  'Search weekend events...',
  'Search furniture...',
  'Search roommate...',
  'Search ride to Electronic City...',
];

const MAP_MARKERS = [
  { id:'m1', lat:12.9719, lng:77.5946, color:'#6D4AFF', emoji:'💪', name:'IronCore Fitness',    category:'Gym',         dist:'800m',  rating:4.7, offer:'7 Days Free', isOpen:true  },
  { id:'m2', lat:12.9705, lng:77.5920, color:'#F59E0B', emoji:'☕', name:'Brew & Bites Cafe',   category:'Cafe',        dist:'450m',  rating:4.5, offer:'15% OFF',    isOpen:true  },
  { id:'m3', lat:12.9730, lng:77.5965, color:'#22C55E', emoji:'🛍', name:'D-Mart',              category:'Supermarket', dist:'900m',  rating:4.4, offer:'5% OFF',     isOpen:true  },
  { id:'m4', lat:12.9698, lng:77.5975, color:'#EF4444', emoji:'📅', name:'Weekend Yoga Class',  category:'Events',      dist:'600m',  rating:4.8, offer:'',           isOpen:true  },
  { id:'m5', lat:12.9745, lng:77.5935, color:'#3B82F6', emoji:'🏠', name:'GreenNest PG',        category:'PG',          dist:'1.2km', rating:4.6, offer:'Available',  isOpen:true  },
  { id:'m6', lat:12.9688, lng:77.5950, color:'#22C55E', emoji:'🛍', name:'More Supermarket',    category:'Supermarket', dist:'1.1km', rating:4.3, offer:'5% OFF',     isOpen:false },
  { id:'m7', lat:12.9712, lng:77.5988, color:'#6D4AFF', emoji:'💪', name:"Gold's Gym",          category:'Gym',         dist:'1.5km', rating:4.9, offer:'Free Trial', isOpen:true  },
];

const NEARBY_PLACES = [
  { id:1, name:'Starbucks',         category:'Cafe',        dist:'650m',  rating:4.6, reviews:128, offer:'20% OFF',    isOpen:true,  image:'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=300&q=80' },
  { id:2, name:'IronCore Fitness',  category:'Gym',         dist:'800m',  rating:4.7, reviews:96,  offer:'7 Days Free',isOpen:true,  image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
  { id:3, name:'Brew & Bites Cafe', category:'Cafe',        dist:'450m',  rating:4.5, reviews:84,  offer:'15% OFF',    isOpen:true,  image:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=300&q=80' },
  { id:4, name:'D-Mart',            category:'Supermarket', dist:'900m',  rating:4.4, reviews:72,  offer:'5% OFF',     isOpen:true,  image:'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&q=80' },
  { id:5, name:'More Supermarket',  category:'Supermarket', dist:'1.1km', rating:4.3, reviews:56,  offer:'',           isOpen:false, image:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
];

const NEARBY_FILTERS = ['Nearest','Top Rated','Open Now','More'];

const WEEKEND_PLANS = [
  { id:1, title:'Nandi Hills Sunrise Trip', day:'SAT', date:'18', time:'Sat, 6:30 AM',  joined:4,  max:8,  badgeColor:'#EF4444', participants:['#6D4AFF','#EC4899','#10B981'], extra:3, image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
  { id:2, title:'Football Match',           day:'SUN', date:'19', time:'Sun, 7:00 AM',  joined:6,  max:10, badgeColor:'#EF4444', participants:['#F59E0B','#6D4AFF','#3B82F6'], extra:5, image:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80' },
  { id:3, title:'Cubbon Park Picnic',       day:'SAT', date:'18', time:'Sat, 3:00 PM',  joined:12, max:15, badgeColor:'#7C3AED', participants:['#10B981','#EC4899','#6D4AFF'], extra:5, image:'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=400&q=80' },
  { id:4, title:'Movie Night',              day:'SUN', date:'19', time:'Sun, 7:00 PM',  joined:9,  max:12, badgeColor:'#EF4444', participants:['#3B82F6','#F59E0B','#6D4AFF'], extra:9, image:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80' },
];

const CATEGORY_GRID = [
  { id:'pg',       label:'PG & Stays',   img: pgIcon      },
  { id:'food',     label:'Food & Cafes', img: foodIcon    },
  { id:'buysell',  label:'Buy & Sell',   img: buySellIcon },
  { id:'shopping', label:'Shops',        img: shopsIcon   },
  { id:'events',   label:'Events',       img: eventsIcon  },
  { id:'travel',   label:'Rides',        img: ridesIcon   },
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
        <div
          onClick={onViewFullMap}
          style={{ position: 'absolute', inset: 0, zIndex: 400, cursor: 'pointer', background: 'transparent' }}
        />
      )}
    </div>
  );
});

/* ─────────────────────────────────────
   ANIMATED MINIATURE CITY MAP CARD
───────────────────────────────────── */
function AnimatedCityMapCard({ onViewFullMap }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const [tapping, setTapping] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    const vehicles = [
      { x: W * 0.15, y: H * 0.38, dx: 0.28, dy: 0,    color: '#6D4AFF', w: 9, h: 5 },
      { x: W * 0.60, y: H * 0.55, dx: -0.22, dy: 0,   color: '#F59E0B', w: 9, h: 5 },
      { x: W * 0.80, y: H * 0.30, dx: 0,    dy: 0.18, color: '#22C55E', w: 5, h: 9 },
      { x: W * 0.35, y: H * 0.70, dx: 0.20, dy: 0,    color: '#EC4899', w: 9, h: 5 },
      { x: W * 0.10, y: H * 0.62, dx: 0,    dy: -0.15,color: '#3B82F6', w: 5, h: 9 },
    ];

    const dots = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      r: 2.5 + Math.random() * 1.5,
      color: ['#6D4AFF','#EC4899','#22C55E','#F59E0B'][i % 4],
      phase: Math.random() * Math.PI * 2,
    }));

    const pins = [
      { x: W * 0.22, y: H * 0.25, label: 'Koramangala', phase: 0 },
      { x: W * 0.68, y: H * 0.42, label: 'Indiranagar',  phase: 1 },
      { x: W * 0.45, y: H * 0.72, label: 'HSR Layout',   phase: 2 },
    ];

    const glowPins = [
      { x: W * 0.30, y: H * 0.45, emoji: '☕', color: '#F59E0B', pulsePhase: 0   },
      { x: W * 0.58, y: H * 0.28, emoji: '🏠', color: '#6D4AFF', pulsePhase: 1.2 },
      { x: W * 0.72, y: H * 0.62, emoji: '💪', color: '#22C55E', pulsePhase: 0.6 },
      { x: W * 0.20, y: H * 0.60, emoji: '🛍', color: '#EC4899', pulsePhase: 1.8 },
    ];

    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#F5F0FF');
      bgGrad.addColorStop(1, '#EDE8FF');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const hRoads = [H * 0.38, H * 0.55, H * 0.70];
      hRoads.forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); });
      const vRoads = [W * 0.22, W * 0.48, W * 0.75];
      vRoads.forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(109,74,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 10]);
      hRoads.forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); });
      vRoads.forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); });
      ctx.setLineDash([]);
      ctx.restore();

      const buildings = [
        { x: W*0.06, y: H*0.08, w: 28, h: 36, depth: 8, color: '#D5CCFF' },
        { x: W*0.14, y: H*0.12, w: 22, h: 28, depth: 6, color: '#C8BCFF' },
        { x: W*0.26, y: H*0.06, w: 32, h: 44, depth: 9, color: '#BEB0FF' },
        { x: W*0.38, y: H*0.10, w: 20, h: 32, depth: 7, color: '#D0C5FF' },
        { x: W*0.52, y: H*0.05, w: 26, h: 40, depth: 8, color: '#C5B8FF' },
        { x: W*0.63, y: H*0.08, w: 24, h: 30, depth: 6, color: '#D8D0FF' },
        { x: W*0.75, y: H*0.07, w: 30, h: 36, depth: 8, color: '#CABFFF' },
        { x: W*0.86, y: H*0.10, w: 22, h: 26, depth: 6, color: '#DDD6FF' },
        { x: W*0.06, y: H*0.62, w: 20, h: 18, depth: 5, color: '#E0D9FF' },
        { x: W*0.14, y: H*0.64, w: 18, h: 22, depth: 5, color: '#D5CCFF' },
        { x: W*0.52, y: H*0.62, w: 22, h: 20, depth: 5, color: '#CCB8FF' },
        { x: W*0.84, y: H*0.62, w: 18, h: 24, depth: 5, color: '#D8D0FF' },
      ];

      buildings.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 3); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + b.depth, b.y - b.depth * 0.6);
        ctx.lineTo(b.x + b.w + b.depth, b.y - b.depth * 0.6);
        ctx.lineTo(b.x + b.w, b.y);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(109,74,255,0.10)';
        ctx.beginPath();
        ctx.moveTo(b.x + b.w, b.y);
        ctx.lineTo(b.x + b.w + b.depth, b.y - b.depth * 0.6);
        ctx.lineTo(b.x + b.w + b.depth, b.y + b.h - b.depth * 0.6);
        ctx.lineTo(b.x + b.w, b.y + b.h);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,160,0.7)';
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            ctx.fillRect(b.x + 4 + col * 9, b.y + 5 + row * 9, 5, 5);
          }
        }
      });

      const trees = [
        { x: W*0.42, y: H*0.44 },{ x: W*0.44, y: H*0.43 },
        { x: W*0.55, y: H*0.50 },{ x: W*0.57, y: H*0.51 },
        { x: W*0.30, y: H*0.62 },{ x: W*0.32, y: H*0.63 },
        { x: W*0.64, y: H*0.35 },{ x: W*0.66, y: H*0.36 },
      ];
      trees.forEach(tr => {
        ctx.fillStyle = 'rgba(34,197,94,0.50)';
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(34,197,94,0.25)';
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 9, 0, Math.PI * 2); ctx.fill();
      });

      vehicles.forEach(v => {
        v.x += v.dx; v.y += v.dy;
        if (v.x > W + 10) v.x = -10;
        if (v.x < -10) v.x = W + 10;
        if (v.y > H + 10) v.y = -10;
        if (v.y < -10) v.y = H + 10;
        ctx.save();
        ctx.shadowColor = v.color; ctx.shadowBlur = 6;
        ctx.fillStyle = v.color;
        ctx.beginPath(); ctx.roundRect(v.x - v.w/2, v.y - v.h/2, v.w, v.h, 2); ctx.fill();
        ctx.restore();
      });

      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        d.phase += 0.05;
        const pulse = 0.8 + Math.sin(d.phase) * 0.2;
        ctx.save();
        ctx.globalAlpha = 0.7 * pulse;
        ctx.shadowColor = d.color; ctx.shadowBlur = 5;
        ctx.fillStyle = d.color;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      const cx = W * 0.5, cy = H * 0.48;
      for (let ring = 0; ring < 3; ring++) {
        const phase  = (t * 1.2 + ring * 0.8) % 3;
        const radius = phase * 38;
        const alpha  = Math.max(0, 0.35 - phase * 0.12);
        ctx.save();
        ctx.strokeStyle = `rgba(109,74,255,${alpha})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.shadowColor = '#6D4AFF'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#6D4AFF';
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      glowPins.forEach(gp => {
        const bob = Math.sin(t * 1.8 + gp.pulsePhase) * 2.5;
        ctx.save();
        ctx.globalAlpha = 0.22 + Math.sin(t * 2 + gp.pulsePhase) * 0.08;
        ctx.fillStyle = gp.color;
        ctx.beginPath(); ctx.arc(gp.x, gp.y + bob, 18, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.shadowColor = gp.color; ctx.shadowBlur = 10;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(gp.x, gp.y + bob, 12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = gp.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(gp.x, gp.y + bob, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.font = '10px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(gp.emoji, gp.x, gp.y + bob);
        ctx.restore();
      });

      pins.forEach(pin => {
        const bob = Math.sin(t * 0.9 + pin.phase) * 2;
        const metrics = ctx.measureText(pin.label);
        const pw = metrics.width + 16, ph = 18;
        const px = pin.x - pw / 2, py = pin.y + bob - ph / 2;
        ctx.save();
        ctx.shadowColor = 'rgba(109,74,255,0.25)'; ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255,255,255,0.90)';
        ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 99); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#6D4AFF';
        ctx.fillText(pin.label, pin.x, pin.y + bob);
        ctx.restore();
      });

      const shimmerX = ((t * 0.3) % 2) * W - W * 0.5;
      const shimGrad = ctx.createLinearGradient(shimmerX, 0, shimmerX + W * 0.4, H);
      shimGrad.addColorStop(0, 'rgba(255,255,255,0)');
      shimGrad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
      shimGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shimGrad;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleTap = () => {
    setTapping(true);
    setTimeout(() => { setTapping(false); onViewFullMap(); }, 520);
  };

  return (
    <motion.div
      onClick={handleTap}
      animate={tapping ? { scale: 1.04 } : { scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      style={{
        margin: '0 20px', borderRadius: 28, overflow: 'hidden',
        position: 'relative', height: 220, cursor: 'pointer',
        boxShadow: '0 20px 60px rgba(109,74,255,0.18), 0 6px 20px rgba(109,74,255,0.12), 0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <AnimatePresence>
        {tapping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(109,74,255,0.15)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>
      <div style={{
        position: 'absolute', bottom: 14, left: 16,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 14, padding: '8px 13px', boxShadow: '0 4px 20px rgba(109,74,255,0.16)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🗺</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>Live Map</div>
            <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.2 }}>Explore what's around you</div>
          </div>
        </div>
      </div>
      <motion.div
        whileTap={{ scale: 0.88, rotate: 60 }}
        style={{
          position: 'absolute', bottom: 14, right: 16,
          width: 40, height: 40, borderRadius: '50%', background: C.purple,
          boxShadow: '0 4px 16px rgba(109,74,255,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </motion.div>
      <div style={{
        position: 'absolute', top: 14, right: 16,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 99, padding: '5px 10px', boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
      }}>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }}
        />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Live</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   FULL MAP PAGE
───────────────────────────────────── */
function FullMapPage({ onClose }) {
  const leafletReady  = useLeafletScript();
  const [activeFilter, setActiveFilter] = useState('');
  const [selected, setSelected]         = useState(null);

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      style={{ position: 'fixed', inset: 0, zIndex: 600, background: '#F1F3F4', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 700,
        padding: 'calc(env(safe-area-inset-top,0px) + 12px) 16px 10px',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(109,74,255,0.07)',
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
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveFilter(activeFilter === cat.id ? '' : cat.id)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 99, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
      <div style={{ flex: 1, position: 'relative', marginTop: 116 }}>
        {leafletReady ? (
          <LeafletMap onMarkerClick={setSelected} />
        ) : (
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }} />
        )}
      </div>
      <AnimatePresence>
        {selected && (
          <>
            <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 710, background: 'transparent' }} />
            <motion.div
              key="sheet"
              initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
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
                  width: 52, height: 52, borderRadius: '50%', background: selected.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, border: '3px solid white', boxShadow: `0 6px 18px ${selected.color}55`, flexShrink: 0,
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
                <motion.button whileTap={{ scale: 0.96 }} style={{ flex: 2, background: C.purple, border: 'none', borderRadius: 16, padding: '14px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(109,74,255,0.35)' }}>Directions →</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} style={{ flex: 1, background: C.purpleBg, border: 'none', borderRadius: 16, padding: '14px', color: C.purple, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Details</motion.button>
                <motion.button whileTap={{ scale: 0.94 }} style={{ width: 48, background: '#FEF2F2', border: 'none', borderRadius: 16, padding: '14px 0', color: C.red, fontSize: 18, cursor: 'pointer' }}>🔖</motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   LAZY IMAGE
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
        <img src={src} alt={alt} loading="lazy"
          onLoad={() => setLoaded(true)} onError={() => setErr(true)}
          style={{ ...s, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   INFINITE CAROUSEL
───────────────────────────────────── */
const CARD_W   = Math.min(0.72 * (typeof window !== 'undefined' ? window.innerWidth : 390), 290);
const CARD_GAP = 12;
const CARD_STEP = CARD_W + CARD_GAP;

function InfiniteCarousel({ items, onActiveChange }) {
  const tripled = [...items, ...items, ...items];
  const N = items.length;
  const x = useMotionValue(-N * CARD_STEP);
  const containerRef = useRef(null);
  const isDragging   = useRef(false);
  const startX       = useRef(0);
  const startVal     = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const velocityRef = useRef(0);
  const lastX       = useRef(0);
  const lastT       = useRef(Date.now());

  const normalizeIndex = (idx) => ((idx % N) + N) % N;

  const snapTo = useCallback((targetIdx) => {
    const targetX = -targetIdx * CARD_STEP;
    animate(x, targetX, { type: 'spring', damping: 32, stiffness: 300, velocity: velocityRef.current });
    const norm = normalizeIndex(targetIdx);
    setActiveIdx(norm);
    onActiveChange && onActiveChange(norm);
  }, [x, onActiveChange]);

  const normalizePosition = useCallback((currentIdx) => {
    if (currentIdx < N / 2) {
      const newIdx = currentIdx + N;
      x.set(-newIdx * CARD_STEP);
      return newIdx;
    } else if (currentIdx >= N * 2.5) {
      const newIdx = currentIdx - N;
      x.set(-newIdx * CARD_STEP);
      return newIdx;
    }
    return currentIdx;
  }, [x, N]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    startVal.current = x.get();
    lastX.current = startX.current;
    lastT.current = Date.now();
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const now = Date.now();
    const dt  = now - lastT.current;
    if (dt > 0) velocityRef.current = (clientX - lastX.current) / dt * 16;
    lastX.current = clientX;
    lastT.current = now;
    x.set(startVal.current + (clientX - startX.current));
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    let targetIdx = Math.round(-x.get() / CARD_STEP);
    if (Math.abs(velocityRef.current) > 3) targetIdx -= Math.sign(velocityRef.current);
    targetIdx = Math.max(0, Math.min(tripled.length - 1, targetIdx));
    snapTo(targetIdx);
    setTimeout(() => {
      const newIdx = normalizePosition(targetIdx);
      if (newIdx !== targetIdx) { setActiveIdx(normalizeIndex(newIdx)); onActiveChange && onActiveChange(normalizeIndex(newIdx)); }
    }, 500);
  };

  return (
    <div ref={containerRef}
      style={{ overflow: 'hidden', width: '100%', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
    >
      <motion.div style={{
        display: 'flex', gap: CARD_GAP,
        paddingLeft: `calc(50% - ${CARD_W / 2}px)`,
        paddingRight: `calc(50% - ${CARD_W / 2}px)`,
        paddingBottom: 8, x, willChange: 'transform',
      }}>
        {tripled.map((item, tripledIdx) => (
          <CarouselCard key={`${item.id}-${tripledIdx}`} item={item} tripledIdx={tripledIdx} xMotion={x} />
        ))}
      </motion.div>
    </div>
  );
}

function CarouselCard({ item, tripledIdx, xMotion }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [scale, setScale]           = useState(0.9);

  useEffect(() => {
    return xMotion.on('change', (xVal) => {
      const cardCenter = tripledIdx * CARD_STEP + CARD_W / 2;
      const viewCenter = -xVal + (typeof window !== 'undefined' ? window.innerWidth : 390) / 2;
      const dist = Math.abs(cardCenter - viewCenter);
      const t    = Math.max(0, 1 - dist / (CARD_STEP * 1.2));
      setScale(0.90 + 0.10 * t);
    });
  }, [xMotion, tripledIdx]);

  const isCenter = Math.abs(scale - 1.0) < 0.02;

  return (
    <motion.div
      animate={{ scale, opacity: scale > 0.96 ? 1 : 0.72 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      style={{
        width: CARD_W, flexShrink: 0, borderRadius: 28, overflow: 'hidden',
        position: 'relative', height: 340, cursor: 'pointer',
        boxShadow: isCenter ? '0 20px 60px rgba(0,0,0,0.32), 0 8px 24px rgba(0,0,0,0.18)' : '0 8px 24px rgba(0,0,0,0.14)',
        transformOrigin: 'center center', willChange: 'transform',
      }}
    >
      <LazyImg src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 48%, transparent 75%)' }} />
      <div style={{
        position: 'absolute', top: 14, left: 14, background: item.badgeColor, color: '#fff',
        fontSize: 9, fontWeight: 800, letterSpacing: 0.8, padding: '5px 11px', borderRadius: 99,
        textTransform: 'uppercase', boxShadow: `0 2px 10px ${item.badgeColor}66`,
      }}>{item.badge}</div>
      <motion.button whileTap={{ scale: 0.78 }}
        onClick={(e) => { e.stopPropagation(); setBookmarked(b => !b); }}
        style={{
          position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(6px)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? C.purple : 'none'} stroke={bookmarked ? C.purple : '#6B7280'} strokeWidth="2.2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </motion.button>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 18px' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 6, fontFamily: 'var(--font-display)' }}>{item.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#FFD700', fontWeight: 700 }}>★ {item.rating}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>📍 {item.dist}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   EXPLORE PAGE
═══════════════════════════════════════════════ */
export default function Explore({ onNavigate }) {
  const { user }    = useAuth();
  const [activeCategory, setActiveCategory] = useState('pg');
  const [nearbyFilter, setNearbyFilter]     = useState('Nearest');
  const [bookmarks, setBookmarks]           = useState({});
  const [joinedPlans, setJoinedPlans]       = useState({});
  const [showFullMap, setShowFullMap]       = useState(false);
  const [searchFocused, setSearchFocused]   = useState(false);
  const [hintIndex, setHintIndex]           = useState(0);
  const [activeCard, setActiveCard]         = useState(0);

  useEffect(() => {
    if (searchFocused) return;
    const interval = setInterval(() => {
      setHintIndex(i => (i + 1) % SEARCH_HINTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [searchFocused]);

  const toggleBookmark = useCallback((id) => setBookmarks(b => ({ ...b, [id]: !b[id] })), []);
  const toggleJoin     = useCallback((id) => setJoinedPlans(j => ({ ...j, [id]: !j[id] })), []);

  const fu = (delay = 0) => ({
    initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-16px' },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay },
  });

  return (
    <div style={{
      background: C.white, minHeight: '100vh',
      paddingBottom: 'calc(var(--bottom-nav-h, 70px) + env(safe-area-inset-bottom, 0px) + 28px)',
    }}>

      {/* STICKY HEADER */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: C.white,
        boxShadow: '0 4px 24px rgba(109,74,255,0.06)',
      }}>
        <div style={{ padding: '8px 20px 0' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 15 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.5, lineHeight: 1.15 }}>Explore</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 13, color: C.textMuted }}>Discover everything in</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>Green Sector</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={C.purple}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={{ position: 'relative', width: 40, height: 40, borderRadius: 13, background: '#F7F6FF', border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, background: C.red, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>3</span>
              </button>
              {user ? (
                <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=6D4AFF&color=fff`}
                  alt="avatar" onClick={() => onNavigate('profile')}
                  style={{ width: 40, height: 40, borderRadius: 13, objectFit: 'cover', cursor: 'pointer', border: `2px solid ${C.border}` }}
                />
              ) : (
                <button onClick={() => onNavigate('profile')} style={{ width: 40, height: 40, borderRadius: 13, background: C.purpleBg, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* PREMIUM SEARCH BAR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <motion.div
              animate={{
                boxShadow: searchFocused
                  ? `0 0 0 2.5px ${C.purple}, 0 8px 32px rgba(109,74,255,0.24), 0 2px 8px rgba(109,74,255,0.14), inset 0 1px 0 rgba(255,255,255,0.90)`
                  : `0 0 0 1px rgba(109,74,255,0.06), 0 2px 4px rgba(109,74,255,0.04), 0 8px 24px rgba(109,74,255,0.10), 0 16px 48px rgba(109,74,255,0.07), inset 0 1px 0 rgba(255,255,255,0.95)`,
              }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBFF 100%)',
                border: `1.5px solid ${searchFocused ? C.purple : 'rgba(109,74,255,0.10)'}`,
                borderRadius: 22, padding: '0 14px', height: 56,
                position: 'relative', overflow: 'visible', transition: 'border-color 0.18s',
              }}
            >
              {!searchFocused && (
                <div style={{ position: 'absolute', inset: -3, borderRadius: 25, background: 'transparent', boxShadow: '0 0 0 3px rgba(109,74,255,0.055)', pointerEvents: 'none', zIndex: -1 }} />
              )}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? C.purple : C.textMuted} strokeWidth="2.2" style={{ transition: 'stroke 0.18s', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: 24 }}>
                <input type="text"
                  onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                  style={{ position: 'absolute', inset: 0, border: 'none', background: 'transparent', fontSize: 14.5, color: C.text, outline: 'none', fontFamily: 'var(--font-sans)', fontWeight: 500, zIndex: 2 }}
                />
                {!searchFocused && (
                  <AnimatePresence mode="wait">
                    <motion.div key={hintIndex}
                      initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}
                    >
                      <span style={{ fontSize: 14, color: 'rgba(156,163,175,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 400 }}>
                        {SEARCH_HINTS[hintIndex]}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
            <motion.button whileTap={{ scale: 0.93 }} style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: C.purpleBg,
              border: `1.5px solid rgba(109,74,255,0.14)`, boxShadow: '0 4px 16px rgba(109,74,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          CATEGORY GRID
          KEY CHANGES:
          • columnGap: 11  (same as before)
          • rowGap: 28     (increased — gives breathing room so bottom icons don't touch top cards)
          • Card: overflow: 'visible' so icon can float above the card boundary
          • Card: marginTop: 22px — reserves space above the card for the overflowing icon
          • Icon wrapper: marginTop: '-24px' — pushes icon UP, out of the card top edge
      ══════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: '17px 16px 8px' }}
      >
        {/* Outer wrapper adds paddingTop so the first row's overflowing icons aren't clipped by the sticky header */}
        <div style={{ paddingTop: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            columnGap: 11,
            rowGap: 12,          /* ← wider row gap prevents bottom icons touching top cards */
          }}>
            {CATEGORY_GRID.map((cat, i) => {
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const routes = { pg:'pgs', food:'food', buysell:'buysell', shopping:'shops', events:'events', travel:'rides' };
                    if (routes[cat.id]) onNavigate(routes[cat.id]);
                  }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.32 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 4px 11px',
                    borderRadius: 24,
                    border: `1.8px solid ${active ? C.purple : 'rgba(109,74,255,0.08)'}`,
                    background: active
                      ? 'linear-gradient(150deg, #EDE8FF 0%, #E2DAFF 100%)'
                      : 'linear-gradient(150deg, #FDFCFF 0%, #F8F5FF 100%)',
                    cursor: 'pointer',
                    boxShadow: active
                      ? `0 0 0 3px rgba(109,74,255,0.14), 0 10px 32px rgba(109,74,255,0.20)`
                      : '0 4px 16px rgba(109,74,255,0.07), 0 1px 4px rgba(109,74,255,0.04)',
                    transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                    /* Fixed card height. Card itself is the lower "shelf" — icon floats above */
                    height: 96,
                    marginTop: 22,             /* ← reserves space above for overflowing icon */
                    overflow: 'visible',       /* ← allows icon to escape the card boundary   */
                    position: 'relative',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* ICON — floats upward out of the card, 3D pop effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-34%)',  /* ← pushes icon up above card edge */
                    width: '92%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <img
                      src={cat.img}
                      alt={cat.label}
                      draggable={false}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        transform: active ? 'scale(1.10) translateY(-4px)' : 'scale(1.0)',
                        filter: active
                          ? 'drop-shadow(0 12px 28px rgba(109,74,255,0.38))'
                          : 'drop-shadow(0 8px 18px rgba(109,74,255,0.22))',
                        transition: 'all 0.22s ease',
                        willChange: 'transform',
                      }}
                    />
                  </div>

                  {/* Label — always visible at bottom of card */}
                  <span style={{
                    fontSize: 13.8, fontWeight: 700,
                    color: active ? C.purple : C.text,
                    whiteSpace: 'nowrap', letterSpacing: -0.1,
                    lineHeight: 1,
                    position: 'relative', zIndex: 1,
                  }}>
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* DISCOVER NEARBY — moved here from Home (Let's Play + Neighbourhood Picks) */}
      <Suspense fallback={null}>
        <LetsPlaySection onNavigate={onNavigate} />
        <NeighbourhoodPicksSection onNavigate={onNavigate} />
      </Suspense>

      {/* MUST TRY */}
      <motion.section {...fu(0)} style={{ marginTop: 20, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4 }}>
            Must Try in Bangalore ✨
          </h2>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: C.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            View all <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <InfiniteCarousel items={MUST_TRY} onActiveChange={setActiveCard} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: 4 }}>
          {MUST_TRY.map((_, i) => (
            <div key={i} style={{
              width: i === activeCard ? 20 : 6, height: 6, borderRadius: 99,
              background: i === activeCard ? C.purple : 'rgba(109,74,255,0.22)',
              transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeCard}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{
              margin: '12px 20px 0', background: C.cardBg, borderRadius: 20, padding: '14px 16px',
              boxShadow: '0 8px 28px rgba(109,74,255,0.10), 0 2px 8px rgba(109,74,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{ width: 58, height: 58, borderRadius: 14, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              <LazyImg src={MUST_TRY[activeCard].image} alt={MUST_TRY[activeCard].title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.2, marginBottom: 3 }}>{MUST_TRY[activeCard].title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, color: C.orange, fontWeight: 700 }}>★ {MUST_TRY[activeCard].rating}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.textMuted, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: C.textMuted }}>📍 {MUST_TRY[activeCard].dist}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textSub }}>
                <span style={{ fontWeight: 600, color: C.purple }}>Famous for: </span>{MUST_TRY[activeCard].famous}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* EXPLORE ON MAP */}
      <motion.section {...fu(0.04)} style={{ marginBottom: 36 }}>
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={C.purple}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4 }}>Explore on Map</h2>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginLeft: 24 }}>See what's around you</div>
        </div>
        <AnimatedCityMapCard onViewFullMap={() => setShowFullMap(true)} />
      </motion.section>

      {/* NEARBY PLACES */}
      <motion.section {...fu(0.06)} style={{ marginBottom: 36 }}>
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4, marginBottom: 3 }}>Nearby Places</h2>
          <div style={{ fontSize: 13, color: C.textMuted }}>Top places near you</div>
        </div>
        <div style={{ display: 'flex', gap: 10, paddingLeft: 20, paddingRight: 20, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NEARBY_FILTERS.map(f => (
            <motion.button key={f} whileTap={{ scale: 0.93 }} onClick={() => setNearbyFilter(f)}
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
        <div style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingRight: 20, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
          {NEARBY_PLACES.map((place, i) => (
            <motion.div key={place.id}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.970, y: -2 }}
              style={{ width: 158, flexShrink: 0, background: C.cardBg, borderRadius: 24, boxShadow: '0 12px 40px rgba(109,76,255,0.08), 0 2px 8px rgba(109,76,255,0.04)', overflow: 'hidden', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', height: 142 }}>
                <LazyImg src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: 8, left: 8, background: place.isOpen ? 'rgba(22,163,74,0.88)' : 'rgba(100,116,139,0.85)', color: '#fff', fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                  {place.isOpen ? 'Open' : 'Closed'}
                </div>
                <motion.button whileTap={{ scale: 0.78, rotate: -12 }}
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(`np-${place.id}`); }}
                  style={{ position: 'absolute', top: 7, right: 7, width: 29, height: 29, borderRadius: '50%', background: 'rgba(255,255,255,0.93)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.13)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill={bookmarks[`np-${place.id}`] ? C.purple : 'none'} stroke={bookmarks[`np-${place.id}`] ? C.purple : '#6B7280'} strokeWidth="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </motion.button>
              </div>
              <div style={{ padding: '12px 13px 14px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3, lineHeight: 1.3 }}>{place.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 7 }}>{place.category} · {place.dist}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: place.offer ? 8 : 11 }}>
                  <span style={{ fontSize: 11.5, color: C.orange }}>★</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>{place.rating}</span>
                  <span style={{ fontSize: 10.5, color: C.textMuted }}>({place.reviews})</span>
                </div>
                {place.offer && <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.purpleBg, borderRadius: 99, padding: '3px 9px', display: 'inline-block', marginBottom: 10 }}>{place.offer}</div>}
                <motion.button whileTap={{ scale: 0.95 }} style={{ width: '100%', padding: '9px 0', background: 'linear-gradient(135deg, #6D4AFF, #8B5CF6)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,74,255,0.3)' }}>Visit →</motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* WEEKEND PLANS */}
      <motion.section {...fu(0.08)} style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0 20px', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.4, marginBottom: 3 }}>Weekend Plans Near You</h2>
            <div style={{ fontSize: 13, color: C.textMuted }}>Join others or create your own plan</div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: C.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, marginTop: 2 }}>
            View all <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingRight: 20, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 6 }}>
          {WEEKEND_PLANS.map((plan, i) => {
            const joined = joinedPlans[plan.id];
            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} whileTap={{ scale: 0.968, y: -2 }}
                style={{ width: 178, flexShrink: 0, background: C.cardBg, borderRadius: 24, boxShadow: '0 14px 44px rgba(109,76,255,0.10), 0 4px 12px rgba(109,76,255,0.06)', overflow: 'hidden', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', height: 158 }}>
                  <LazyImg src={plan.image} alt={plan.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 52%)' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, background: plan.badgeColor, color: '#fff', borderRadius: 12, padding: '5px 10px', textAlign: 'center', minWidth: 44, boxShadow: `0 4px 12px ${plan.badgeColor}66` }}>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', lineHeight: 1 }}>{plan.day}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{plan.date}</div>
                  </div>
                </div>
                <div style={{ padding: '13px 14px 15px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 5 }}>{plan.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12 }}>{plan.time} · {plan.joined}/{plan.max} Joined</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {plan.participants.map((color, idx) => (
                        <div key={idx} style={{ width: 24, height: 24, borderRadius: '50%', background: color, border: '2px solid white', marginLeft: idx > 0 ? -8 : 0, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }} />
                      ))}
                      <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6, fontWeight: 600 }}>+{plan.extra}</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.88 }}
                      onClick={(e) => { e.stopPropagation(); toggleJoin(plan.id); }}
                      style={{ padding: '6px 16px', background: joined ? C.purple : 'transparent', border: `1.5px solid ${joined ? C.purple : 'rgba(0,0,0,0.14)'}`, borderRadius: 99, color: joined ? '#fff' : C.textSub, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s', boxShadow: joined ? '0 4px 14px rgba(109,74,255,0.35)' : 'none' }}
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

      <AnimatePresence>
        {showFullMap && <FullMapPage onClose={() => setShowFullMap(false)} />}
      </AnimatePresence>
    </div>
  );
}
