import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import LocationSelect from './pages/LocationSelect';
import './styles/globals.css';
import { testConnection } from './services/supabase/testConnection.js';
import Community from './pages/Community';
import RideShare from './pages/RideShare';
import Events from './pages/Events';
import BuySell from './pages/BuySell';
import Roommates from './pages/Roommates';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';

const PgListings    = lazy(() => import('./pages/PgListings'));
const PgDetails     = lazy(() => import('./pages/PgDetails'));
const Shops         = lazy(() => import('./pages/Shops'));
const Gyms          = lazy(() => import('./pages/Gyms'));
const UniversalPost = lazy(() => import('./components/UniversalPost'));

/* ── Onboarding flow:  splash → onboarding → location → app ── */
const ONBOARDING_KEY = 'ln_onboarding_done';

/* ── Profile page ── */
function ProfilePage({ onNavigate }) {
  const { user, signOut } = useAuth();
  if (!user) {
    return (
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:'40px 24px' }}>
        <div style={{ fontSize:48 }}>👤</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'#0D0820' }}>Sign in to continue</div>
        <div style={{ fontSize:14, color:'#9CA3AF', textAlign:'center', maxWidth:280 }}>Create an account to save listings, post content and connect with your community</div>
        <button onClick={() => onNavigate('auth')} style={{ background:'#6D4AFF', color:'#fff', border:'none', padding:'13px 32px', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 20px rgba(109,74,255,0.35)' }}>
          Sign In
        </button>
      </div>
    );
  }

  const name = user.user_metadata?.full_name || user.email.split('@')[0];

  const MENU = [
    { icon:'📋', label:'My Listings',   action:() => onNavigate('pgs'),       sub:'View your listings' },
    { icon:'🔖', label:'Saved',          action:() => {},                       sub:'Your saved items' },
    { icon:'🎟️', label:'My Events',      action:() => onNavigate('events'),    sub:'Events you joined' },
    { icon:'⚙️', label:'Settings',       action:() => {},                       sub:'Account & privacy' },
    { icon:'💬', label:'Support',        action:() => {},                       sub:'Help & feedback' },
    { icon:'🚪', label:'Logout',         action:signOut,                        sub:'Sign out', danger:true },
  ];

  return (
    <div style={{ background:'#F5F4FF', minHeight:'100vh', paddingBottom:'calc(var(--bottom-nav-h) + 24px)' }}>
      <div style={{ background:'linear-gradient(160deg, #6D4AFF 0%, #8F7BFF 100%)', padding:'28px 20px 60px', position:'relative' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'rgba(255,255,255,0.85)', margin:'0 0 24px', letterSpacing:-0.3 }}>Profile</h2>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <img
            src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=fff&color=6D4AFF&size=120`}
            alt="avatar"
            style={{ width:72, height:72, borderRadius:22, objectFit:'cover', border:'3px solid rgba(255,255,255,0.4)', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}
          />
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:21, fontWeight:700, color:'#fff', letterSpacing:-0.3 }}>{name}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:4 }}>{user.email}</div>
          </div>
        </div>
      </div>

      <div style={{ margin:'-28px 20px 20px', background:'#fff', borderRadius:18, padding:'16px 0', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', display:'grid', gridTemplateColumns:'repeat(3,1fr)', position:'relative', zIndex:10 }}>
        {[{n:'3',l:'Listings'},{n:'5',l:'Saved'},{n:'2',l:'Events'}].map((s,i) => (
          <div key={s.l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, borderRight:i<2?'1px solid rgba(0,0,0,0.07)':undefined }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#6D4AFF' }}>{s.n}</span>
            <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:500 }}>{s.l}</span>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:8 }}>
        {MENU.map(item => (
          <motion.button
            key={item.label}
            onClick={item.action}
            whileTap={{ scale:0.97 }}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'#fff', border:'1.5px solid rgba(0,0,0,0.06)', borderRadius:16, cursor:'pointer', color:item.danger?'#EF4444':'#0D0820', textAlign:'left', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', transition:'all 0.18s' }}
          >
            <div style={{ width:40, height:40, borderRadius:12, background:item.danger?'rgba(239,68,68,0.08)':'#F5F4FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {item.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14.5, fontWeight:700, lineHeight:1.2 }}>{item.label}</div>
              <div style={{ fontSize:11.5, color:'#9CA3AF', marginTop:2 }}>{item.sub}</div>
            </div>
            <svg style={{ opacity:0.3, flexShrink:0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── Page registry ── */
const PAGES = {
  home:      (nav)       => <Home       onNavigate={nav} />,
  explore:   (nav)       => <Explore    onNavigate={nav} />,
  pgs:       (nav, user) => <PgListings onNavigate={nav} user={user} />,
  pgdetails: (nav)       => <PgDetails  onNavigate={nav} />,
  shops:     (nav)       => <Shops      onNavigate={nav} />,
  gyms:      (nav)       => <Gyms       onNavigate={nav} />,
  community: (nav)       => <Community  onNavigate={nav} />,
  rideshare: (nav)       => <RideShare  onNavigate={nav} />,
  events:    (nav)       => <Events     onNavigate={nav} />,
  buysell:   (nav)       => <BuySell    onNavigate={nav} />,
  roommates: (nav)       => <Roommates  onNavigate={nav} />,
  profile:   (nav)       => <ProfilePage onNavigate={nav} />,
};

const POST_ROUTE = {
  pg:'pgs', community:'community', ride:'rideshare',
  event:'events', marketplace:'buysell', roommate:'roommates',
  shop:'shops', gym:'gyms',
};

export default function App() {
  /* ── Onboarding flow ── */
  const alreadySeen = () => {
    try { return !!localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  };
  // flow: 'splash' | 'onboarding' | 'location' | 'app'
  const [flow, setFlow] = useState(alreadySeen() ? 'app' : 'splash');

  const advanceFlow = () => {
    setFlow(prev => {
      if (prev === 'splash')     return 'onboarding';
      if (prev === 'onboarding') return 'location';
      if (prev === 'location') {
        try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
        return 'app';
      }
      return prev;
    });
  };

  /* ── App state ── */
  const [page, setPage]                       = useState('home');
  const [authOpen, setAuthOpen]               = useState(false);
  const [postOpen, setPostOpen]               = useState(false);
  const [postType, setPostType]               = useState(null);
  const [postAfterLogin, setPostAfterLogin]   = useState(false);
  const { user } = useAuth();

  useEffect(() => { testConnection(); }, []);

  useEffect(() => {
    if (user && postAfterLogin) {
      setPostAfterLogin(false);
      setAuthOpen(false);
      setPostOpen(true);
    }
  }, [user, postAfterLogin]);

  useEffect(() => {
    if (user && authOpen) setAuthOpen(false);
  }, [user]); // eslint-disable-line

  const openPost = (type = null) => {
    if (!user) { setPostAfterLogin(true); setAuthOpen(true); return; }
    setPostType(type); setPostOpen(true);
  };

  const navigate = (p) => {
    if (p === 'post') { openPost(); return; }
    setPage(p);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  /* ── Render pre-app flow ── */
  if (flow !== 'app') {
    return (
      <AnimatePresence mode="wait">
        {flow === 'splash' && (
          <motion.div key="splash" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
            <Splash onDone={advanceFlow} />
          </motion.div>
        )}
        {flow === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
            <Onboarding onDone={advanceFlow} />
          </motion.div>
        )}
        {flow === 'location' && (
          <motion.div key="location" initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }} transition={{ duration:0.32, ease:[0.22,1,0.36,1] }}>
            <LocationSelect onDone={advanceFlow} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /* ── Main app ── */
  const render = PAGES[page] ?? PAGES.home;

  return (
    <MainLayout currentPage={page} onNavigate={navigate} onAuthOpen={() => setAuthOpen(true)} onPostOpen={openPost}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity:0, y:10 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-8 }}
          transition={{ duration:0.2, ease:[0.22,1,0.36,1] }}
          style={{ background:'#ffffff', minHeight:'100vh' }}
        >
          <Suspense fallback={null}>{render(navigate, user)}</Suspense>
        </motion.div>
      </AnimatePresence>

      <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); setPostAfterLogin(false); }} />

      {postOpen && (
        <Suspense fallback={null}>
          <UniversalPost
            isOpen={postOpen}
            onClose={() => { setPostOpen(false); setPostType(null); }}
            onSuccess={(type) => { const r = POST_ROUTE[type]; if (r) navigate(r); }}
            user={user}
            defaultType={postType}
          />
        </Suspense>
      )}
    </MainLayout>
  );
}
