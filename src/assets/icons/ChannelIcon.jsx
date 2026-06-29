/**
 * ChannelIcon.jsx
 * Returns the correct 3D clay icon for a channel slug.
 * Used by Community.jsx to render channel icons consistently.
 */
import {
  AnnouncementsIcon, SportsIcon, SearchIcon, EmergencyIcon,
  JobsIcon, MessagesIcon, PetsIcon, FoodIcon, EducationIcon,
  BuySellIcon, RidesIcon, EventsIcon, RoommatesIcon,
} from './index.jsx';

/** Map slug → { Icon component, color } */
const CHANNEL_ICON_MAP = {
  general:          { Comp: MessagesIcon,      color: '#6B7280' },
  announcements:    { Comp: AnnouncementsIcon, color: '#D97706' },
  sports:           { Comp: SportsIcon,        color: '#0284C7' },
  'ride-sharing':   { Comp: RidesIcon,         color: '#16A34A' },
  events:           { Comp: EventsIcon,        color: '#DB2777' },
  'buy-sell':       { Comp: BuySellIcon,       color: '#EA580C' },
  'lost-and-found': { Comp: SearchIcon,        color: '#DC2626' },
  help:             { Comp: EmergencyIcon,     color: '#DC2626' },
  'help-support':   { Comp: EmergencyIcon,     color: '#DC2626' },
  jobs:             { Comp: JobsIcon,          color: '#6D4AFF' },
  foodies:          { Comp: FoodIcon,          color: '#EA580C' },
  pets:             { Comp: PetsIcon,          color: '#B45309' },
  students:         { Comp: EducationIcon,     color: '#7C3AED' },
  roommates:        { Comp: RoommatesIcon,     color: '#7C3AED' },
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
