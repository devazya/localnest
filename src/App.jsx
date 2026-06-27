import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import './styles/globals.css';
import { testConnection } from './services/supabase/testConnection.js';
import Community from './pages/Community';
import RideShare from './pages/RideShare';
import Events from './pages/Events';
import BuySell from './pages/BuySell';
import Roommates from './pages/Roommates';

import { useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';

const PgListings   = lazy(() => import('./pages/PgListings'));
const PgDetails    = lazy(() => import('./pages/PgDetails'));
const Shops        = lazy(() => import('./pages/Shops'));
const Gyms         = lazy(() => import('./pages/Gyms'));
const UniversalPost = lazy(() => import('./components/UniversalPost'));

function Stub({ name, onNavigate }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Coming soon — check back after the next batch.</div>
      <button onClick={() => onNavigate('home')} style={{ marginTop: 8, background: 'var(--green-dim)', border: '1px solid rgba(110,231,183,0.25)', color: 'var(--green)', padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
        ← Back to Home
      </button>
    </div>
  );
}

const PAGE_COMPONENTS = {
  home:      (nav) => <Home       onNavigate={nav} />,
  pgs:       (nav, user) => <PgListings onNavigate={nav} user={user} />,
  pgdetails: (nav) => <PgDetails  onNavigate={nav} />,
  shops:     (nav) => <Shops      onNavigate={nav} />,
  gyms:      (nav) => <Gyms       onNavigate={nav} />,
  community: (nav) => <Community  onNavigate={nav} />,
  rideshare: (nav) => <RideShare  onNavigate={nav} />,
  events:    (nav) => <Events     onNavigate={nav} />,
  buysell:   (nav) => <BuySell    onNavigate={nav} />,
  roommates: (nav) => <Roommates  onNavigate={nav} />,
  profile:   (nav) => <Stub name="Profile" onNavigate={nav} />,
};

const POST_TYPE_PAGE = {
  pg:          'pgs',
  community:   'community',
  ride:        'rideshare',
  event:       'events',
  marketplace: 'buysell',
  roommate:    'roommates',
  shop:        'shops',
  gym:         'gyms',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authOpen, setAuthOpen]       = useState(false);
  const [postOpen, setPostOpen]       = useState(false);
  const [postType, setPostType]       = useState(null);

  // openPostAfterLogin: when the user clicks "+ Post" while logged out,
  // we open auth first, then automatically open the post modal once they
  // successfully sign in. This flag tracks that intent.
  const [openPostAfterLogin, setOpenPostAfterLogin] = useState(false);

  const { user } = useAuth();

  useEffect(() => { testConnection(); }, []);

  // When the user logs in and we were waiting to open the post modal, do it.
  useEffect(() => {
    if (user && openPostAfterLogin) {
      setOpenPostAfterLogin(false);
      setAuthOpen(false);
      setPostOpen(true);
    }
  }, [user, openPostAfterLogin]);

  // Also close the auth modal whenever the user becomes authenticated
  // (covers Google OAuth redirect and email/password login).
  useEffect(() => {
    if (user && authOpen) {
      setAuthOpen(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPost = (type = null) => {
    if (!user) {
      setOpenPostAfterLogin(true);
      setAuthOpen(true);
    } else {
      setPostType(type);
      setPostOpen(true);
    }
  };

  const navigate = (page) => {
    if (page === 'post') { openPost(); return; }
    if (page === 'post:pg') { openPost('pg'); return; }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostSuccess = (type) => {
    const targetPage = POST_TYPE_PAGE[type];
    if (targetPage) navigate(targetPage);
  };

  const renderPage = PAGE_COMPONENTS[currentPage] ?? PAGE_COMPONENTS['home'];
  const pageContent = renderPage(navigate, user);

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={navigate}
      onAuthOpen={() => setAuthOpen(true)}
      onPostOpen={openPost}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={null}>{pageContent}</Suspense>
        </motion.div>
      </AnimatePresence>

      <AuthModal
        isOpen={authOpen}
        onClose={() => { setAuthOpen(false); setOpenPostAfterLogin(false); }}
      />

      {postOpen && (
        <Suspense fallback={null}>
          <UniversalPost
            isOpen={postOpen}
            onClose={() => { setPostOpen(false); setPostType(null); }}
            onSuccess={handlePostSuccess}
            user={user}
            defaultType={postType}
          />
        </Suspense>
      )}
    </MainLayout>
  );
}
