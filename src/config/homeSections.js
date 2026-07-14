/**
 * HOME_SECTIONS — config-driven Home page section registry.
 * ---------------------------------------------------------------------
 * Home.jsx no longer hardcodes section order. Instead it renders
 * HomeSectionRenderer, which reads this array (merged with an optional
 * backend-supplied order — see `getHomeSectionOrder` below) and renders
 * enabled sections in order.
 *
 * ORDERING PHILOSOPHY
 * Each section has a stable `id` and a `defaultOrder` used only as a
 * fallback when no backend ordering is available. `defaultOrder` is NOT
 * meant to be the long-term source of truth — the id is. This is what
 * lets a future Supabase table (e.g. `home_layout(section_id, position)`)
 * or admin panel override sequencing without touching this file or
 * redeploying the app: callers pass an `orderOverride` map of
 * { [id]: position } and the renderer sorts by that first, falling back
 * to defaultOrder for any id not present in the override.
 *
 * Contexts like "Weekend", "Festival", "Morning", "Rain", "Sports season"
 * (see project brief) become nothing more than a different
 * { [id]: position } map produced somewhere else (cron job, edge
 * function, admin panel) — this file and the renderer never need to
 * change to support them.
 *
 * PERSONALIZATION (future)
 * `personalizationKey` is a placeholder hook: once user-level ranking
 * signals exist, a resolver can read this key to nudge a section's
 * effective order per-user. Not implemented yet — see
 * HomeSectionRenderer's `orderOverride` prop for where it plugs in.
 */

import { lazy } from 'react';
import HomeCoreSection from '../components/home/sections/HomeCoreSection';

const MoodCardsSection = lazy(() => import('../components/home/sections/MoodCardsSection'));
const HappeningAround = lazy(() => import('../components/home/sections/HappeningAround'));
const HighlightSection = lazy(() => import('../components/home/sections/HighlightSection'));
const SmartRideSection = lazy(() => import('../components/home/segment1/smartride/SmartRideSection'));
const LetsPlaySection = lazy(() => import('../components/home/sections/LetsPlaySection'));
const NeighbourhoodPicksSection = lazy(() => import('../components/home/sections/NeighbourhoodPicksSection'));
const TheRadar = lazy(() => import('../components/home/sections/TheRadar'));

/**
 * @typedef {Object} HomeSectionConfig
 * @property {string} id                 - Stable, unique identifier. Never reuse/rename across releases.
 * @property {string} title              - Human-readable label (for debugging/admin UI, not necessarily rendered).
 * @property {Function} component        - React component (already imported, or a React.lazy loader) — see `lazy`.
 * @property {boolean} enabled           - Feature flag. false = fully removed from Home, no fetch, no render.
 * @property {number} defaultOrder       - Fallback sort key when no backend/order override exists for this id.
 * @property {boolean} lazy              - Whether this section should be code-split + lazy-loaded + Suspense-wrapped.
 * @property {string|null} dataSource    - Logical name of the Supabase table/service this section reads from (metadata only).
 * @property {'eager'|'in-view'} loadingStrategy - eager = fetch immediately; in-view = fetch when scrolled near.
 * @property {string|null} featureFlag   - Optional named flag this section additionally depends on (future remote-config).
 * @property {string|null} personalizationKey - Optional key a future per-user ranking resolver can key off of.
 */

/** @type {HomeSectionConfig[]} */
export const HOME_SECTIONS = [
  {
    id: 'home-core',
    title: 'Hero / Friend / Modules / Filters / Feed / Ride Hub / Live Updates / Buzz',
    component: HomeCoreSection,
    enabled: true,
    defaultOrder: 10,
    lazy: false, // above-the-fold, must render immediately
    dataSource: 'community_posts,events,profiles',
    loadingStrategy: 'eager',
    featureFlag: null,
    personalizationKey: null,
  },

  {
    id: 'mood-cards',
    title: 'Mood Cards (emotion/intent selector — Hungry/Travel/Go Out/Play/Relax/Recharge)',
    component: MoodCardsSection,
    enabled: true,
    defaultOrder: 12,
    lazy: true,
    dataSource: 'moods',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'selected_mood',
  },

  {
    id: 'highlight',
    title: 'Highlight (Movies / Cafe / Sports / Deals / Nightlife spotlight)',
    component: HighlightSection,
    enabled: true,
    defaultOrder: 15,
    lazy: true,
    dataSource: 'home_highlights',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: null,
  },

  /* ─────────────────────────────────────────────────────────────────
     The sections below are registered but disabled (enabled: false)
     until they're implemented. Flipping `enabled: true` and pointing
     `component` at a real lazy-loaded component is the entire
     integration step — no changes to Home.jsx or the renderer needed.
     Order here reflects the intended default sequence from the product
     brief (Happening Around → Pulse → Smart Ride → Let's Play →
     Local Finds → Neighbourhood Picks → Activities → Workshops).
  ───────────────────────────────────────────────────────────────── */
  {
    id: 'happening-around',
    title: 'Happening Around',
    component: HappeningAround,
    enabled: true,
    defaultOrder: 20,
    lazy: true,
    dataSource: 'feed_items',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'happening_around_affinity',
  },
  {
    id: 'neighbourhood-pulse',
    title: 'Neighbourhood Pulse',
    component: null, // existing Pulse component — reposition only, do not redesign
    enabled: false,
    defaultOrder: 30,
    lazy: true,
    dataSource: 'pulse',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: null,
  },
  {
    id: 'smart-ride',
    title: 'Smart Ride',
    component: SmartRideSection,
    enabled: true,
    defaultOrder: 40,
    lazy: true,
    dataSource: 'ride_providers',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'travel_affinity',
  },
  {
    id: 'lets-play',
    title: "Let's Play",
    component: LetsPlaySection,
    enabled: true, // re-enabled on Home per the Let's Play brief — also still rendered on Explore's "Discover Nearby"; same lazy component, no duplicate fetch logic
    defaultOrder: 50,
    lazy: true,
    dataSource: 'venues',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'sports_affinity',
  },
  {
    id: 'the-radar',
    title: 'The Radar (Promotions Engine — affiliate offers, merchant promos, sponsored listings, cashback, festival/flash/seasonal campaigns; formerly "Local Finds")',
    component: TheRadar,
    enabled: true,
    defaultOrder: 60,
    lazy: true,
    dataSource: 'campaigns,campaign_providers',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'offers_affinity',
  },
  {
    id: 'neighbourhood-picks',
    title: 'Neighbourhood Picks',
    component: NeighbourhoodPicksSection,
    enabled: false, // moved to Explore page's new "Discover Nearby" section
    defaultOrder: 70,
    lazy: true,
    dataSource: 'curated_picks,businesses,business_categories',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'business_affinity',
  },
  {
    id: 'activities',
    title: 'Activities',
    component: null,
    enabled: false,
    defaultOrder: 80,
    lazy: true,
    dataSource: 'activities',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'activity_affinity',
  },
  {
    id: 'workshops',
    title: 'Workshops',
    component: null,
    enabled: false,
    defaultOrder: 90,
    lazy: true,
    dataSource: 'workshops',
    loadingStrategy: 'in-view',
    featureFlag: null,
    personalizationKey: 'learning_affinity',
  },
];

/**
 * getHomeSectionOrder — placeholder for a future backend/CMS-driven
 * ordering fetch (e.g. a `home_layout` Supabase table keyed by
 * section id → position, or a per-user personalization resolver).
 *
 * Returns a map of { [sectionId]: position }. Today it resolves to an
 * empty object, which means HomeSectionRenderer falls back entirely to
 * `defaultOrder`. Wire this up to Supabase later without touching the
 * renderer or Home.jsx.
 *
 * @returns {Promise<Record<string, number>>}
 */
export async function getHomeSectionOrder() {
  return {};
}
