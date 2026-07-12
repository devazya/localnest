import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './BottomNav.module.css';
import UniversalCreator from '../creator/UniversalCreator';

const LONG_PRESS_MS = 500;

/* ── Tabs ── */
const TABS = [
  {
    id:'home', label:'Home',
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?0:2} strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          : <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></>
        }
      </svg>
    ),
  },
  {
    id:'explore', label:'Explore',
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  { id:'post', label:'Post', isAction:true },
  {
    id:'community', label:'Community',
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id:'profile', label:'Profile',
    isProfile:true,
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav({ currentPage, onNavigate, onAuthOpen, onPostOpen }) {
  const [creatorOpen, setCreatorOpen] = useState(false);
  const { user } = useAuth();
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);

  const isActive = (tab) => {
    if (tab.id === 'home')      return currentPage === 'home';
    if (tab.id === 'explore')   return currentPage === 'explore';
    if (tab.id === 'community') return currentPage === 'community';
    if (tab.id === 'profile')   return currentPage === 'profile';
    return false;
  };

  const handleTab = (tab) => {
    if (tab.isAction) {
      if (!user) { onAuthOpen(); return; }
      setCreatorOpen(true);
      return;
    }
    if (tab.id === 'profile') {
      if (longPressFired.current) { longPressFired.current = false; return; }
      if (!user) { onAuthOpen(); return; }
      onNavigate('profile');
      return;
    }
    onNavigate(tab.id);
  };

  // Long-press on Profile → Friend (moved here from the old header avatar;
  // dispatched as a window event since FriendSection only exists on Home).
  const startProfilePress = () => {
    longPressFired.current = false;
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      window.dispatchEvent(new CustomEvent('ln:friend-longpress'));
    }, LONG_PRESS_MS);
  };
  const endProfilePress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const avatarUrl = user?.user_metadata?.avatar_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'Neighbour')}&background=8B5CF6&color=fff`;

  // Called when the user picks an option inside UniversalCreator
  const handleCreatorSelect = (typeId) => {
    if (onPostOpen) onPostOpen(typeId);
  };

  return (
    <>
      {/* ── Nav bar ── */}
      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <div className={styles.inner}>
          {TABS.map(tab => {
            if (tab.isAction) {
              return (
                <div key="post" className={styles.actionWrap}>
                  <motion.button
                    className={styles.actionBtn}
                    onClick={() => handleTab(tab)}
                    whileTap={{ scale: 0.88 }}
                    animate={{ rotate: creatorOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    aria-label="Create post"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </motion.button>
                  <span className={styles.tabLabel} style={{ opacity: 0 }}>Post</span>
                </div>
              );
            }

            const active = isActive(tab);
            const isProfile = tab.isProfile && !!user;
            return (
              <motion.button
                key={tab.id}
                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                onClick={() => handleTab(tab)}
                onPointerDown={tab.isProfile ? startProfilePress : undefined}
                onPointerUp={tab.isProfile ? endProfilePress : undefined}
                onPointerLeave={tab.isProfile ? endProfilePress : undefined}
                aria-label={tab.isProfile ? 'Profile — long-press to talk to Friend' : tab.label}
                aria-current={active ? 'page' : undefined}
                whileTap={{ scale: 0.88 }}
              >
                <div className={styles.iconBox}>
                  {isProfile ? (
                    <span className={`${styles.avatar} ${active ? styles.avatarActive : ''}`}>
                      <img src={avatarUrl} alt="" className={styles.avatarImg} />
                    </span>
                  ) : (
                    <tab.Icon active={active} />
                  )}
                  {active && (
                    <motion.span
                      className={styles.activePill}
                      layoutId="navActivePill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </div>
                <span className={`${styles.tabLabel} ${active ? styles.tabLabelActive : ''}`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* ── Universal Creator Sheet ── */}
      <UniversalCreator
        isOpen={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        onSelect={handleCreatorSelect}
        context={currentPage}
      />
    </>
  );
}
