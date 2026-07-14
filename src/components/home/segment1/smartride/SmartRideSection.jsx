/**
 * SmartRideSection.jsx
 * ---------------------------------------------------------------------
 * "Smart Ride" — the Google-Flights-for-local-transport moment on Home.
 * Registered as the `smart-ride` entry in config/homeSections.js, between
 * Neighbourhood Pulse and Let's Play.
 *
 * INTERACTION MODEL (per product direction)
 * The destination field is NOT a plain text input living inside this
 * card. Tapping it opens AddressSearchSheet — a full command-palette
 * bottom sheet (Home/Work, recents, live suggestions) — so Home stays a
 * single calm trigger and all of the destination-picking complexity
 * (and its future autocomplete/AI-suggestion hooks) lives in one place
 * that can grow without ever re-cluttering Home. There is no separate
 * "Compare Rides" button: the trigger pill IS the entry point, and the
 * instant a destination is picked in the sheet, Smart Ride navigates
 * straight to the full-screen Ride Comparison result — one motion, no
 * extra tap.
 *
 * SCOPE (see project brief)
 * Live ride APIs / real-time fares are still out of scope here — the
 * Ride Comparison screen shows clearly-labelled estimated pricing.
 * Everything else (useAddressSearch + smartRide.js service, provider
 * list) is the real, backend-driven architecture the live version will
 * plug into.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassSurface from '../../../shared/GlassSurface';
import OfferRideCard from '../../shared/OfferRideCard';
import AddressSearchSheet from './AddressSearchSheet';
import { useAddressSearch } from '../../../../hooks/useAddressSearch';
import { useAuth } from '../../../../context/AuthContext';
import styles from './SmartRideSection.module.css';

export default function SmartRideSection({ onNavigate }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const search = useAddressSearch(userId);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={styles.wrapper}
    >
      <GlassSurface level={2} as="div" className={styles.card}>
        {/* Moving-car scene — restored verbatim from the old Ride Hub card
            (HomeCoreSection.jsx RideHub), now filling the whole section
            with the header written directly on top of it, per request. */}
        <div className={styles.motionScene}>
          <div className={styles.scrim} aria-hidden="true" />
          <header className={styles.header}>
            <h2 className={styles.title}>🚕 Smart Ride</h2>
            <p className={styles.subtitle}>Compare every ride in one place.</p>
            <p className={styles.helper}>Save time. Save money. Travel smarter.</p>
          </header>
          <svg viewBox="0 0 318 185" preserveAspectRatio="xMidYMax slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex: 0 }} fill="none">
            <circle cx="216" cy="25" r="70" fill="rgba(255,255,255,0.05)"/>
            <rect x="5" y="55" width="54" height="130" rx="4" fill="rgba(255,255,255,0.09)"/>
            <rect x="65" y="30" width="65" height="155" rx="4" fill="rgba(255,255,255,0.12)"/>
            <rect x="135" y="45" width="43" height="140" rx="3" fill="rgba(255,255,255,0.08)"/>
            <rect x="184" y="15" width="59" height="170" rx="4" fill="rgba(255,255,255,0.12)"/>
            <rect x="248" y="40" width="54" height="145" rx="3" fill="rgba(255,255,255,0.09)"/>
            {[[14,60],[14,72],[14,84],[32,60],[32,72],[32,84],[73,35],[73,47],[73,59],[73,71],[95,35],[95,47],[95,59],[143,50],[143,62],[143,74],[159,50],[159,62],[192,20],[192,32],[192,44],[192,56],[216,20],[216,32],[216,44],[216,56],[256,45],[256,57],[256,69],[278,45],[278,57],[278,69]].map(([x,y],i) => (
              <rect key={i} x={x} y={y} width="8" height="7" rx="1" fill="#FDE68A" opacity="0.8"/>
            ))}
            <rect x="0" y="160" width="318" height="25" fill="rgba(0,0,0,0.28)"/>
            {[16,76,135,194,254].map((x,i) => <rect key={i} x={x} y="170" width="32" height="2.5" rx="1" fill="rgba(255,255,255,0.22)"/>)}
            <g>
              <animateTransform attributeName="transform" attributeType="XML" type="translate" values="-135 0;459 0" dur="4.6s" repeatCount="indefinite" calcMode="linear"/>
              <rect x="0" y="147" width="108" height="12" rx="3.5" fill="#C4B5FD"/>
              <path d="M10.8 147 C16.2 138 29.7 135 48.6 135 L75.6 135 C94.5 135 102.6 140 108 147Z" fill="#A78BFA"/>
              <rect x="16.2" y="137" width="35.1" height="8" rx="1.5" fill="rgba(200,220,255,0.35)"/>
              <rect x="56.7" y="136" width="40.5" height="9" rx="1.5" fill="rgba(200,220,255,0.38)"/>
              <circle cx="24.3" cy="159" r="4.5" fill="#4A3880"/><circle cx="24.3" cy="159" r="2.2" fill="#7C6FCD"/>
              <circle cx="81" cy="159" r="4.5" fill="#4A3880"/><circle cx="81" cy="159" r="2.2" fill="#7C6FCD"/>
              <rect x="99.9" y="150" width="4" height="3" rx="0.8" fill="#FEF3C7"/>
            </g>
          </svg>
        </div>

        <div className={styles.body}>
          {/* Command-palette trigger — sits below the banner (not on top of
              it), never a plain text field. Tapping opens AddressSearchSheet. */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            onClick={() => setSheetOpen(true)}
            className={styles.trigger}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <span className={styles.triggerIcon} aria-hidden="true">📍</span>
            <span className={styles.triggerText}>
              {search.selected ? search.selected.label : 'Where are you going?'}
            </span>
            <span className={styles.triggerPin} aria-hidden="true">▾</span>
          </motion.button>

          <OfferRideCard onPress={() => onNavigate?.('rideshare')} />
        </div>
      </GlassSurface>

      <AnimatePresence>
        {sheetOpen && (
          <AddressSearchSheet
            search={search}
            onClose={() => setSheetOpen(false)}
            onSelect={async (loc) => {
              await search.selectLocation(loc);
              setSheetOpen(false);
              // Auto-compare: the moment a destination is chosen, jump
              // straight to the full-screen Ride Comparison result —
              // no separate "Compare Rides" tap needed. Uses `loc`
              // directly rather than search.selected to avoid a stale
              // read before the hook's state has flushed.
              onNavigate?.('ride-comparison', {
                destination: loc.label,
                latitude: loc.latitude,
                longitude: loc.longitude,
              });
            }}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
