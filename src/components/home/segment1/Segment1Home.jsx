/**
 * Segment1Home.jsx
 * Composition root for the Home Segment 1 rebuild (Design Spec v2.3).
 *
 * The Primary Module row (Neibo/Neara/Stay/Marketplace/Vroom) + Context
 * Filter row (Highlights/Sports/Events/Activity/...) + Dynamic Content
 * Feed have been pulled off Home per product decision — not deleted,
 * just not rendered here. The components, the useHomeSegment1 hook, and
 * data/homeModules.js are all untouched and still fully wired to each
 * other; re-enabling them on Home (or wiring them into Explore instead)
 * is a matter of restoring the block that's commented out below, no
 * rebuild needed. See git history / the previous version of this file
 * for the exact JSX if picking this back up.
 *
 * Home.jsx still only needs this one export for Segment 1 — keeps
 * Home.jsx itself limited to what's below the fold (Ride Hub onward),
 * which this rebuild does not touch.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import HeroSection from './HeroSection';
import FriendSection from './FriendSection';
import styles from './Segment1Home.module.css';

export default function Segment1Home({ onNavigate, nearbyPostCount = 0 }) {
  const { user, profile } = useAuth();
  const friendSectionRef = useRef(null);
  const [friendPulse, setFriendPulse] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Neighbour';

  const handleFriendLongPress = useCallback(() => {
    friendSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFriendPulse(true);
    setTimeout(() => setFriendPulse(false), 900);
  }, []);

  // BottomNav's Profile tab (long-press) dispatches this global event so it
  // can trigger Friend here without prop-drilling through MainLayout —
  // BottomNav is app-level chrome, FriendSection only exists on Home.
  useEffect(() => {
    window.addEventListener('ln:friend-longpress', handleFriendLongPress);
    return () => window.removeEventListener('ln:friend-longpress', handleFriendLongPress);
  }, [handleFriendLongPress]);

  return (
    <div className={styles.root}>
      <HeroSection
        name={firstName}
        locality="Green Sector"
        city="Bangalore"
        nearbyPostCount={nearbyPostCount}
        onNotificationsClick={() => {}}
        onBookmarkClick={() => onNavigate('saved')}
        onSearchActivate={() => onNavigate('explore')}
      />

      <div ref={friendSectionRef} className={friendPulse ? styles.pulse : undefined}>
        <FriendSection />
      </div>
    </div>
  );
}
