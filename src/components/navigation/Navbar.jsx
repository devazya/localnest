import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';
import { useAuth } from '../../context/AuthContext';

/* The mockup shows NO top navbar on mobile.
   On desktop (960px+) we show a slim navigation bar.
   On mobile the home page manages its own header. */

const DESKTOP_LINKS = [
  { id:'home',      label:'Home' },
  { id:'explore',   label:'Explore' },
  { id:'pgs',       label:'PG Listings' },
  { id:'community', label:'Community' },
  { id:'events',    label:'Events' },
  { id:'buysell',   label:'Buy & Sell' },
];

export default function Navbar({ currentPage, onNavigate, onAuthOpen, onPostOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.header
      className={styles.nav}
      animate={{
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        borderBottomColor: scrolled ? 'rgba(109,74,255,0.09)' : 'transparent',
        boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.06)' : 'none',
      }}
      transition={{ duration:0.24, ease:[0.22,1,0.36,1] }}
    >
      <div className={styles.inner}>
        {/* Logo */}
        <motion.button className={styles.logo} onClick={() => onNavigate('home')} whileTap={{ scale:0.95 }}>
          <div className={styles.logoIcon}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 6V14H10V10H6V14H2V6L8 1Z" fill="#fff"/>
            </svg>
          </div>
          Local<span className={styles.accent}>Nest</span>
        </motion.button>

        {/* Desktop links */}
        <nav className={styles.links}>
          {DESKTOP_LINKS.map(l => {
            const active = currentPage === l.id;
            return (
              <button
                key={l.id}
                className={`${styles.link} ${active ? styles.linkActive : ''}`}
                onClick={() => onNavigate(l.id)}
                style={{ position:'relative' }}
              >
                {l.label}
                {active && (
                  <motion.span
                    className={styles.activeDot}
                    layoutId="desktopNavDot"
                    transition={{ type:'spring', stiffness:400, damping:30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          {user ? (
            <button
              className={styles.avatarBtn}
              title={user.email}
              onClick={() => {
                const a = window.confirm('Logout?');
                if (a) signOut(); else onNavigate('profile');
              }}
            >
              <img
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=6D4AFF&color=fff`}
                alt="avatar" className={styles.avatarImg}
              />
            </button>
          ) : (
            <button className={styles.signInBtn} onClick={onAuthOpen}>Sign in</button>
          )}
          <button className={styles.postBtn} onClick={() => { if(onPostOpen) onPostOpen(); else onNavigate('post'); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Post
          </button>
        </div>
      </div>
    </motion.header>
  );
}
