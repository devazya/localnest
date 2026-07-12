/**
 * Segment1Home.jsx
 * Composition root for the Home Segment 1 rebuild (Design Spec v2.3).
 * Wires together HeroSection → FriendSection → PrimaryModuleRow →
 * ContextFilterRow → DynamicContentFeed and owns the two pieces of client
 * state the spec calls for (§14): `activeModule` and `lastFilterByModule`.
 *
 * This is the ONLY export Home.jsx needs to import for Segment 1 — keeps
 * Home.jsx itself limited to what's below the fold (Ride Hub onward),
 * which this rebuild does not touch.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useHomeSegment1 } from '../../../hooks/useHomeSegment1';
import HeroSection from './HeroSection';
import FriendSection from './FriendSection';
import PrimaryModuleRow from './PrimaryModuleRow';
import ContextFilterRow from './ContextFilterRow';
import DynamicContentFeed from './DynamicContentFeed';
import { MODULE_BY_ID } from '../../../data/homeModules';
import styles from './Segment1Home.module.css';

// Where a Dynamic Content Feed card tap should land — reuses existing,
// already-built pages rather than inventing a new destination.
const MODULE_ROUTE = {
  neibo: 'community',
  neara: 'shops',
  stay: 'pgs',
  marketplace: 'buysell',
  vroom: 'rideshare',
};

export default function Segment1Home({ onNavigate, nearbyPostCount = 0 }) {
  const { user, profile } = useAuth();
  const { modules, activeModule, activeFilter, selectModule, selectFilter } = useHomeSegment1();
  const friendSectionRef = useRef(null);
  const [friendPulse, setFriendPulse] = useState(false);

  const activeModuleDef = MODULE_BY_ID[activeModule];
  const activeFilterDef = activeModuleDef.contextFilters.find((f) => f.id === activeFilter) || activeModuleDef.contextFilters[0];

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

      <PrimaryModuleRow modules={modules} activeModule={activeModule} onSelect={selectModule} />
      <ContextFilterRow module={activeModuleDef} activeFilter={activeFilter} onSelect={selectFilter} />
      <DynamicContentFeed
        moduleId={activeModule}
        filterId={activeFilter}
        moduleLabel={activeModuleDef.label}
        filterLabel={activeFilterDef.label}
        onOpenModule={(id) => onNavigate(MODULE_ROUTE[id] || 'explore')}
        userId={user?.id}
      />
    </div>
  );
}
