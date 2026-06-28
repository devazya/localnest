import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './BottomNav.module.css';
import {
  BuySellIcon, CommunityIcon, RidesIcon, RoommatesIcon,
  EventsIcon, HomeNavIcon,
} from '../../assets/icons/index.jsx';

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
    Icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

/* ── Post sheet options with 3D clay icons ── */
const POST_OPTIONS = [
  {
    id:'marketplace',
    label:'Sell an Item',
    sub:'List something for sale',
    color:'#D97706',
    Icon: () => <BuySellIcon size={26} />,
  },
  {
    id:'community',
    label:'Community Post',
    sub:'Share with neighbours',
    color:'#6D4AFF',
    Icon: () => <CommunityIcon size={26} />,
  },
  {
    id:'ride',
    label:'Offer a Ride',
    sub:'Share your commute',
    color:'#0284C7',
    Icon: () => <RidesIcon size={26} />,
  },
  {
    id:'roommate',
    label:'Find Roommate',
    sub:'Post a roommate request',
    color:'#EC4899',
    Icon: () => <RoommatesIcon size={26} />,
  },
  {
    id:'event',
    label:'Create Event',
    sub:'Organise a local event',
    color:'#7C3AED',
    Icon: () => <EventsIcon size={26} />,
  },
  {
    id:'pg',
    label:'Register Business',
    sub:'Add your shop or listing',
    color:'#059669',
    Icon: () => <HomeNavIcon size={26} />,
  },
];

export default function BottomNav({ currentPage, onNavigate, onAuthOpen, onPostOpen }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();

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
      setSheetOpen(true); return;
    }
    if (tab.id === 'profile' && !user) { onAuthOpen(); return; }
    onNavigate(tab.id);
  };

  const handleOption = (typeId) => {
    setSheetOpen(false);
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
                    whileTap={{ scale:0.88 }}
                    animate={{ rotate: sheetOpen ? 45 : 0 }}
                    transition={{ type:'spring', stiffness:500, damping:30 }}
                    aria-label="Create post"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </motion.button>
                  <span className={styles.tabLabel} style={{ opacity:0 }}>Post</span>
                </div>
              );
            }

            const active = isActive(tab);
            return (
              <motion.button
                key={tab.id}
                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                onClick={() => handleTab(tab)}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                whileTap={{ scale:0.88 }}
              >
                <div className={styles.iconBox}>
                  <tab.Icon active={active} />
                  {active && (
                    <motion.span
                      className={styles.activePill}
                      layoutId="navActivePill"
                      transition={{ type:'spring', stiffness:400, damping:32 }}
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

      {/* ── Post Sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="sheet-backdrop"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className={`sheet-panel ${styles.sheet}`}
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', stiffness:360, damping:34 }}
            >
              <div className="sheet-handle" />

              {/* Sheet header */}
              <div className={styles.sheetHead}>
                <span className={styles.sheetTitle}>What do you want to create?</span>
                <button className={styles.sheetClose} onClick={() => setSheetOpen(false)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Options */}
              <div className={styles.optionList}>
                {POST_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.id}
                    className={styles.optRow}
                    onClick={() => handleOption(opt.id)}
                    initial={{ opacity:0, y:12 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.04, ease:[0.22,1,0.36,1] }}
                    whileTap={{ scale:0.96 }}
                    style={{ '--c': opt.color }}
                  >
                    {/* 3D clay icon */}
                    <div className={styles.optIcon} style={{
                      background: `${opt.color}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    }}>
                      <opt.Icon />
                    </div>
                    <div className={styles.optText}>
                      <span className={styles.optLabel}>{opt.label}</span>
                      <span className={styles.optSub}>{opt.sub}</span>
                    </div>
                    <svg className={styles.optChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
