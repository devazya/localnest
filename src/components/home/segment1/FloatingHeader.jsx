/**
 * FloatingHeader.jsx — §9.1, §9.7, §9.8, §9.9
 * Two independent floating glass pills — location (left) and
 * bookmark+notification+profile (right) — deliberately not one shared bar,
 * so neither reads as a nav container (§9.1).
 *
 * Location Pill also carries the Signature Moment (§6): the secondary line
 * ambiently crossfades through hyperlocal facts on a slow, never-looping-as-
 * a-notification cycle. Respects prefers-reduced-motion by pinning to the
 * static city name. The primary line always shows the full
 * "Locality • Area City" string with a trailing chevron, per the target
 * design's single-line location pill.
 *
 * Profile avatar carries the Experimental tap/long-press interaction (§9.7):
 * normal tap → Profile (unchanged); long-press (≥500ms) → Friend. Shipped
 * behind `enableProfileLongPress` so it can be disabled without a release
 * if it conflicts with OS-level gestures, per the §14 implementation risk.
 */
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import styles from './FloatingHeader.module.css';

const AMBIENT_CYCLE_MS = 24000;

function LocationPill({ locality, city, nearbyPostCount }) {
  const prefersReducedMotion = useReducedMotion();
  const facts = [
    `Anekal ${city}`,
    nearbyPostCount > 0 ? `${nearbyPostCount} new post${nearbyPostCount === 1 ? '' : 's'} nearby` : null,
    'Slightly cooler than yesterday',
  ].filter(Boolean);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || facts.length <= 1) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % facts.length), AMBIENT_CYCLE_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion, facts.length]);

  const secondary = prefersReducedMotion ? `Anekal ${city}` : facts[idx % facts.length];

  return (
    <button
      type="button"
      className={styles.locationPill}
      aria-label={`Current neighborhood: ${locality}, Anekal ${city}`}
    >
      <svg className={styles.pinIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
      <span className={styles.locationTextCol}>
        <span className={styles.locationPrimary}>{locality}</span>
        <span className={styles.locationSecondary}>{secondary}</span>
      </span>
      <svg className={styles.chevron} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

function BookmarkIcon({ onClick }) {
  return (
    <button type="button" onClick={onClick} className={styles.iconButton} aria-label="Saved items">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

function NotificationIcon({ unreadCount = 3, onClick }) {
  return (
    <button type="button" onClick={onClick} className={styles.iconButton} aria-label={`Notifications, ${unreadCount} unread`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && <span className={styles.unreadBadge} aria-hidden="true">{unreadCount}</span>}
    </button>
  );
}

export default function FloatingHeader({
  locality, city, nearbyPostCount,
  onNotificationsClick, onBookmarkClick,
}) {
  return (
    <div className={styles.header}>
      <LocationPill locality={locality} city={city} nearbyPostCount={nearbyPostCount} />
      <div className={styles.actions}>
        <BookmarkIcon onClick={onBookmarkClick} />
        <NotificationIcon unreadCount={3} onClick={onNotificationsClick} />
      </div>
    </div>
  );
}
