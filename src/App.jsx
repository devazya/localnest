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
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import { ProfilePreviewProvider } from './context/ProfilePreviewContext';
import AuthModal from './components/auth/AuthModal';

const PgListings    = lazy(() => import('./pages/PgListings'));
const PgDetails     = lazy(() => import('./pages/PgDetails'));
const Shops         = lazy(() => import('./pages/Shops'));
const Gyms          = lazy(() => import('./pages/Gyms'));
const UniversalPost = lazy(() => import('./components/UniversalPost'));

/* ── Onboarding flow:  splash → onboarding → location → app ── */
const ONBOARDING_KEY = 'ln_onboarding_done';

/* ── Page registry ──
 * `params` carries per-navigation extras (currently only Profile's
 * viewed userId) without changing every other page's signature. */
const PAGES = {
  home:      (nav)               => <Home       onNavigate={nav} />,
  explore:   (nav)               => <Explore    onNavigate={nav} />,
  pgs:       (nav, user)         => <PgListings onNavigate={nav} user={user} />,
  pgdetails: (nav)               => <PgDetails  onNavigate={nav} />,
  shops:     (nav)               => <Shops      onNavigate={nav} />,
  gyms:      (nav)               => <Gyms       onNavigate={nav} />,
  community: (nav)               => <Community  onNavigate={nav} />,
  rideshare: (nav)               => <RideShare  onNavigate={nav} />,
  events:    (nav)               => <Events     onNavigate={nav} />,
  buysell:   (nav)               => <BuySell    onNavigate={nav} />,
  roommates: (nav)               => <Roommates  onNavigate={nav} />,
  profile:   (nav, _user, params) => <Profile   onNavigate={nav} userId={params?.userId} />,
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
  const [pageParams, setPageParams]           = useState(null);
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

  const navigate = (p, params = null) => {
    if (p === 'post') { openPost(); return; }
    setPage(p);
    setPageParams(params);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  /* Viewing another resident's profile — used by the Profile Preview
     Bottom Sheet's "View Profile" button, and available anywhere. */
  const viewProfile = (userId) => navigate('profile', { userId });

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
    <ProfilePreviewProvider viewerId={user?.id} onViewProfile={viewProfile}>
      <MainLayout currentPage={page} onNavigate={navigate} onAuthOpen={() => setAuthOpen(true)} onPostOpen={openPost}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page === 'profile' ? `profile-${pageParams?.userId || 'me'}` : page}
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8 }}
            transition={{ duration:0.2, ease:[0.22,1,0.36,1] }}
            style={{ background:'#ffffff', minHeight:'100vh' }}
          >
            <Suspense fallback={null}>{render(navigate, user, pageParams)}</Suspense>
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
    </ProfilePreviewProvider>
  );
}
