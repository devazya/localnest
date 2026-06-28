/**
 * ChannelIcon.jsx
 * Returns the correct 3D clay icon for a channel slug.
 * Used by Community.jsx to render channel icons consistently.
 */
import {
  AnnouncementsIcon, RidesIcon, EventsIcon, RoommatesIcon,
  BuySellIcon, SportsIcon, SearchIcon, EmergencyIcon, JobsIcon, MessagesIcon,
} from './index.jsx';

/** Map slug → { Icon component, color } */
const CHANNEL_ICON_MAP = {
  announcements:    { Comp: AnnouncementsIcon, color: '#D97706' },
  general:          { Comp: MessagesIcon,      color: '#6B7280' },
  rides:            { Comp: RidesIcon,         color: '#0284C7' },
  events:           { Comp: EventsIcon,        color: '#7C3AED' },
  roommates:        { Comp: RoommatesIcon,     color: '#059669' },
  'buy-and-sell':   { Comp: BuySellIcon,       color: '#059669' },
  sports:           { Comp: SportsIcon,        color: '#0284C7' },
  'lost-and-found': { Comp: SearchIcon,        color: '#DC2626' },
  help:             { Comp: EmergencyIcon,     color: '#DC2626' },
  jobs:             { Comp: JobsIcon,          color: '#6D4AFF' },
};

const FALLBACK = { Comp: MessagesIcon, color: '#6B7280' };

export function getChannelDisplay(slug) {
  return CHANNEL_ICON_MAP[slug] || FALLBACK;
}

/** Renders the icon for a channel slug at a given size */
export function ChannelIcon({ slug, size = 18 }) {
  const { Comp } = getChannelDisplay(slug);
  return <Comp size={size} />;
}
