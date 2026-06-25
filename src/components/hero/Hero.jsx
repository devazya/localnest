import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import HeroBackground from './HeroBackground';
import LocalityNetwork from './LocalityNetwork';
import { LOCAL_PULSE } from '../../data/index';
import {
  heroContainer, heroLine, heroSubtle,
  networkReveal, pulseBarReveal,
} from '../../animations/heroVariants';
import styles from './Hero.module.css';

const STATS = [
  { num: '2,000+', label: 'Active Residents' },
  { num: '42',     label: 'PG Listings' },
  { num: '186',    label: 'Online Now' },
];

const PULSE_ITEMS = [
  { val: LOCAL_PULSE.newVacancies,   label: 'new vacancies' },
  { val: LOCAL_PULSE.activeRides,    label: 'active rides' },
  { val: LOCAL_PULSE.upcomingEvents, label: 'events this week' },
  { val: LOCAL_PULSE.buySellPosts,   label: 'buy/sell posts' },
  { val: LOCAL_PULSE.activeUsers,    label: 'online now' },
];

export default function Hero({ onNavigate }) {
  const [query, setQuery] = useState('');
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const rawY      = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const parallaxY = useSpring(rawY, { stiffness: 80, damping: 20 });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) onNavigate('pgs');
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
          <motion.div className={styles.eyebrow} variants={heroLine}>
            <span className={styles.eyebrowDot} />
            <span>Green Sector · Anekal, Bangalore</span>
            <span className={styles.eyebrowPing} />
          </motion.div>

          <motion.h1 className={styles.title} variants={heroLine}>
            <span className={styles.titleLine}>Your locality,</span>
            <br />
            <span className={styles.titleGradient}>all in one place.</span>
          </motion.h1>

          <motion.p className={styles.subtitle} variants={heroSubtle}>
            Find PGs, discover local shops, share rides, and connect
            with your community — everything Green Sector, in one premium platform.
          </motion.p>

          <motion.form
            className={styles.searchBar}
            onSubmit={handleSearch}
            variants={heroSubtle}
          >
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search PGs, shops, gyms, events..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </motion.form>

          <motion.div className={styles.quickLinks} variants={heroSubtle}>
            {[
              { label: 'PG Rooms', id: 'pgs' },
              { label: 'Gyms',     id: 'gyms' },
              { label: 'Events',   id: 'events' },
              { label: 'Rides',    id: 'rideshare' },
              { label: 'Buy/Sell', id: 'buysell' },
            ].map(({ label, id }) => (
              <motion.button
                key={id}
                className={styles.quickLink}
                onClick={() => onNavigate(id)}
                whileHover={{ scale: 1.04, borderColor: 'rgba(110,231,183,0.35)', color: '#6EE7B7' }}
                whileTap={{ scale: 0.97 }}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>

          <motion.div className={styles.stats} variants={heroSubtle}>
            {STATS.map((s, i) => (
              <div key={i} className={styles.statGroup}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
                {i < STATS.length - 1 && <div className={styles.statDivider} />}
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
          <div className={styles.networkCard}>
            <div className={styles.networkHeader}>
              <div className={styles.networkTitle}>
                <span className={styles.liveDot} />
                Locality Network
              </div>
              <div className={styles.networkMeta}>
                {LOCAL_PULSE.activeUsers} online
              </div>
            </div>

            <div className={styles.networkViz}>
              <LocalityNetwork />
            </div>

            <div className={styles.networkFooter}>
              <div className={styles.footerStat}>
                <span className={styles.footerNum}>{LOCAL_PULSE.newPostsToday}</span>
                <span className={styles.footerLabel}>posts today</span>
              </div>
              <div className={styles.footerStat}>
                <span className={styles.footerNum}>{LOCAL_PULSE.activeRides}</span>
                <span className={styles.footerLabel}>active rides</span>
              </div>
              <div className={styles.footerStat}>
                <span className={styles.footerNum}>{LOCAL_PULSE.upcomingEvents}</span>
                <span className={styles.footerLabel}>events this wk</span>
              </div>
            </div>
          </div>

          {/* Floating accent cards */}
          <motion.div
            className={`${styles.floatCard} ${styles.floatCardTop}`}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className={styles.floatIcon}>🏠</span>
            <div>
              <div className={styles.floatTitle}>GreenNest PG</div>
              <div className={styles.floatSub}>₹8,500 · Available now</div>
            </div>
          </motion.div>

          <motion.div
            className={`${styles.floatCard} ${styles.floatCardBot}`}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <span className={styles.floatIcon}>🚗</span>
            <div>
              <div className={styles.floatTitle}>Ride to Cyber City</div>
              <div className={styles.floatSub}>Leaving 8:30 AM · 2 seats left</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Local Pulse ticker ── */}
      <motion.div
        className={styles.pulseBar}
        variants={pulseBarReveal}
        initial="initial"
        animate="animate"
      >
        <div className={styles.pulseLeft}>
          <span className={styles.pulseDot} />
          <span className={styles.pulseTitle}>Local Pulse</span>
        </div>
        <div className={styles.pulseItems}>
          {PULSE_ITEMS.map((item, i) => (
            <span key={i} className={styles.pulseItem}>
              <b className={styles.pulseNum}>{item.val}</b> {item.label}
              {i < PULSE_ITEMS.length - 1 && <span className={styles.pulseSep}>·</span>}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
