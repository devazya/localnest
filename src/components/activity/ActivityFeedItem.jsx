/**
 * ActivityFeedItem.jsx — Activity Center & Settings (Segment 8)
 * One row in the Activity feed. Slides in from the right on mount/insert
 * (per the spec's "list items slide in from right" animation note).
 */
import { motion } from 'framer-motion';
import Avatar from '../community/Avatar';
import Glyph from './Glyph';
import { COLORS, SHADOW_SOFT } from './constants';
import { timeAgo, getTypeMeta } from './utils';

export default function ActivityFeedItem({ activity, index = 0 }) {
  const meta = getTypeMeta(activity.type);
  const showAvatar = meta.glyph === 'avatar' && activity.actor?.avatar_url;

  return (
    <motion.div
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 6) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: COLORS.surface, borderRadius: 16, padding: '12px 14px', marginBottom: 8,
        boxShadow: SHADOW_SOFT, border: `1px solid ${COLORS.border}`,
      }}
    >
      {showAvatar ? (
        <Avatar profile={activity.actor} size={42} disablePreview />
      ) : (
        <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: `${meta.tint}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Glyph name={meta.glyph} size={19} color={meta.tint} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: COLORS.textPrimary, lineHeight: 1.4 }}>{activity.content}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2 }}>
          {timeAgo(activity.created_at)}
          {activity.actor?.sector ? ` · ${activity.actor.sector}` : ''}
        </div>
      </div>

      {activity.type === 'follow' ? (
        <button
          style={{ fontSize: 12, fontWeight: 700, color: COLORS.accentIndigo, background: COLORS.softLavender, border: 'none', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', flexShrink: 0 }}
        >
          Follow Back
        </button>
      ) : !activity.is_read ? (
        <span
          style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS.primary, flexShrink: 0, animation: 'ln-activity-pulse 1.6s ease-in-out infinite' }}
        />
      ) : null}
    </motion.div>
  );
}
