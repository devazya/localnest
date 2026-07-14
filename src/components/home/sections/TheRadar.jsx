/**
 * TheRadar.jsx
 * ---------------------------------------------------------------------
 * Formerly "Local Finds" — renamed to read like a curated discovery
 * feed rather than a 2018-era coupon widget. "Valuable things happening
 * around you": affiliate offers, merchant promotions, sponsored
 * listings, cashback, referral/loyalty rewards, and festival/flash/
 * seasonal campaigns, sourced ONLY from the `campaigns` Promotions
 * Engine (services/campaigns.js). Premium framing per the brief: no
 * "Sponsored" language unless a row is actually flagged, no ad-feed
 * density — same carousel rhythm as every other Home section.
 *
 * The underlying data model (campaigns, campaign_providers, saveType
 * 'campaign', event module 'local_finds') deliberately keeps its
 * original naming — only the user-facing section name changed, so
 * nothing server-side needed to move.
 *
 * States: loading (FeedSkeleton) -> success (FeedCarousel of
 * LocalFindCard) / empty (FeedEmptyState) / error (FeedErrorState with
 * retry) — identical state machine to HappeningAround, reusing the same
 * shared components so The Radar never introduces a second loading/
 * empty/error pattern.
 *
 * Analytics: viewed/clicked/saved/affiliate_opened events route through
 * the existing generic user_events layer (services/userEvents.js) —
 * module: 'local_finds', object_type: 'campaign' — rather than a new
 * dedicated table, per the "don't create duplicate concepts" guardrail.
 * This is the prepared hook the brief asks for; no ranking logic reads
 * these events yet.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import FeedCarousel from '../shared/FeedCarousel';
import LocalFindCard from '../shared/LocalFindCard';
import FeedSkeleton from '../shared/FeedSkeleton';
import FeedEmptyState from '../shared/FeedEmptyState';
import FeedErrorState from '../shared/FeedErrorState';
import { fetchLocalFinds } from '../../../services/campaigns';
import { logEvent } from '../../../services/userEvents';
import { useSavedState } from '../../../hooks/useSavedState';
import { useAuth } from '../../../context/AuthContext';

export default function TheRadar({ onNavigate }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [items, setItems] = useState([]);
  const loggedViewIds = useRef(new Set());

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await fetchLocalFinds({});
      setItems(data);
      setStatus(data.length > 0 ? 'success' : 'empty');
    } catch (err) {
      console.error('[LocalFinds] failed to load campaigns:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Fire one "viewed" event per campaign the first time the section
  // renders it successfully — not on every re-render.
  useEffect(() => {
    if (status !== 'success') return;
    for (const item of items) {
      if (loggedViewIds.current.has(item.id)) continue;
      loggedViewIds.current.add(item.id);
      logEvent({
        eventName: 'campaign_viewed',
        screen: 'home',
        module: 'local_finds',
        objectType: 'campaign',
        objectId: item.id,
        metadata: { campaign_type: item.campaignType, provider: item.providerSlug },
      });
    }
  }, [status, items]);

  const { isSaved } = useSavedState(userId, 'campaign', items.map((i) => i.id));

  const handleOpen = (item) => {
    logEvent({
      eventName: 'campaign_clicked',
      screen: 'home',
      module: 'local_finds',
      objectType: 'campaign',
      objectId: item.id,
      metadata: { campaign_type: item.campaignType, provider: item.providerSlug },
    });

    if (item.affiliateUrl || item.deepLink) {
      logEvent({
        eventName: 'campaign_affiliate_opened',
        screen: 'home',
        module: 'local_finds',
        objectType: 'campaign',
        objectId: item.id,
        metadata: { provider: item.providerSlug },
      });
      window.open(item.deepLink || item.affiliateUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    onNavigate?.('the-radar', { campaignId: item.id });
  };

  const handleSaveChange = (item, saved) => {
    logEvent({
      eventName: saved ? 'campaign_saved' : 'campaign_unsaved',
      screen: 'home',
      module: 'local_finds',
      objectType: 'campaign',
      objectId: item.id,
    });
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
        title="The Radar"
        subtitle="What's worth knowing nearby."
        onViewAll={status === 'success' ? () => onNavigate?.('the-radar') : undefined}
      />

      {status === 'loading' && <FeedSkeleton count={3} />}

      {status === 'error' && <FeedErrorState onRetry={load} />}

      {status === 'empty' && (
        <FeedEmptyState
          headline="Nothing on the radar yet."
          subtitle="Check back soon for offers near you."
        />
      )}

      {status === 'success' && (
        <FeedCarousel>
          {items.map((item) => (
            <LocalFindCard
              key={item.id}
              item={item}
              userId={userId}
              isSaved={isSaved(item.id)}
              onOpen={handleOpen}
              onSaveChange={handleSaveChange}
            />
          ))}
        </FeedCarousel>
      )}
    </motion.section>
  );
}
