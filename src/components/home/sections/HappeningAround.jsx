/**
 * HappeningAround.jsx
 * ---------------------------------------------------------------------
 * "What interesting things are happening near me right now?" — an
 * AI-ranked (editorial_priority → engagement_score → recency) mixture of
 * events, sports activities, workshops, community highlights, ride
 * shares, offers, and featured picks, sourced ONLY from the feed_items
 * aggregation layer (services/feedItems.js). This is NOT the Community
 * Feed and NOT Neighbourhood Pulse — those keep reading their own
 * tables untouched.
 *
 * States: loading (FeedSkeleton) → success (FeedCarousel of FeedCard) /
 * empty (FeedEmptyState) / error (FeedErrorState with retry). One failed
 * fetch here never throws past this component (see feedItems.js) and is
 * additionally guarded by HomeSectionErrorBoundary at the renderer level.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import FeedCarousel from '../shared/FeedCarousel';
import FeedCard from '../shared/FeedCard';
import FeedSkeleton from '../shared/FeedSkeleton';
import FeedEmptyState from '../shared/FeedEmptyState';
import FeedErrorState from '../shared/FeedErrorState';
import { fetchHappeningAround } from '../../../services/feedItems';
import { useMixedSavedState } from '../../../hooks/useMixedSavedState';
import { useAuth } from '../../../context/AuthContext';

// Where tapping a card of a given source_type should take the user.
// Kept local to this section — it's a navigation concern, not a data
// concern, so it doesn't belong in the feedItems service.
const ROUTE_FOR_TYPE = {
  event: 'events',
  activity: 'events',
  workshop: 'events',
  community_post: 'community',
  ride: 'rideshare',
  offer: 'shops',
  featured_pick: 'shops',
  external: 'community',
};

export default function HappeningAround({ onNavigate }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await fetchHappeningAround({});
      setItems(data);
      setStatus(data.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.error('[HappeningAround] failed to load feed_items:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { isSaved } = useMixedSavedState(userId, items);

  const handleOpen = (item) => {
    const route = ROUTE_FOR_TYPE[item.sourceType] || 'community';
    onNavigate?.(route);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 32, background: '#ffffff' }}
    >
      <SectionHeader
        title="Happening Around"
        subtitle="Discover what's happening nearby."
        onViewAll={status === 'success' ? () => onNavigate?.('community') : undefined}
      />

      {status === 'loading' && <FeedSkeleton count={3} />}

      {status === 'error' && <FeedErrorState onRetry={load} />}

      {status === 'empty' && <FeedEmptyState />}

      {status === 'success' && (
        <FeedCarousel>
          {items.map((item) => (
            <FeedCard
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
