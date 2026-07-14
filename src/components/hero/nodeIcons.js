/**
 * nodeIcons.js
 * ---------------------------------------------------------------------
 * Icon + color config for LocalityNetwork's pills, and the static
 * fallback layout used only when live categories haven't loaded yet
 * (or the fetch comes back empty) — so the graph never renders blank.
 * Positions (cx/cy/r) below are copied verbatim from the original
 * hardcoded NODES so the layout/geometry never changes, per spec.
 */
import {
  Sparkles, Dumbbell, Calendar, Wrench, MessageCircle,
  Car, Tag, Star, Bell, Home,
} from 'lucide-react';

/** category -> { Icon, color } — used for both live and fallback pills */
export const CATEGORY_ICON = {
  event:          { Icon: Calendar,      color: '#EF4444' },
  activity:       { Icon: Dumbbell,      color: '#F59E0B' },
  workshop:       { Icon: Wrench,        color: '#10B981' },
  community_post: { Icon: MessageCircle, color: '#3B82F6' },
  ride:           { Icon: Car,           color: '#8B5CF6' },
  offer:          { Icon: Tag,           color: '#EC4899' },
  featured_pick:  { Icon: Star,          color: '#F59E0B' },
  external:       { Icon: Bell,          color: '#64748B' },
  pg:             { Icon: Home,          color: '#6D4AFF' },
};

export const CENTER_ICON = { Icon: Sparkles, color: '#8F7BFF' };

/** Fixed outer-slot geometry — unchanged from the original component. */
export const OUTER_SLOTS = [
  { cx: 55, cy: 12, r: 24 },
  { cx: 85, cy: 35, r: 22 },
  { cx: 80, cy: 72, r: 21 },
  { cx: 48, cy: 86, r: 22 },
  { cx: 18, cy: 70, r: 23 },
  { cx: 14, cy: 30, r: 22 },
];

/**
 * Used only until live data arrives / if the fetch returns nothing.
 * Structural taxonomy only (which categories/slots/routes exist) — no
 * fake title/subtitle copy. The context panel shows an honest
 * "nothing live yet" suggestion for any pill with no title.
 */
export const FALLBACK_PILLS = [
  { id: 'pg',             category: 'pg',             label: 'PG',        route: 'pgs',       ctaLabel: 'Browse PGs',   title: null, subtitle: null },
  { id: 'activity',       category: 'activity',       label: 'Sports',    route: 'events',    ctaLabel: 'Join Game',    title: null, subtitle: null },
  { id: 'offer',          category: 'offer',          label: 'Deals',     route: 'shops',     ctaLabel: 'View Deals',   title: null, subtitle: null },
  { id: 'featured_pick',  category: 'featured_pick',  label: 'Featured',  route: 'shops',     ctaLabel: 'Explore',      title: null, subtitle: null },
  { id: 'event',          category: 'event',          label: 'Events',    route: 'events',    ctaLabel: 'View Events',  title: null, subtitle: null },
  { id: 'ride',           category: 'ride',           label: 'Rides',     route: 'rideshare', ctaLabel: 'Offer a Ride', title: null, subtitle: null },
];
