/**
 * constants.js — Activity Center & Settings (Segment 8)
 * Shares LocalNest's existing purple design language (see
 * components/community/constants.js) rather than introducing a new palette.
 */

export const COLORS = {
  primary: '#6D4AFF',
  primaryLight: '#9B6AFF',
  accentIndigo: '#5B35EE',
  softLavender: '#F3F0FF',
  surface: '#FFFFFF',
  background: '#F8F7FF',
  textPrimary: '#0D0820',
  textSecondary: '#9CA3AF',
  border: '#F4F3FF',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
};

export const PRIMARY_GRADIENT = 'linear-gradient(135deg, #6D4AFF, #9B6AFF)';
export const SOFT_GRADIENT = 'linear-gradient(135deg, #FAFAFF 0%, #F3F0FF 100%)';
export const SHADOW_SOFT = '0 2px 20px rgba(109,74,255,0.07)';
export const SHADOW_MEDIUM = '0 8px 30px rgba(109,74,255,0.16)';

export const TABS = ['All', 'Community', 'Social', 'Alerts'];

// Which activity `type`s each pill tab surfaces.
export const TAB_TYPE_MAP = {
  All: null,
  Community: ['alert', 'event', 'ride', 'listing'],
  Social: ['mention', 'reply', 'like', 'follow'],
  Alerts: ['alert'],
};

export const NOTIFICATION_GROUPS = [
  {
    title: 'Community',
    prefs: [
      { key: 'mentions', label: 'Mentions' },
      { key: 'replies', label: 'Replies' },
      { key: 'updates_announcements', label: 'Updates & Announcements' },
      { key: 'trending_discussions', label: 'Trending Discussions' },
    ],
  },
  {
    title: 'Marketplace',
    prefs: [
      { key: 'new_listings', label: 'New Listings' },
      { key: 'price_drops', label: 'Price Drops' },
      { key: 'offers_messages', label: 'Offers & Messages' },
    ],
  },
  {
    title: 'Ride Sharing',
    prefs: [
      { key: 'ride_updates', label: 'Ride Updates' },
      { key: 'ride_reminders', label: 'Ride Reminders' },
      { key: 'ride_cancellations', label: 'Ride Cancellations' },
    ],
  },
  {
    title: 'Events',
    prefs: [
      { key: 'event_reminders', label: 'Event Reminders' },
      { key: 'event_updates', label: 'Event Updates' },
      { key: 'event_cancellations', label: 'Event Cancellations' },
    ],
  },
  {
    title: 'System',
    prefs: [
      { key: 'neighbour_score_updates', label: 'Neighbour Score Updates' },
      { key: 'weekly_recap', label: 'Weekly Recap' },
      { key: 'tips_suggestions', label: 'Tips & Suggestions' },
    ],
  },
];

export const FILTER_TIME_RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'last7', label: 'Last 7 Days' },
];

export const FILTER_CATEGORIES = ['Community', 'Social', 'Marketplace', 'Ride Sharing', 'Events', 'Updates'];

export const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
