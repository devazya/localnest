/**
 * ResidentSuggestionCard.jsx — Social Interaction Layer (Segment 5.3)
 * Single card inside "People You May Know". Tapping the avatar/name opens
 * Profile Preview; the Follow button acts inline without leaving the rail.
 */
import { motion } from 'framer-motion';
import Avatar from '../community/Avatar';
import FollowButton from './FollowButton';

export default function ResidentSuggestionCard({ profile, viewerId, isFollowing, onFollowChange }) {
  const name = profile.full_name || profile.username || 'Resident';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        width: 148, flexShrink: 0, background: '#fff', borderRadius: 20,
        border: '1px solid rgba(109,74,255,0.08)', boxShadow: '0 6px 20px rgba(109,74,255,0.08)',
        padding: '18px 14px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}
    >
      <Avatar profile={profile} size={56} />
      <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0D0820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        {profile.locality && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {profile.locality}</div>}
      </div>
      <FollowButton viewerId={viewerId} targetId={profile.id} isFollowing={isFollowing} onChange={(next) => onFollowChange?.(profile.id, next)} size="sm" />
    </motion.div>
  );
}
