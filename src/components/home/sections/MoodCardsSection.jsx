/**
 * MoodCardsSection.jsx (home/sections)
 * ---------------------------------------------------------------------
 * "Mood Cards" — an emotion/intent selector sitting between Friend AI
 * and Highlights on Home. Reads ONLY the `moods` table (via
 * useMoodSelection/moodsService) — never businesses/curated_picks/
 * offers/feed_items, matching every other Home section's guardrail.
 *
 * This section owns layout/loading/empty/error only. Fetching,
 * selection state, and persistence all live in useMoodSelection.
 */
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import MoodGrid from '../shared/MoodGrid';
import FeedErrorState from '../shared/FeedErrorState';
import FeedEmptyState from '../shared/FeedEmptyState';
import { useMoodSelection } from '../../../hooks/useMoodSelection';

function MoodGridSkeleton() {
  return (
    <>
      <style>{`
        @keyframes moodSkeletonShimmer {
          0%   { background-position: -160% 0; }
          100% { background-position: 160% 0; }
        }
        .mood-skeleton-shimmer {
          background: linear-gradient(90deg, rgba(109,74,255,0.06) 25%, rgba(109,74,255,0.13) 37%, rgba(109,74,255,0.06) 63%);
          background-size: 400% 100%;
          animation: moodSkeletonShimmer 1.6s ease-in-out infinite;
        }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 20px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mood-skeleton-shimmer" style={{ borderRadius: 22, minHeight: 108 }} />
        ))}
      </div>
    </>
  );
}

export default function MoodCardsSection() {
  const { status, moods, selectedSlug, selectMood, reload } = useMoodSelection();

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 32 }}
    >
      <SectionHeader title="How are you feeling?" subtitle="Pick a mood — Friend will tune in." />

      {status === 'loading' && <MoodGridSkeleton />}

      {status === 'error' && <FeedErrorState onRetry={reload} />}

      {status === 'empty' && <FeedEmptyState headline="Your moods will appear here." subtitle="Check back soon." />}

      {status === 'success' && (
        <MoodGrid moods={moods} selectedSlug={selectedSlug} onSelect={selectMood} />
      )}
    </motion.section>
  );
}
