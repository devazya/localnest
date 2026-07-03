/**
 * ProfileHeader.jsx — Profile UI Premium Polish
 *
 * Hero uses the "profile bg" asset edge-to-edge with rounded bottom
 * corners; the avatar is the universal "profile circle" frame (see
 * ProfileAvatar.jsx) shared by every resident. The Neighbour Score card
 * floats up, overlapping the hero/white boundary. All data below is
 * sourced from existing props — nothing here is invented.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import profileBg from '../../assets/images/profile bg.png';
import ProfileAvatar from './ProfileAvatar';
import AnimatedNumber from '../community/AnimatedNumber';
import FollowButton from './FollowButton';
import NeighbourScoreCard from './NeighbourScoreCard';
import MutualConnectionsLine from './MutualConnectionsLine';
import ProfileQuickActionsMenu from './ProfileQuickActionsMenu';
import ShareProfileSheet from './ShareProfileSheet';

export default function ProfileHeader({
  profile, isOwnProfile, viewerId,
  followers, following, isFollowing,
  score = 0, trustLabel, contributions,
  helpfulVotes = 0, standing = null, online = false,
  onFollowChange, onFollowersClick, onFollowingClick, onAvatarUploaded,
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  if (!profile) return null;
  const name = profile.full_name || profile.username || 'Resident';
  const joined = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  const STATS = [
    {
      label: 'Contributions', value: contributions, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2">
          <path d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15" />
          <path d="M16.83 6.98a3 3 0 1 0-5.83-1.098" />
          <path d="M18.5 9.5 12.99 9.38" />
        </svg>
      ),
    },
    {
      label: 'Followers', value: followers, onClick: onFollowersClick, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Following', value: following, onClick: onFollowingClick, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
          <path d="M20 8v6M23 11h-6" />
        </svg>
      ),
    },
    {
      label: 'Helpful Votes', value: helpfulVotes, icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* ── HERO — "profile bg" asset, edge-to-edge, rounded bottom corners ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', padding: '26px 20px 64px',
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
      }}>
        <img
          src={profileBg}
          alt=""
          draggable={false}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0, userSelect: 'none', pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <ProfileAvatar
              profile={profile}
              size={92}
              online={online}
              editable={isOwnProfile}
              onUploaded={onAvatarUploaded}
            />
            <div style={{ flex: 1, minWidth: 0, paddingTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#fff', letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                {profile.is_verified && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.12)" />
                    <path d="M8.5 12.5l2.2 2.2L15.5 9.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {profile.username && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>@{profile.username}</div>}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 7 }}>
                {profile.locality && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {profile.locality}{profile.city ? `, ${profile.city}` : ''}
                  </div>
                )}
                {joined && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    Joined {joined}
                  </div>
                )}
              </div>
              {trustLabel && (
                <div style={{ marginTop: 9 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700,
                    color: '#fff', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: 999,
                    backdropFilter: 'blur(6px)',
                  }}>
                    ⭐ {trustLabel}
                  </span>
                </div>
              )}
            </div>

            {!isOwnProfile && viewerId && (
              <div style={{ display: 'flex', gap: 6 }}>
                <ShareIconButton onClick={() => setShareOpen(true)} />
                <ProfileQuickActionsMenu
                  viewerId={viewerId}
                  profile={profile}
                  onToast={showToast}
                />
              </div>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setShareOpen(true)}
                aria-label="Share profile"
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.16)', color: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v14" /></svg>
              </button>
            )}
          </div>

          {!isOwnProfile && viewerId && (
            <div style={{ marginTop: 6 }}>
              <MutualConnectionsLine viewerId={viewerId} targetId={profile.id} />
            </div>
          )}
        </div>
      </div>

      {/* ── Neighbour Score — overlaps the hero/white boundary ── */}
      <div style={{
        margin: '-46px 20px 0', position: 'relative', zIndex: 10,
        background: 'linear-gradient(160deg, #FDFCFF 0%, #F1ECFF 100%)', borderRadius: 20,
        padding: '18px 20px', boxShadow: '0 18px 34px -10px rgba(45,15,120,0.4), 0 2px 6px rgba(45,15,120,0.1)',
      }}>
        <NeighbourScoreCard score={score} trustLabel={trustLabel} standing={standing} />
      </div>

      {/* ── White content area begins here ── */}
      <div style={{ background: '#fff', padding: '14px 20px 0' }}>
        {/* Stats row — Contributions / Followers / Following / Helpful Votes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {STATS.map(s => (
            <button
              key={s.label}
              onClick={s.onClick}
              disabled={!s.onClick}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: '#fff', border: '1px solid #F1EEFF', borderRadius: 16,
                padding: '12px 6px', cursor: s.onClick ? 'pointer' : 'default',
                boxShadow: '0 8px 16px -6px rgba(45,15,120,0.16), 0 1.5px 3px rgba(45,15,120,0.06)',
              }}
            >
              {s.icon}
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#0D0820', lineHeight: 1 }}>
                <AnimatedNumber value={s.value || 0} />
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Actions row */}
        {isOwnProfile ? (
          <div style={{ marginTop: 12 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShareOpen(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'linear-gradient(135deg, #6D4AFF 0%, #8F7BFF 100%)', border: 'none', borderRadius: 14, padding: '13px 0',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 10px 22px -6px rgba(76,29,149,0.45), 0 2px 4px rgba(76,29,149,0.12)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
              Share Profile
            </motion.button>
          </div>
        ) : viewerId && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1.4 }}>
              <FollowButton
                viewerId={viewerId}
                targetId={profile.id}
                isFollowing={isFollowing}
                onChange={onFollowChange}
                fullWidth
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => showToast('Invite — Coming Soon')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#F5F4FF', border: '1.5px solid #EDE7FF', borderRadius: 999, padding: '9px 14px',
                color: '#6D4AFF', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 6px 14px -6px rgba(45,15,120,0.14)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
              Invite
            </motion.button>
            <ProfileQuickActionsMenu
              viewerId={viewerId}
              profile={profile}
              onToast={showToast}
              iconOnly
            />
          </div>
        )}
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

function ShareIconButton({ onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label="Share profile"
      style={{
        width: 34, height: 34, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.16)', color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', flexShrink: 0, backdropFilter: 'blur(6px)',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
    </motion.button>
  );
}
