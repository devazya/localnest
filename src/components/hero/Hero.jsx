import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroBackground from './HeroBackground';
import LocalityNetwork from './LocalityNetwork';
import { LOCAL_PULSE } from '../../data/index';
import styles from './Hero.module.css';

const STATS = [
  { num: '186+', label: 'Active Residents' },
  { num: '42',   label: 'PG Listings' },
  { num: '31',   label: 'Posts Today' },
];

const FADE_UP = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

export default function Hero({ onNavigate }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) onNavigate('pgs');
  };

  return (
    <section className={styles.hero}>
      <HeroBackground />

      <div className={styles.inner}>
        {/* Left: Copy */}
        <div className={styles.copy}>
          <motion.div className={styles.eyebrow} {...FADE_UP(0)}>
            <span className={styles.eyebrowDot} />
            Green Sector · Anekal, Bangalore
          </motion.div>

          <motion.h1 className={styles.title} {...FADE_UP(0.1)}>
            Your locality,<br />
            <span className={styles.accent}>all in one place.</span>
          </motion.h1>

          <motion.p className={styles.subtitle} {...FADE_UP(0.2)}>
            Find PGs, discover shops, share rides, and connect with
            2,000+ residents in Green Sector — all on one premium platform.
          </motion.p>

          {/* Search */}
          <motion.form className={styles.searchBar} onSubmit={handleSearch} {...FADE_UP(0.3)}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* Quick links */}
          <motion.div className={styles.quickLinks} {...FADE_UP(0.38)}>
            {['PG Rooms', 'Gyms', 'Events', 'Rides'].map(label => (
              <button
                key={label}
                className={styles.quickLink}
                onClick={() => onNavigate(label.toLowerCase().replace(' ', ''))}
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div className={styles.stats} {...FADE_UP(0.45)}>
            {STATS.map((s, i) => (
              <div key={i} className={styles.stat}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
                {i < STATS.length - 1 && <div className={styles.statDivider} />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Network visualization */}
        <motion.div
          className={styles.networkWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className={styles.networkCard}>
            <div className={styles.networkLabel}>
              <span className={styles.networkDot} />
              Live Locality Network
            </div>
            <LocalityNetwork />
            <div className={styles.networkFooter}>
              <span>{LOCAL_PULSE.activeUsers} residents online</span>
              <span className={styles.networkPulse}>
                <span className={styles.pulseDot} />
                {LOCAL_PULSE.newPostsToday} posts today
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Local Pulse bar */}
      <motion.div
        className={styles.pulseBar}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <span className={styles.pulseDotLive} />
        <span className={styles.pulseTitle}>Local Pulse</span>
        <span className={styles.pulseSep}>·</span>
        <span className={styles.pulseItem}><b>{LOCAL_PULSE.newVacancies}</b> new vacancies</span>
        <span className={styles.pulseSep}>·</span>
        <span className={styles.pulseItem}><b>{LOCAL_PULSE.activeRides}</b> active rides</span>
        <span className={styles.pulseSep}>·</span>
        <span className={styles.pulseItem}><b>{LOCAL_PULSE.upcomingEvents}</b> events this week</span>
        <span className={styles.pulseSep}>·</span>
        <span className={styles.pulseItem}><b>{LOCAL_PULSE.buySellPosts}</b> buy/sell listings</span>
        <span className={styles.pulseSep}>·</span>
        <span className={styles.pulseItem}><b>{LOCAL_PULSE.activeUsers}</b> online now</span>
      </motion.div>
    </section>
  );
}
