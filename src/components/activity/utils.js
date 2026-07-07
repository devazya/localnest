/**
 * utils.js — Activity Center & Settings (Segment 8)
 */
import { timeAgo } from '../community/utils';
import { COLORS } from './constants';

export { timeAgo };

// Maps an activities.type value to a tint color + emoji-free glyph key
// consumed by ActivityFeedItem's icon circle.
export const TYPE_META = {
  mention:  { tint: COLORS.primary,      glyph: 'avatar' },
  alert:    { tint: COLORS.warning,      glyph: 'megaphone' },
  reply:    { tint: COLORS.primaryLight, glyph: 'message' },
  like:     { tint: COLORS.error,        glyph: 'heart' },
  event:    { tint: COLORS.accentIndigo, glyph: 'calendar' },
  follow:   { tint: COLORS.success,      glyph: 'user-plus' },
  ride:     { tint: COLORS.primary,      glyph: 'car' },
  listing:  { tint: COLORS.warning,      glyph: 'bag' },
};

export function getTypeMeta(type) {
  return TYPE_META[type] || { tint: COLORS.textSecondary, glyph: 'info' };
}
