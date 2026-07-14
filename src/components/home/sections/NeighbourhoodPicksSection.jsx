/**
 * NeighbourhoodPicksSection.jsx (home/sections)
 * ---------------------------------------------------------------------
 * Curated business discovery — editorial, never advertising. Reads
 * ONLY curated_picks (ordering + editorial metadata) joined to
 * businesses + business_categories (services/curatedPicks.js). Never
 * touches feed_items, venue_sports, community_posts, or any other
 * section's tables.
 *
 * Ranking is entirely curated_picks.priority, consumed as-is — this
 * component has no rating/distance/popularity sort of its own, by
 * design, so swapping in AI-recommendation/popularity/distance ranking
 * later is a backend-only change.
 *
 * States: loading (skeleton) -> success (chips + carousel) / empty /
 * error (retry) — same shape as Let's Play / Happening Around, and
 * still guarded by HomeSectionErrorBoundary at the renderer level.
 *
 * "View Place" only navigates — see the recommendations note in the
 * accompanying summary for what the future Business Details page needs.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import FeedCarousel from '../shared/FeedCarousel';
import FeedSkeleton from '../shared/FeedSkeleton';
import FeedEmptyState from '../shared/FeedEmptyState';
import FeedErrorState from '../shared/FeedErrorState';
import CategoryChipRow from '../shared/CategoryChipRow';
import NeighbourhoodPickCard from '../shared/NeighbourhoodPickCard';
import { fetchNeighbourhoodPicks, fetchBusinessCategories } from '../../../services/curatedPicks';
import { useMixedSavedState } from '../../../hooks/useMixedSavedState';
import { useAuth } from '../../../context/AuthContext';

export default function NeighbourhoodPicksSection({ onNavigate }) {
  const { user, profile } = useAuth();
  const userId = user?.id || null;
  const locality = profile?.locality || null;

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [picks, setPicks] = useState([]);

  // Chips load once — always Supabase-sourced, never hardcoded.
  useEffect(() => {
    fetchBusinessCategories()
      .then(setCategories)
      .catch((err) => console.error('[NeighbourhoodPicks] failed to load categories:', err));
  }, []);

  const load = useCallback(async (categorySlug) => {
    setStatus('loading');
    try {
      const data = await fetchNeighbourhoodPicks({ categorySlug, locality });
      setPicks(data);
      setStatus(data.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.error('[NeighbourhoodPicks] failed to load picks:', err);
      setStatus('error');
    }
  }, [locality]);

  useEffect(() => { load(selectedCategory); }, [load, selectedCategory]);

  const { isSaved } = useMixedSavedState(userId, picks);

  // Card tap / View Place — architecture-only for now (see module docstring).
  const handleOpen = useCallback((item) => {
    onNavigate?.('business-details', { businessId: item.businessId });
  }, [onNavigate]);

  const emptyCopy = useMemo(() => ({
    headline: 'No recommendations yet.',
    subtitle: "We'll discover great places around you soon.",
  }), []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 32, background: '#ffffff' }}
    >
      <SectionHeader
        title="Neighbourhood Picks"
        subtitle="Places worth checking out."
        onViewAll={() => onNavigate?.('shops')}
      />

      <CategoryChipRow
        categories={categories.map((c) => ({ id: c.slug, label: c.label, icon: c.icon }))}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {status === 'loading' && <FeedSkeleton count={3} cardWidth={236} />}

      {status === 'error' && <FeedErrorState onRetry={() => load(selectedCategory)} />}

      {status === 'empty' && <FeedEmptyState headline={emptyCopy.headline} subtitle={emptyCopy.subtitle} />}

      {status === 'success' && (
        <FeedCarousel cardWidth={236}>
          {picks.map((item) => (
            <NeighbourhoodPickCard
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
