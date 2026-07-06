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
import { usePresence } from './hooks/usePresence';
import { GLOBAL_PRESENCE_ROOM } from './services/presence';
import UniversalCreator from './components/creator/UniversalCreator';

const PgListings    = lazy(() => import('./pages/PgListings'));
const PgDetails     = lazy(() => import('./pages/PgDetails'));
const Shops         = lazy(() => import('./pages/Shops'));
const Gyms          = lazy(() => import('./pages/Gyms'));
const UniversalPost = lazy(() => import('./components/UniversalPost'));

/* ── Onboarding flow ── */
const ONBOARDING_KEY = 'ln_onboarding_done';

/* ── Page registry ── */
const PAGES = {
  home:      (nav, user, params)  => <Home       onNavigate={nav} />,
  explore:   (nav, user, params)  => <Explore    onNavigate={nav} />,
  pgs:       (nav, user, params)  => <PgListings onNavigate={nav} user={user} />,
  pgdetails: (nav, user, params)  => <PgDetails  onNavigate={nav} />,
  shops:     (nav, user, params)  => <Shops      onNavigate={nav} />,
  gyms:      (nav, user, params)  => <Gyms       onNavigate={nav} />,
  community: (nav, user, params)  => <Community  onNavigate={nav} autoOpen={params?.autoOpen} />,
  rideshare: (nav, user, params)  => <RideShare  onNavigate={nav} />,
  events:    (nav, user, params)  => <Events     onNavigate={nav} />,
  buysell:   (nav, user, params)  => <BuySell    onNavigate={nav} />,
  roommates: (nav, user, params)  => <Roommates  onNavigate={nav} />,
  profile:   (nav, user, params)  => <Profile    onNavigate={nav} userId={params?.userId} />,
};

/* ── UniversalCreator typeId → routing logic ──────────────────────────────────
 *
 * 'discussion'           Navigate to Community, auto-open CreateDiscussionSheet
 * 'neighbourhood-update' Navigate to Community (neighbourhood-updates channel),
 *                        auto-open CreateUpdateModal
 * 'community-post'       Navigate to Community, auto-open CreatePostModal
 * 'list-pg'              Open existing UniversalPost with type='pg'
 * 'ride-offer'           Open existing UniversalPost with type='ride'   (7.2)
 * 'sell-item'            Open existing UniversalPost with type='marketplace' (7.2)
 * 'create-event'         Open existing UniversalPost with type='event'  (7.2)
 * 'ride-request'         Coming soon (7.2)
 * 'post-job'             Coming soon (7.2)
 * 'lost-found'           Coming soon (7.2)
 * 'ask-help'             Coming soon (7.2)
 * 'create-poll'          Coming soon (7.2)
 *
 * All "community-side" types navigate to Community with an `autoOpen`
 * param so the existing, unmodified modals open themselves via useEffect.
 * This keeps ALL composer logic exactly where it already lives.
 */
const CREATOR_ROUTES = {
  // → Community page with autoOpen signal
  'discussion':           { page: 'community', autoOpen: 'discussion' },
  'neighbourhood-update': { page: 'community', autoOpen: 'neighbourhood-update' },
  'community-post':       { page: 'community', autoOpen: 'community-post' },

  // → Existing UniversalPost modal (no page change)
  'list-pg':       { universalPostType: 'pg' },

  // → UniversalPost for types that already exist in it (7.2 will refine)
  'ride-offer':    { universalPostType: 'ride' },
  'sell-item':     { universalPostType: 'marketplace' },
  'create-event':  { universalPostType: 'event' },
};

export default function App() {
  /* ── Onboarding flow ── */
  const alreadySeen = () => {
    try { return !!localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  };
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
  const [page, setPage]                     = useState('home');
  const [pageParams, setPageParams]         = useState(null);
  const [authOpen, setAuthOpen]             = useState(false);
  const [postOpen, setPostOpen]             = useState(false);
  const [postType, setPostType]             = useState(null);
  const [postAfterLogin, setPostAfterLogin] = useState(false);
  const [pendingCreatorType, setPendingCreatorType] = useState(null);
  const [creatorSheetOpen, setCreatorSheetOpen] = useState(false);

  const { user } = useAuth();

  usePresence(GLOBAL_PRESENCE_ROOM, { userId: user?.id, active: !!user });
  useEffect(() => { testConnection(); }, []);

  /* After login completes, fire the pending creator action */
  useEffect(() => {
    if (user && postAfterLogin && pendingCreatorType) {
      setPostAfterLogin(false);
      setAuthOpen(false);
      handleCreatorType(pendingCreatorType);
      setPendingCreatorType(null);
    }
  }, [user, postAfterLogin, pendingCreatorType]); // eslint-disable-line

  useEffect(() => {
    if (user && authOpen) setAuthOpen(false);
  }, [user]); // eslint-disable-line

  /* ── Core creator dispatch ────────────────────────────────────────────────
   * Called by BottomNav (via onPostOpen) when the user picks a typeId.
   * Routes to the correct existing composer without duplicating any logic.
   */
  const handleCreatorType = (typeId) => {
    if (!user) {
      setPendingCreatorType(typeId);
      setPostAfterLogin(true);
      setAuthOpen(true);
      return;
    }

    const route = CREATOR_ROUTES[typeId];

    if (!route) {
      // Unknown / coming-soon type — do nothing (the card is labelled "Soon")
      return;
    }

    if (route.universalPostType) {
      // Open the existing UniversalPost modal
      setPostType(route.universalPostType);
      setPostOpen(true);
      return;
    }

    if (route.page) {
      // Navigate to the target page and pass autoOpen so the page's
      // own useEffect can open the right existing modal/sheet.
      setPage(route.page);
      setPageParams({ autoOpen: route.autoOpen });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* openPost — called by Navbar "Post" button and navigate('post')
   * With no type: open the Universal Creator sheet (the single entry point).
   * With a type:  route directly via handleCreatorType.
   */
  const openPost = (type = null) => {
    if (!user) { setPostAfterLogin(true); setAuthOpen(true); return; }
    if (type) {
      handleCreatorType(type);
    } else {
      // Open the Universal Creator picker — the single creation entry point.
      setCreatorSheetOpen(true);
    }
  };

  const navigate = (p, params = null) => {
    // 'post' with no type — open the Universal Creator
    if (p === 'post') { openPost(); return; }
    // 'post:typeId' — e.g. from page-level "+ Sell Something" buttons
    // Route through the Universal Creator so there is ONE creation entry point.
    if (typeof p === 'string' && p.startsWith('post:')) {
      const typeAlias = p.slice(5); // e.g. 'marketplace', 'ride', 'event'
      // Map page-level aliases to Universal Creator typeIds
      const aliasMap = {
        marketplace: 'sell-item',
        ride:        'ride-offer',
        event:       'create-event',
        pg:          'list-pg',
      };
      const typeId = aliasMap[typeAlias] || typeAlias;
      handleCreatorType(typeId);
      return;
    }
    setPage(p);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProfile = (userId) => navigate('profile', { userId });

  /* ── Pre-app onboarding flow ── */
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
      <MainLayout
        currentPage={page}
        onNavigate={navigate}
        onAuthOpen={() => setAuthOpen(true)}
        onPostOpen={handleCreatorType}
      >
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

        <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); setPostAfterLogin(false); setPendingCreatorType(null); }} />

        {/* Root-level Universal Creator — opened by Navbar "Post" button and navigate('post') */}
        <UniversalCreator
          isOpen={creatorSheetOpen}
          onClose={() => setCreatorSheetOpen(false)}
          onSelect={(typeId) => { setCreatorSheetOpen(false); setTimeout(() => handleCreatorType(typeId), 180); }}
          context={page}
        />

        {/* Existing UniversalPost modal — only for non-community post types */}
        {postOpen && (
          <Suspense fallback={null}>
            <UniversalPost
              isOpen={postOpen}
              onClose={() => { setPostOpen(false); setPostType(null); }}
              onSuccess={(type) => {
                const pageMap = { pg:'pgs', ride:'rideshare', event:'events', marketplace:'buysell', roommate:'roommates', shop:'shops', gym:'gyms' };
                const dest = pageMap[type];
                if (dest) navigate(dest);
              }}
              user={user}
              defaultType={postType}
            />
          </Suspense>
        )}
      </MainLayout>
    </ProfilePreviewProvider>
  );
}
