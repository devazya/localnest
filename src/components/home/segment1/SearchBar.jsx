/**
 * SearchBar.jsx — §9.2
 * Full Level 2 glass surface, 56px tall, rounded-[22px]. On focus: border
 * transitions to accent at 40% opacity + shadow upgrade — no scale, since
 * scaling a field the user is about to type into feels unstable (§9.2).
 * Overlaps the hero/content boundary by 32px — handled by HeroSection via
 * negative margin, not by this component.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './SearchBar.module.css';

export default function SearchBar({ onActivate, onMicClick }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.button
      type="button"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={onActivate}
      className={styles.bar}
      data-focused={focused || undefined}
      aria-label="Search LocalNest"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--s1-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
      </svg>
      <span className={styles.placeholder}>Search shops, PGs, gyms, events...</span>
      <span
        role="button"
        tabIndex={0}
        aria-label="Voice search"
        className={styles.mic}
        onClick={(e) => { e.stopPropagation(); onMicClick?.(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onMicClick?.(); } }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--s1-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
        </svg>
      </span>
    </motion.button>
  );
}
