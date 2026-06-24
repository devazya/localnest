import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '../../data/index';
import styles from './Navbar.module.css';

export default function Navbar({ currentPage, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <button className={styles.logo} onClick={() => handleNav('home')}>
            <div className={styles.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 6V14H10V10H6V14H2V6L8 1Z" fill="#0F1115" />
              </svg>
            </div>
            <span>Local<span className={styles.logoAccent}>Nest</span></span>
          </button>

          {/* Desktop nav links */}
          <nav className={styles.links}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                className={`${styles.link} ${currentPage === link.id ? styles.active : ''}`}
                onClick={() => handleNav(link.id)}
              >
                {link.label}
                {currentPage === link.id && (
                  <motion.div
                    className={styles.activeIndicator}
                    layoutId="nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.iconBtn} title="Notifications" onClick={() => {}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className={styles.iconBtn} title="Profile" onClick={() => handleNav('profile')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button className={styles.postBtn} onClick={() => handleNav('post')}>
              + Post
            </button>

            {/* Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className={`${styles.bar} ${mobileOpen ? styles.barTop : ''}`} />
              <span className={`${styles.bar} ${mobileOpen ? styles.barMid : ''}`} />
              <span className={`${styles.bar} ${mobileOpen ? styles.barBot : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileDrawer}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className={styles.mobileLinks}>
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  className={`${styles.mobileLink} ${currentPage === link.id ? styles.mobileLinkActive : ''}`}
                  onClick={() => handleNav(link.id)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {link.label}
                </motion.button>
              ))}
              <div className={styles.mobileDivider} />
              <button className={styles.mobilePostBtn} onClick={() => handleNav('post')}>
                + Post Something
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
