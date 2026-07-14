import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import HeroBackground from './HeroBackground';
import LocalityNetwork from './LocalityNetwork';
import LivePulseContextPanel from './LivePulseContextPanel';
import { fetchLocalPulsePills } from '../../services/localPulse';
import { LOCAL_PULSE } from '../../data/index';
import {
  heroContainer, heroLine, heroSubtle,
  networkReveal, pulseBarReveal,
} from '../../animations/heroVariants';
import styles from './Hero.module.css';

/* ── Stats ── */
const STATS = [
  { num: '2,000+', label: 'Active Residents', icon: '👥' },
  { num: '42',     label: 'PG Listings',      icon: '🏠' },
  { num: '186',    label: 'Online Now',        icon: '📶' },
];

/* ── Pulse items ── */
const PULSE_ITEMS = [
  { val: LOCAL_PULSE.newVacancies,   label: 'new vacancies' },
  { val: LOCAL_PULSE.activeRides,    label: 'active rides' },
  { val: LOCAL_PULSE.upcomingEvents, label: 'events this week' },
  { val: LOCAL_PULSE.buySellPosts,   label: 'buy/sell posts' },
  { val: LOCAL_PULSE.activeUsers,    label: 'online now' },
];

/* ── Rotating ride data ── */
const LIVE_RIDES = [
  { destination: 'Electronic City', time: 'Leaving in 15 mins', seats: 2 },
  { destination: 'Koramangala',     time: 'Leaving at 9:00 AM',  seats: 3 },
  { destination: 'Whitefield',      time: 'Leaving in 30 mins', seats: 1 },
  { destination: 'HSR Layout',      time: 'Leaving at 8:45 AM',  seats: 4 },
  { destination: 'Bellandur',       time: 'Leaving in 10 mins', seats: 2 },
  { destination: 'Marathahalli',    time: 'Leaving at 9:15 AM',  seats: 3 },
];

export default function Hero({ onNavigate }) {
  const [query, setQuery]       = useState('');
  const [rideIdx, setRideIdx]   = useState(0);
  const [pulsePills, setPulsePills] = useState(null); // null = still loading, network uses its static fallback
  const [activePulseNode, setActivePulseNode] = useState(null);
  const heroRef                 = useRef(null);

  /* Live Local Pulse categories, sourced from feed_items (see localPulse.js) */
  useEffect(() => {
    let cancelled = false;
    fetchLocalPulsePills().then(pills => { if (!cancelled) setPulsePills(pills); });
    return () => { cancelled = true; };
  }, []);

  /* Parallax */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const rawY      = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const parallaxY = useSpring(rawY, { stiffness: 80, damping: 20 });

  /* Rotate rides every 5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setRideIdx(i => (i + 1) % LIVE_RIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const currentRide = useMemo(() => LIVE_RIDES[rideIdx], [rideIdx]);

  const handleSearch = (e) => {
    e.preventDefault();
    onNavigate('pgs');
  };

  return (
    <section className={styles.hero} ref={heroRef}>
      <HeroBackground />

      <div className={styles.inner}>
        {/* ── Left: Copy ── */}
        <motion.div
          className={styles.copy}
          variants={heroContainer}
          initial="initial"
          animate="animate"
          style={{ y: parallaxY }}
        >
          {/* Location badge */}
          <motion.div className={styles.eyebrow} variants={heroLine}>
            <span className={styles.eyebrowDot}>📍</span>
            <span>Green Sector · Anekal, Bangalore</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 className={styles.title} variants={heroLine}>
            <span className={styles.titleLine}>Your locality,</span>
            <span className={styles.titleGradient}>all in one place.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p className={styles.subtitle} variants={heroSubtle}>
            Find PGs, discover local shops, share rides, join events and connect
            with your community — everything Green Sector, in one premium platform.
          </motion.p>

          {/* Search */}
          <motion.form
            className={styles.searchBar}
            onSubmit={handleSearch}
            variants={heroSubtle}
            aria-label="Search LocalNest"
          >
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search PGs, shops, gyms, events..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search"
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </motion.form>

          {/* Quick pill links */}
          <motion.div className={styles.quickLinks} variants={heroSubtle} role="navigation" aria-label="Quick categories">
            {[
              { label: '🏠 PG Rooms', id: 'pgs' },
              { label: '🛍️ Shops',    id: 'shops' },
              { label: '🏋️ Gyms',     id: 'gyms' },
              { label: '📅 Events',   id: 'events' },
              { label: '🚗 Rides',    id: 'rideshare' },
              { label: '🏷️ Buy/Sell', id: 'buysell' },
            ].map(({ label, id }) => (
              <motion.button
                key={id}
                className={styles.quickLink}
                onClick={() => onNavigate(id)}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label={`Browse ${label}`}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div className={styles.stats} variants={heroSubtle} role="region" aria-label="Community stats">
            {STATS.map((s, i) => (
              <div key={i} className={styles.statGroup}>
                <div className={styles.stat}>
                  <span className={styles.statIcon} aria-hidden="true">{s.icon}</span>
                  <div className={styles.statText}>
                    <span className={styles.statNum}>{s.num}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                </div>
                {i < STATS.length - 1 && <div className={styles.statDivider} aria-hidden="true" />}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: Network card ── */}
        <motion.div
          className={styles.networkWrapper}
          variants={networkReveal}
          initial="initial"
          animate="animate"
        >
          {/* Top floating PG card */}
          <motion.div
            className={`${styles.floatCard} ${styles.floatCardTop}`}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => onNavigate('pgs')}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate('pgs')}
            aria-label="View GreenNest PG listing"
          >
            <span className={styles.floatIcon} aria-hidden="true">🏠</span>
            <div>
              <div className={styles.floatTitle}>GreenNest PG</div>
              <div className={styles.floatSub}>₹8,500 · Available now</div>
            </div>
          </motion.div>

          <div className={styles.networkCard}>
            {/* Card header */}
            <div className={styles.networkHeader}>
              <div className={styles.networkHeaderLeft}>
                <div className={styles.networkTitle}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  LOCALITY NETWORK
                </div>
                <div className={styles.networkSubtitle}>Live Community Activity</div>
              </div>
              <div className={styles.networkMeta}>
                <span className={styles.networkMetaDot} aria-hidden="true" />
                <span>{LOCAL_PULSE.activeUsers} online now</span>
              </div>
            </div>

            {/* SVG network viz — premium background inside card */}
            <div className={styles.networkVizWrap}>
              {/* Slideshow layer — INSIDE card only */}
              <NetworkCardSlideshow />
              {/* Ambient glows */}
              <div className={styles.ambientGlowTL} aria-hidden="true" />
              <div className={styles.ambientGlowTR} aria-hidden="true" />
              <div className={styles.ambientGlowCenter} aria-hidden="true" />
              {/* Glass overlay above photo, below graph */}
              <div className={styles.glassOverlay} aria-hidden="true" />
              {/* Network graph on top */}
              <div className={styles.networkViz}>
                <LocalityNetwork
                  onNavigate={onNavigate}
                  categories={pulsePills}
                  onActiveChange={setActivePulseNode}
                />
              </div>
            </div>

            {/* Footer stats */}
            <div className={styles.networkFooter}>
              {[
                { num: LOCAL_PULSE.newPostsToday, label: 'posts today' },
                { num: LOCAL_PULSE.activeRides,   label: 'active rides' },
                { num: LOCAL_PULSE.upcomingEvents, label: 'events this week' },
              ].map((s, i, arr) => (
                <div key={i} className={styles.footerStat}>
                  <span className={styles.footerNum}>{s.num}</span>
                  <span className={styles.footerLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom rotating ride widget */}
          <div
            className={`${styles.floatCard} ${styles.floatCardBot} ${styles.rideWidget}`}
            aria-label="Live ride share widget"
          >
            <div className={styles.rideWidgetInner}>
              <div className={styles.rideWidgetHeader}>
                <span className={styles.floatIcon} aria-hidden="true">🚗</span>
                <span className={styles.liveBadge} aria-label="Live">LIVE</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={rideIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={styles.rideContent}
                >
                  <div className={styles.floatTitle}>Ride to {currentRide.destination}</div>
                  <div className={styles.rideMeta}>
                    <span className={styles.rideTime}>{currentRide.time}</span>
                    <span className={styles.rideDot} aria-hidden="true">·</span>
                    <span className={styles.rideSeats}>{currentRide.seats} seats left</span>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className={styles.rideActions}>
                <button
                  className={styles.rideBtnPrimary}
                  onClick={() => onNavigate('rideshare')}
                  aria-label="Join this ride"
                >
                  Join Ride
                </button>
                <button
                  className={styles.rideBtnGhost}
                  onClick={() => onNavigate('rideshare')}
                  aria-label="View route"
                >
                  View Route
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Local Pulse ticker ── */}
      <motion.div
        className={styles.pulseBar}
        variants={pulseBarReveal}
        initial="initial"
        animate="animate"
        role="region"
        aria-label="Local pulse stats"
      >
        <div className={styles.pulseLeft}>
          <span className={styles.pulseDot} aria-hidden="true" />
          <span className={styles.pulseTitle}>Local Pulse</span>
        </div>
        <div className={styles.pulseItems}>
          {PULSE_ITEMS.map((item, i) => (
            <span key={i} className={styles.pulseItem}>
              <b className={styles.pulseNum}>{item.val}</b>{item.label}
              {i < PULSE_ITEMS.length - 1 && <span className={styles.pulseSep} aria-hidden="true">·</span>}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Local Pulse spotlight — sits below the whole widget, narrates
           whatever the laser just reached inside LocalityNetwork ── */}
      <LivePulseContextPanel node={activePulseNode} onNavigate={onNavigate} />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Slideshow — contained entirely inside the network card
───────────────────────────────────────────────────────── */
const BANGALORE_IMAGES = [
  'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=900&q=80', // MG Road
  'https://images.unsplash.com/photo-1529243856184-fd5f9833c587?w=900&q=80', // Cubbon Park
  'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&q=80', // Koramangala streets
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&q=80', // Bangalore street
  'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&q=80', // City skyline
];

function NetworkCardSlideshow() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % BANGALORE_IMAGES.length), 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.slideshow} aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={BANGALORE_IMAGES[idx]}
          alt=""
          className={styles.slideshowImg}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 2.2, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  );
}
