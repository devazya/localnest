/**
 * FollowButton.jsx — Social Identity & Follow System (Segment 5.1)
 * One tap. Instant. No Pending / Accept / Reject — ever.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { followUser, unfollowUser } from '../../services/followers';

export default function FollowButton({ viewerId, targetId, isFollowing, onChange, size = 'md' }) {
  const [busy, setBusy] = useState(false);
  const disabled = !viewerId || viewerId === targetId || busy;

  const toggle = async (e) => {
    e?.stopPropagation();
    if (!viewerId || viewerId === targetId || busy) return;
    setBusy(true);
    const next = !isFollowing;
    onChange?.(next); // optimistic — realtime subscription will reconcile counts
    try {
      if (next) await followUser(viewerId, targetId);
      else await unfollowUser(viewerId, targetId);
    } catch (err) {
      onChange?.(!next); // revert on failure
      console.error('Follow toggle failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const pad = size === 'sm' ? '7px 16px' : '9px 22px';
  const font = size === 'sm' ? 12.5 : 13.5;

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={toggle}
      disabled={disabled}
      style={{
        padding: pad,
        fontSize: font,
        fontWeight: 700,
        borderRadius: 999,
        cursor: disabled ? 'default' : 'pointer',
        border: isFollowing ? '1.5px solid #E5E7EB' : '1.5px solid transparent',
        background: isFollowing ? '#fff' : 'linear-gradient(135deg, #6D4AFF 0%, #8F7BFF 100%)',
        color: isFollowing ? '#374151' : '#fff',
        boxShadow: isFollowing ? 'none' : '0 6px 18px rgba(109,74,255,0.32)',
        opacity: busy ? 0.7 : 1,
        transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </motion.button>
  );
}
