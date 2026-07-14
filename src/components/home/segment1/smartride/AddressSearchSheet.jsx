/**
 * AddressSearchSheet.jsx
 * ---------------------------------------------------------------------
 * The command-palette destination picker for Smart Ride. Expands from
 * the bottom (Apple/Google Maps pattern) instead of an inline text
 * field, so:
 *   - Home stays a single calm trigger, never a cluttered form
 *   - all destination-picking state (typing, suggestions, recents,
 *     Home/Work) lives in one dedicated surface
 *   - future additions (live autocomplete, AI suggestions, map preview)
 *     extend THIS sheet, never require touching the Home card again
 *
 * Sections, top to bottom: search input → Home/Work quick-set chips →
 * live Suggestions (while typing) → Recent Places (default state).
 * Keyboard: ↑/↓ moves through the flattened result list, Enter selects
 * the active one, Escape closes. Reduced-motion users get an instant
 * appearance instead of the spring slide-up.
 */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import RecentLocationCard from '../../shared/RecentLocationCard';
import styles from './AddressSearchSheet.module.css';

export default function AddressSearchSheet({ search, onClose, onSelect }) {
  const { query, setQuery, suggestions, searching, recents, homeLocation, workLocation, setHomeOrWork } = search;
  const inputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    // Autofocus the real input the instant the sheet mounts — this is
    // the only text field in the whole flow, so it should be ready to
    // type into immediately.
    const t = setTimeout(() => inputRef.current?.focus(), 260);
    return () => clearTimeout(t);
  }, []);

  const isTyping = query.trim().length > 0;
  const list = isTyping ? suggestions : recents.map((r) => ({
    id: `recent-${r.id}`,
    label: r.place_name,
    subLabel: 'Recent',
    latitude: r.latitude,
    longitude: r.longitude,
    source: 'recent',
  }));

  useEffect(() => { setActiveIndex(-1); }, [query, list.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (list.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onSelect(list[activeIndex]);
    }
  };

  const handleSetHomeWork = (labelType, current) => {
    if (current) {
      // Already set — jump straight to selecting it as the destination.
      onSelect({ label: current.place_name, latitude: current.latitude, longitude: current.longitude, source: 'saved' });
    } else if (query.trim()) {
      // No address yet: use whatever's typed as the new Home/Work.
      setHomeOrWork(labelType, { label: query, place_name: query, latitude: null, longitude: null });
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Search for a destination"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
      className={styles.sheet}
    >
        <div className={styles.closeBar}>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">✕</button>
        </div>

        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden="true">📍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Where are you going?"
            className={styles.input}
            aria-label="Destination"
            role="combobox"
            aria-expanded="true"
            aria-activedescendant={activeIndex >= 0 ? `smart-ride-opt-${activeIndex}` : undefined}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className={styles.clearBtn} aria-label="Clear search">✕</button>
          )}
        </div>

        <div className={styles.chipRow}>
          <button
            type="button"
            className={styles.quickChip}
            onClick={() => handleSetHomeWork('Home', homeLocation)}
          >
            🏠 {homeLocation ? homeLocation.place_name : 'Set Home'}
          </button>
          <button
            type="button"
            className={styles.quickChip}
            onClick={() => handleSetHomeWork('Work', workLocation)}
          >
            🏢 {workLocation ? workLocation.place_name : 'Set Work'}
          </button>
        </div>

        <div className={styles.sectionLabel}>
          {isTyping ? (searching ? 'Searching…' : 'Suggestions') : 'Recent Places'}
        </div>

        <div className={styles.list} role="listbox">
          {list.length === 0 && !searching && (
            <div className={styles.empty}>
              {isTyping ? 'No matches yet — keep typing.' : 'Your recent destinations will show up here.'}
            </div>
          )}
          {list.map((loc, i) => (
            <div
              key={loc.id}
              id={`smart-ride-opt-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              className={activeIndex === i ? styles.activeRow : undefined}
            >
              <RecentLocationCard
                icon={loc.source === 'saved' ? '⭐' : '🕘'}
                title={loc.label}
                subLabel={loc.subLabel}
                onPress={() => onSelect(loc)}
              />
            </div>
          ))}
        </div>
    </motion.div>
  );
}
