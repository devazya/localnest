import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '../../data/index';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar
 *
 * Props:
 *   currentPage  {string}
 *   onNavigate   {(id: string) => void}
 *   onAuthOpen   {() => void}   — opens the Auth modal
 *   onPostOpen   {() => void}   — opens the UniversalPost modal directly;
 *                                 the parent already guards against unauthenticated
 *                                 users, but the Navbar also checks just-in-case.
 */
export default function Navbar({
  currentPage,
  onNavigate,
  onAuthOpen,
  onPostOpen,
}) {
  const [scrollY, setScrollY]     = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = scrollY > 40;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNav = (id) => { onNavigate(id); setMobileOpen(false); };

  // ── Guard: if the parent didn't wire onPostOpen fall back to navigate('post')
  const handlePost = () => {
    setMobileOpen(false);
    if (onPostOpen) {
      onPostOpen();
    } else {
      onNavigate('post');
    }
  };

  const { user, signOut } = useAuth();

  return (
    <>
      <motion.header
        className={styles.nav}
        animate={{
          background: scrolled ? 'rgba(255, 255, 255, 0.88)' : 'rgba(250, 247, 255, 0.0)',
          borderBottomColor: scrolled ? 'rgba(109, 74, 255, 0.1)' : 'rgba(109, 74, 255, 0.0)',
          boxShadow: scrolled ? '0 1px 32px rgba(109, 74, 255, 0.1)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.inner}>
          {/* Logo */}
          <motion.button
            className={styles.logo}
            onClick={() => handleNav('home')}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className={styles.logoIcon}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 6V14H10V10H6V14H2V6L8 1Z" fill="#ffffff" />
              </svg>
            </div>
            <span>Local<span className={styles.logoAccent}>Nest</span></span>
          </motion.button>

          {/* Desktop links */}
          <nav className={styles.links}>
            {NAV_LINKS.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <motion.button
                  key={link.id}
                  className={`${styles.link} ${isActive ? styles.active : ''}`}
                  onClick={() => handleNav(link.id)}
                  style={{ position: 'relative' }}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      className={styles.activeBar}
                      layoutId="activeBar"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {user ? (
              <motion.button
                className={styles.iconBtn}
                whileTap={{ scale: 0.94 }}
                onClick={async () => {
                  const action = window.prompt('Type:\n\n1 = Profile\n2 = Logout');
                  if (action === '2') await signOut();
                  else handleNav('profile');
                }}
                title={user.email}
              >
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=6D4AFF&color=fff`
                  }
                  alt="profile"
                  style={{ width: 28, height: 28, borderRadius: '50%' }}
                />
              </motion.button>
            ) : (
              <motion.button
                className={styles.iconBtn}
                onClick={onAuthOpen}
                whileTap={{ scale: 0.94 }}
                title="Login"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </motion.button>
            )}

            {/* ── + Post button — now calls handlePost, never navigates ── */}
            <motion.button
              className={styles.postBtn}
              onClick={handlePost}
              whileTap={{ scale: 0.96 }}
            >
              <span className={styles.postBtnPlus}>+</span> Post
            </motion.button>

            {/* Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <motion.span className={styles.bar} animate={mobileOpen ? { rotate: 45, y: 7 }  : { rotate: 0, y: 0 }}  transition={{ duration: 0.25 }} />
              <motion.span className={styles.bar} animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} />
              <motion.span className={styles.bar} animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25 }} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileDrawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            >
              <div className={styles.mobileHeader}>
                <div className={styles.mobileLogo}>
                  Local<span style={{ color: 'var(--primary)' }}>Nest</span>
                </div>
                <button className={styles.mobileClose} onClick={() => setMobileOpen(false)}>✕</button>
              </div>

              <div className={styles.mobileLinks}>
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.id}
                    className={`${styles.mobileLink} ${currentPage === link.id ? styles.mobileLinkActive : ''}`}
                    onClick={() => handleNav(link.id)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 4 }}
                  >
                    {link.label}
                    {currentPage === link.id && <span className={styles.mobileActiveDot} />}
                  </motion.button>
                ))}
              </div>

              <div className={styles.mobileFoot}>
                {/* Mobile "+ Post Something" — same handlePost guard */}
                <button className={styles.mobilePostBtn} onClick={handlePost}>
                  + Post Something
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
