/**
 * constants.js — Community module
 * Hardcoded arrays/config extracted verbatim from the original Community.jsx.
 * No values were changed during the refactor.
 */

// ─── PNG Icon Imports (only existing assets — no new icons generated) ────────
import GeneralDiscussionIcon      from '../../assets/icons/General Discussion.png';
import AnnouncementDiscussionIcon from '../../assets/icons/Announcement Discussion.png';
import RideDiscussionIcon         from '../../assets/icons/Ride Discussion.png';
import EventsDiscussionIcon       from '../../assets/icons/Events.png';
import SportsDiscussionIcon       from '../../assets/icons/Sports Discussion.png';
import JobsDiscussionIcon         from '../../assets/icons/Job DIscussion.png';
import BuySellDiscussionIcon      from '../../assets/icons/Buy & Sell Discussion.png';
import BuySellIcon                from '../../assets/icons/Buy & Sell.png';
import FitnessIcon                from '../../assets/icons/Fitness.png';

// Lost & Found and Help do not have dedicated Figma icons yet — closest available reused
const LostFoundDiscussionIcon = BuySellDiscussionIcon;
const HelpDiscussionIcon      = FitnessIcon;

// ─── Channels ───────────────────────────────────────────────────────────────

export const CHANNELS = [
  {
    slug: 'general', name: 'General', icon: GeneralDiscussionIcon,
    desc: 'Live chat with everyone', color: '#6D4AFF',
    bg: 'linear-gradient(135deg, #EDE9FF 0%, #F5F3FF 100%)',
    glowColor: 'rgba(109,74,255,0.18)', type: 'chat',
  },
  {
    slug: 'neighbourhood-updates', name: 'Neighbourhood Updates', icon: AnnouncementDiscussionIcon,
    desc: 'Important updates from your locality', color: '#D97706',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
    glowColor: 'rgba(217,119,6,0.15)', type: 'neighbourhood-updates',
  },
  {
    slug: 'ride-sharing', name: 'Ride Sharing', icon: RideDiscussionIcon,
    desc: 'Ride offers & requests', color: '#16A34A',
    bg: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
    glowColor: 'rgba(22,163,74,0.15)', type: 'discussion',
  },
  {
    slug: 'events', name: 'Events', icon: EventsDiscussionIcon,
    desc: 'Local events & meetups', color: '#DB2777',
    bg: 'linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%)',
    glowColor: 'rgba(219,39,119,0.15)', type: 'discussion',
  },
  {
    slug: 'sports', name: 'Sports', icon: SportsDiscussionIcon,
    desc: 'Sports discussions', color: '#0284C7',
    bg: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
    glowColor: 'rgba(2,132,199,0.15)', type: 'discussion',
  },
  {
    slug: 'buy-sell', name: 'Buy & Sell', icon: BuySellDiscussionIcon,
    desc: 'Marketplace discussions', color: '#EA580C',
    bg: 'linear-gradient(135deg, #FFEDD5 0%, #FFF7ED 100%)',
    glowColor: 'rgba(234,88,12,0.15)', type: 'discussion',
  },
  {
    slug: 'lost-and-found', name: 'Lost & Found', icon: LostFoundDiscussionIcon,
    desc: 'Lost items & found items', color: '#DC2626',
    bg: 'linear-gradient(135deg, #FEE2E2 0%, #FFF5F5 100%)',
    glowColor: 'rgba(220,38,38,0.15)', type: 'discussion',
  },
  {
    slug: 'help', name: 'Help', icon: HelpDiscussionIcon,
    desc: 'Ask questions, get help', color: '#7C3AED',
    bg: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
    glowColor: 'rgba(124,58,237,0.15)', type: 'discussion',
  },
  {
    slug: 'jobs', name: 'Jobs', icon: JobsDiscussionIcon,
    desc: 'Hiring & opportunities', color: '#B45309',
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
    glowColor: 'rgba(180,83,9,0.15)', type: 'discussion',
  },
];

export const SORT_OPTIONS = [
  { key: 'newest',         label: 'Newest' },
  { key: 'trending',       label: 'Trending' },
  { key: 'most_liked',     label: 'Most Liked' },
  { key: 'most_commented', label: 'Most Comments' },
];

export const REPORT_REASONS = [
  { key: 'spam',        label: 'Spam' },
  { key: 'scam',        label: 'Scam / Fake' },
  { key: 'misleading',  label: 'Misleading' },
  { key: 'irrelevant',  label: 'Irrelevant' },
  { key: 'duplicate',   label: 'Duplicate' },
  { key: 'offensive',   label: 'Offensive / Harassment' },
  { key: 'other',       label: 'Wrong Category' },
];

export const PROFILE_REPORT_REASONS = [
  { key: 'fake',           label: 'Fake Profile' },
  { key: 'impersonation',  label: 'Impersonation' },
  { key: 'harassment',     label: 'Harassment / Abuse' },
  { key: 'spam',           label: 'Spam' },
  { key: 'inappropriate',  label: 'Inappropriate Content' },
  { key: 'other',          label: 'Other' },
];

export const POST_TYPES = [
  { id: 'post',          title: 'Post',          desc: 'Share something with the community' },
  { id: 'ride_offer',     title: 'Ride Offer',    desc: 'Offer seats on a ride',   rideChannelsOnly: true },
  { id: 'ride_request',   title: 'Ride Request',  desc: 'Look for a ride',         rideChannelsOnly: true },
  { id: 'event',          title: 'Event',         desc: 'Create an event' },
  { id: 'buysell',        title: 'Buy & Sell',    desc: 'Sell or list an item' },
  { id: 'poll',           title: 'Poll',          desc: 'Ask a question with options' },
  { id: 'announcement',   title: 'Announcement',  desc: 'Official notice (admins)', adminOnly: true },
];

// ─── Neighbourhood Updates (Segment 4) ──────────────────────────────────────
export const NU_CATEGORIES = [
  { id: 'Emergency',           label: 'Emergency',      emoji: '🚨', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'Society',             label: 'Society',        emoji: '🏠', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'Maintenance',         label: 'Maintenance',    emoji: '🔧', color: '#D97706', bg: '#FEF3C7' },
  { id: 'Business',            label: 'Business',       emoji: '🍕', color: '#EA580C', bg: '#FFEDD5' },
  { id: 'Sports',              label: 'Sports',         emoji: '🏸', color: '#0284C7', bg: '#E0F2FE' },
  { id: 'Events',              label: 'Events',         emoji: '🎉', color: '#DB2777', bg: '#FCE7F3' },
  { id: 'Housing',             label: 'Housing',        emoji: '🏡', color: '#16A34A', bg: '#DCFCE7' },
  { id: 'Jobs',                label: 'Jobs',           emoji: '💼', color: '#B45309', bg: '#FEF3C7' },
  { id: 'Lost & Found',        label: 'Lost & Found',   emoji: '🐾', color: '#6D4AFF', bg: '#EDE9FF' },
  { id: 'Community',           label: 'Community',      emoji: '❤️', color: '#E11D48', bg: '#FFF1F2' },
  { id: 'General Information', label: 'General Info',   emoji: '📢', color: '#0891B2', bg: '#ECFEFF' },
];

export const NU_WHAT_CAN_I_POST_EXAMPLES = [
  { emoji: '🏠', role: 'PG Owner',           example: '2 rooms available from next month.' },
  { emoji: '🛠', role: 'Society Management',  example: 'Water supply will be unavailable tomorrow from 10 AM–2 PM.' },
  { emoji: '🏸', role: 'Sports Club',         example: 'Badminton tournament this Sunday. Registrations are open.' },
  { emoji: '🍕', role: 'Local Business',      example: '20% discount on all pizzas this weekend.' },
  { emoji: '🚨', role: 'Resident Alert',      example: 'Phone stolen near Gate 2. Please stay cautious.' },
  { emoji: '🔧', role: 'Maintenance',         example: 'Lift maintenance scheduled from 2 PM–5 PM.' },
  { emoji: '🎉', role: 'Community Event',     example: 'Weekend flea market this Saturday.' },
  { emoji: '❤️', role: 'Emergency',           example: 'Urgently need O+ blood donor.' },
  { emoji: '🐾', role: 'Lost & Found',        example: 'Found a Labrador near Block C.' },
  { emoji: '📢', role: 'Local Information',   example: 'New grocery store opening this Friday.' },
];

export const NU_GUIDE_SEEN_KEY = 'localnest:nu_guide_seen';

// ─── Discussion Ecosystem (Segment 3) ───────────────────────────────────────
// Community channels that support Discussions. neighbourhood-updates is excluded —
// it has its own dedicated feed experience (Segment 4).
export const DISCUSSION_CHANNEL_SLUGS = [
  'general', 'sports', 'ride-sharing', 'events', 'buy-sell', 'jobs', 'help', 'lost-and-found',
];

// Categories change depending on the selected Community channel when
// creating a discussion. 'general' intentionally stays broad since General
// is the discovery hub, not a topic-specific channel.
export const DISCUSSION_CATEGORIES = {
  general:          ['General Chat', 'Meetup', 'Question', 'Recommendation', 'Other'],
  sports:           ['Cricket', 'Football', 'Badminton', 'Cycling', 'Gym', 'Other'],
  'ride-sharing':   ['Office Commute', 'Airport', 'Weekend Trip', 'Carpool', 'Other'],
  events:           ['Meetup', 'Party', 'Trek', 'Movie', 'Sports Event', 'Other'],
  'buy-sell':       ['Buy', 'Sell', 'Exchange', 'Deals', 'Other'],
  jobs:             ['Hiring', 'Looking for Work', 'Freelance', 'Internship', 'Other'],
  help:             ['Question', 'Advice', 'Recommendation', 'Emergency', 'Other'],
  'lost-and-found': ['Lost Item', 'Found Item', 'Other'],
};
export const DEFAULT_DISCUSSION_CATEGORIES = ['General', 'Other'];

// Decorative-only emoji fallback for the Discussion Room header (the
// discussions table has no icon column — DiscussionCard uses the channel's
// real PNG icon instead; the room header stays a light emoji touch).
export const CHANNEL_EMOJI = {
  general: '💬', sports: '🏸', 'ride-sharing': '🚗', events: '🎉',
  'buy-sell': '🛍️', jobs: '💼', help: '🆘', 'lost-and-found': '🔎', 'neighbourhood-updates': '🏡',
};

export const DISCUSSION_SORT_OPTIONS = [
  { key: 'recent_activity', label: 'Recently Active' },
  { key: 'newest',          label: 'Newest' },
  { key: 'most_members',    label: 'Most Members' },
  { key: 'trending',        label: 'Trending' },
];

export const DISCUSSION_STATUS = { ACTIVE: 'active', ARCHIVED: 'archived' };
export const DISCUSSION_ARCHIVE_HOURS = 24;

// Empty-state copy per channel — never show a generic "No Posts".
export const DISCUSSION_EMPTY_COPY = {
  general:          { title: 'No discussions yet',             subtitle: 'Start the first one.' },
  sports:           { title: 'No Sports discussions yet',       subtitle: 'Start the first one.' },
  'ride-sharing':   { title: 'No Ride discussions yet',         subtitle: 'Create the first discussion.' },
  events:           { title: 'No Events discussions yet',       subtitle: 'Create the first discussion.' },
  'buy-sell':       { title: 'No Marketplace discussions yet',  subtitle: 'Create the first discussion.' },
  jobs:             { title: 'No Jobs discussions yet',         subtitle: 'Create the first discussion.' },
  help:             { title: 'No Help discussions yet',         subtitle: 'Ask the first question.' },
  'lost-and-found': { title: 'No Lost & Found discussions yet', subtitle: 'Create the first discussion.' },
};

export const PAGE_SIZE = 10;
export const AUTO_HIDE_DOWNVOTE_RATIO = 0.75;
export const AUTO_HIDE_MIN_VOTES = 20;
export const VIEW_ANYWAY_KEY_PREFIX = 'viewAnyway:';

export const AVATAR_COLORS = ['#6D4AFF','#D97706','#DB2777','#16A34A','#0284C7','#7C3AED','#DC2626','#EA580C'];

// ─── Discussion Room Atmosphere ─────────────────────────────────────────────
// Ambient theming per channel/category — background wash + accent only.
// Layout never changes, opacity stays under 5%, CSS/SVG only (no images).
export const ROOM_ATMOSPHERE = {
  general:          { accent: '#6D4AFF', bg: 'radial-gradient(circle at 20% 0%, rgba(109,74,255,0.05), transparent 60%)' },
  sports:           { accent: '#EA6A0E', bg: 'repeating-linear-gradient(115deg, rgba(234,106,14,0.045) 0 2px, transparent 2px 34px)' },
  'ride-sharing':   { accent: '#16A34A', bg: 'radial-gradient(circle at 85% 10%, rgba(22,163,74,0.045), transparent 55%)' },
  events:           { accent: '#7C3AED', bg: 'radial-gradient(ellipse at 50% -10%, rgba(124,58,237,0.05), transparent 60%)' },
  'buy-sell':       { accent: '#EA580C', bg: 'radial-gradient(circle at 10% 100%, rgba(234,88,12,0.045), transparent 55%)' },
  jobs:             { accent: '#B45309', bg: 'radial-gradient(circle at 90% 0%, rgba(180,83,9,0.04), transparent 55%)' },
  help:             { accent: '#7C3AED', bg: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.045), transparent 55%)' },
  'lost-and-found': { accent: '#DC2626', bg: 'radial-gradient(circle at 15% 15%, rgba(220,38,38,0.04), transparent 55%)' },
  'neighbourhood-updates': { accent: '#D97706', bg: 'radial-gradient(circle at 80% 0%, rgba(217,119,6,0.045), transparent 55%)' },
};

export function getRoomAtmosphere(slug) {
  return ROOM_ATMOSPHERE[slug] || ROOM_ATMOSPHERE.general;
}

// ─── Inline keyframe styles ───────────────────────────────────────────────────

export const KEYFRAMES = `
@keyframes badgePulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { transform: scale(1.08); box-shadow: 0 0 0 4px rgba(239,68,68,0); } }
@keyframes livePulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { opacity: 0.85; box-shadow: 0 0 0 5px rgba(34,197,94,0); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.skeleton { background: linear-gradient(90deg, #F0EEFF 25%, #E8E4FF 50%, #F0EEFF 75%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
@keyframes bubbleIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes bubbleOut { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
@keyframes reactionPop { 0% { transform: scale(0.6); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes typingPulse { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-4px); opacity: 1; } }
`;
