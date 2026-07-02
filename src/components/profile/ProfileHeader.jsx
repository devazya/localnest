/**
 * ProfileHeader.jsx — Social Identity & Follow System (Segment 5.1)
 * Extended in Trust & Reputation System (Segment 5.2): the Neighbour
 * Score is now the visual focus of the hero, with Contributions /
 * Followers / Following as secondary supporting stats below it.
 * Reusable profile header: avatar, full name, username, locality,
 * verification badge, Neighbour Score, and (when viewing someone
 * else) the Follow button.
 */
import { useState } from 'react';
import Avatar from '../community/Avatar';
import ProfileStats from './ProfileStats';
import FollowButton from './FollowButton';
import NeighbourScoreCard from './NeighbourScoreCard';
import MutualConnectionsLine from './MutualConnectionsLine';
import ProfileQuickActionsMenu from './ProfileQuickActionsMenu';
import ShareProfileSheet from './ShareProfileSheet';

export default function ProfileHeader({
  profile, isOwnProfile, viewerId,
  followers, following, isFollowing,
  score = 0, trustLabel, contributions,
  onFollowChange, onFollowersClick, onFollowingClick,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  if (!profile) return null;
  const name = profile.full_name || profile.username || 'Resident';

  return (
    <div style={{ background: 'linear-gradient(160deg, #6D4AFF 0%, #8F7BFF 100%)', padding: '28px 20px 60px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ borderRadius: 22, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <Avatar profile={profile} size={72} disablePreview />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#fff', letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            {profile.is_verified && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ flexShrink: 0 }}><path d="M12 2l2.4 2.2 3.2-.6.9 3.1 3 1.3-.9 3.1L22 14l-1.4 2.9.9 3.1-3 1.3-.9 3.1-3.2-.6L12 26l-2.4-2.2-3.2.6-.9-3.1-3-1.3.9-3.1L2 14l1.4-2.9-.9-3.1 3-1.3.9-3.1 3.2.6z" transform="translate(0,-2) scale(0.9)"/><path d="M9 12.5l2 2 4-4.5" stroke="#6D4AFF" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </div>
          {profile.username && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>@{profile.username}</div>}
          {profile.locality && (
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {profile.locality}{profile.city ? `, ${profile.city}` : ''}
            </div>
          )}
        </div>

        {!isOwnProfile && viewerId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FollowButton
              viewerId={viewerId}
              targetId={profile.id}
              isFollowing={isFollowing}
              onChange={onFollowChange}
            />
            <ProfileQuickActionsMenu
              viewerId={viewerId}
              profile={profile}
              isMuted={isMuted}
              onMuteChange={setIsMuted}
              onToast={showToast}
            />
          </div>
        )}
      </div>

      {!isOwnProfile && viewerId && (
        <div style={{ marginTop: 4 }}>
          <MutualConnectionsLine viewerId={viewerId} targetId={profile.id} />
        </div>
      )}

      <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: '16px 18px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)' }}>
        <NeighbourScoreCard score={score} trustLabel={trustLabel} light />
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.14)', display: 'inline-flex', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(8px)' }}>
          <ProfileStats
            followers={followers}
            following={following}
            contributions={contributions}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
            light
          />
        </div>
        <button
          onClick={() => setShareOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.14)', border: 'none',
            borderRadius: 999, padding: '9px 16px', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          📤 Share
        </button>
      </div>

      {shareOpen && <ShareProfileSheet profile={profile} onClose={() => setShareOpen(false)} />}

      {toast && (
        <div style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
          zIndex: 400, background: '#0D0820', color: '#fff', fontSize: 12.5, fontWeight: 600,
          padding: '10px 18px', borderRadius: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
