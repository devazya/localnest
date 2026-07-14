/**
 * LetsPlaySection.jsx (home/sections)
 * ---------------------------------------------------------------------
 * "Everything active happening around you" — nearby bookable sports
 * venues. Reads ONLY the normalized venues chain (services/venues.js:
 * businesses[business_type=venue] -> venue_sports -> venue_slots, plus
 * sports for category chips). Never touches feed_items, community_posts
 * or any other section's tables.
 *
 * States: loading (skeleton) -> success (chips + carousel of VenueCard)
 * / empty (no venues for the current filter) / error (retry). A failed
 * fetch here never throws past this component, and is additionally
 * guarded by HomeSectionErrorBoundary at the renderer level.
 *
 * Booking is intentionally NOT implemented — Book Now / tapping a card
 * only calls onNavigate('venue-booking', {...}); see the recommendations
 * note in the accompanying summary for what that future page needs.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import FeedCarousel from '../shared/FeedCarousel';
import FeedSkeleton from '../shared/FeedSkeleton';
import FeedEmptyState from '../shared/FeedEmptyState';
import FeedErrorState from '../shared/FeedErrorState';
import CategoryChipRow from '../shared/CategoryChipRow';
import VenueCard from '../shared/VenueCard';
import { fetchLetsPlayVenues, fetchSportsCategories } from '../../../services/venues';
import { useMixedSavedState } from '../../../hooks/useMixedSavedState';
import { useAuth } from '../../../context/AuthContext';

export default function LetsPlaySection({ onNavigate }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [categories, setCategories] = useState([]);
  const [selectedSport, setSelectedSport] = useState('all');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [venues, setVenues] = useState([]);

  // Categories load once — the chip row itself never hardcodes options.
  useEffect(() => {
    fetchSportsCategories()
      .then(setCategories)
      .catch((err) => console.error('[LetsPlay] failed to load sports categories:', err));
  }, []);

  const load = useCallback(async (sportSlug) => {
    setStatus('loading');
    try {
      const data = await fetchLetsPlayVenues({ sportSlug });
      setVenues(data);
      setStatus(data.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.error('[LetsPlay] failed to load venues:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(selectedSport); }, [load, selectedSport]);

  const { isSaved } = useMixedSavedState(userId, venues);

  const handleSelectSport = (id) => setSelectedSport(id);

  // Book Now / card tap — architecture-only for now (see module docstring).
  const handleOpen = useCallback((item) => {
    onNavigate?.('venue-booking', { venueSportId: item.id, venueId: item.venueId });
  }, [onNavigate]);

  const emptyCopy = useMemo(() => (
    selectedSport === 'all'
      ? { headline: 'No sports nearby yet.', subtitle: 'Check back later or explore another activity.' }
      : { headline: 'Nothing here for this sport yet.', subtitle: 'Try another category or check back later.' }
  ), [selectedSport]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 32, background: '#ffffff' }}
    >
      <SectionHeader
        title="Let's Play"
        subtitle="Discover sports and activities happening nearby."
        onViewAll={() => onNavigate?.('venues')}
      />

      <CategoryChipRow
        categories={categories.map((c) => ({ id: c.slug, label: c.label, icon: c.icon }))}
        selectedId={selectedSport}
        onSelect={handleSelectSport}
      />

      {status === 'loading' && <FeedSkeleton count={3} cardWidth={236} />}

      {status === 'error' && <FeedErrorState onRetry={() => load(selectedSport)} />}

      {status === 'empty' && <FeedEmptyState headline={emptyCopy.headline} subtitle={emptyCopy.subtitle} />}

      {status === 'success' && (
        <FeedCarousel cardWidth={236}>
          {venues.map((item) => (
            <VenueCard
              key={item.id}
              item={item}
              userId={userId}
              isSaved={item.saveType ? isSaved(item.saveType, item.saveId) : false}
              onOpen={handleOpen}
            />
          ))}
        </FeedCarousel>
      )}
    </motion.section>
  );
}
