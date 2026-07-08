/**
 * ActivityFeedItem.jsx — Activity Center & Settings (Segment 8)
 * One row in the Activity feed. Slides in from the right on mount/insert
 * (per the spec's "list items slide in from right" animation note).
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Avatar from '../community/Avatar';
import Glyph from './Glyph';
import { COLORS, SHADOW_SOFT } from './constants';
import { timeAgo, getTypeMeta } from './utils';
import { followUser, fetchIsFollowing } from '../../services/followers';

export default function ActivityFeedItem({ activity, index = 0, viewerId }) {
  const meta = getTypeMeta(activity.type);
  const showAvatar = meta.glyph === 'avatar' && activity.actor?.avatar_url;
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (activity.type !== 'follow' || !viewerId || !activity.actor_id) return;
    let cancelled = false;
    fetchIsFollowing(viewerId, activity.actor_id).then((isF) => { if (!cancelled) setFollowing(isF); });
    return () => { cancelled = true; };
  }, [viewerId, activity.type, activity.actor_id]);

  const handleFollowBack = async (e) => {
    e.stopPropagation();
    if (!viewerId || !activity.actor_id || busy || following) return;
    setBusy(true);
    setFollowing(true); // optimistic
    try {
      await followUser(viewerId, activity.actor_id);
    } catch (err) {
      console.error('[ActivityFeedItem] follow back failed:', err);
      setFollowing(false);
    } finally {
      setBusy(false);
    }
  };

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
          onClick={handleFollowBack}
          disabled={busy || following}
          style={{
            fontSize: 12, fontWeight: 700,
            color: following ? '#374151' : COLORS.accentIndigo,
            background: following ? '#fff' : COLORS.softLavender,
            border: following ? '1.5px solid #E5E7EB' : 'none',
            padding: '7px 14px', borderRadius: 999,
            cursor: (busy || following) ? 'default' : 'pointer',
            opacity: busy ? 0.7 : 1,
            flexShrink: 0,
          }}
        >
          {following ? 'Following' : 'Follow Back'}
        </button>
      ) : !activity.is_read ? (
        <span
          style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS.primary, flexShrink: 0, animation: 'ln-activity-pulse 1.6s ease-in-out infinite' }}
        />
      ) : null}
    </motion.div>
  );
}
