/**
 * ProfileHeader.jsx — Social Identity & Follow System (Segment 5.1)
 * Extended in Trust & Reputation System (Segment 5.2), and restyled to
 * match the LocalNest premium-redesign reference: a hand-drawn SVG
 * sky/skyline backdrop, a Neighbour Score hero with a real "Top X% in
 * <locality>" line (see reputation.js:fetchSectorStanding — never
 * fabricated), a 4-up stats row, and an action row that matches the
 * reference's button style. All data is sourced from existing props —
 * nothing here is invented.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from '../community/Avatar';
import AnimatedNumber from '../community/AnimatedNumber';
import FollowButton from './FollowButton';
import NeighbourScoreCard from './NeighbourScoreCard';
import MutualConnectionsLine from './MutualConnectionsLine';
import ProfileQuickActionsMenu from './ProfileQuickActionsMenu';
import ShareProfileSheet from './ShareProfileSheet';

function SkylineBackground() {
  return (
    <svg
      viewBox="0 0 400 220" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    >
      <defs>
        <linearGradient id="ph-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D4AFF" />
          <stop offset="100%" stopColor="#9C87FF" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#ph-sky)" />
      {/* sparkles */}
      {[[24,20,2.2],[70,50,1.4],[340,30,2],[300,70,1.3],[20,110,1.6],[370,140,1.8],[130,24,1.3],[250,18,1.6],[380,20,1.5],[10,60,1.2],[200,14,1.4]].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.85} />
      ))}
      {/* soft clouds */}
      <ellipse cx="330" cy="60" rx="46" ry="16" fill="#fff" opacity="0.08" />
      <ellipse cx="60" cy="150" rx="60" ry="20" fill="#fff" opacity="0.06" />
      {/* skyline silhouette, bottom-right — pitched-roof houses + towers */}
      <g fill="#fff" opacity="0.13">
        <rect x="246" y="160" width="28" height="60" />
        <polygon points="246,160 260,144 274,160" />
        <rect x="280" y="125" width="24" height="95" />
        <rect x="310" y="165" width="32" height="55" />
        <polygon points="310,165 326,150 342,165" />
        <rect x="292" y="100" width="14" height="25" />
        <polygon points="292,100 299,88 306,100" />
        <rect x="348" y="145" width="26" height="75" />
        <rect x="218" y="178" width="26" height="42" />
        <polygon points="218,178 231,166 244,178" />
        <rect x="376" y="170" width="22" height="50" />
      </g>
    </svg>
  );
}

export default function ProfileHeader({
  profile, isOwnProfile, viewerId,
  followers, following, isFollowing,
  score = 0, trustLabel, contributions,
  helpfulVotes = 0, standing = null,
  onFollowChange, onFollowersClick, onFollowingClick,
}) {
  const [isMuted, setIsMuted] = useState(false);
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
    <div style={{ position: 'relative', overflow: 'hidden', padding: '28px 20px 60px' }}>
      <SkylineBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ borderRadius: 22, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', flexShrink: 0 }}>
          <Avatar profile={profile} size={72} disablePreview />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: '#fff', letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            {profile.is_verified && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ flexShrink: 0 }}><path d="M12 2l2.4 2.2 3.2-.6.9 3.1 3 1.3-.9 3.1L22 14l-1.4 2.9.9 3.1-3 1.3-.9 3.1-3.2-.6L12 26l-2.4-2.2-3.2.6-.9-3.1-3-1.3.9-3.1L2 14l1.4-2.9-.9-3.1 3-1.3.9-3.1 3.2.6z" transform="translate(0,-2) scale(0.9)" /><path d="M9 12.5l2 2 4-4.5" stroke="#6D4AFF" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </div>
          {profile.username && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>@{profile.username}</div>}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            {profile.locality && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {profile.locality}{profile.city ? `, ${profile.city}` : ''}
              </div>
            )}
            {joined && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                Joined {joined}
              </div>
            )}
          </div>
          {trustLabel && (
            <div style={{ marginTop: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700,
                color: '#fff', background: 'rgba(255,255,255,0.16)', padding: '4px 10px', borderRadius: 999,
                backdropFilter: 'blur(6px)',
              }}>
                ⭐ {trustLabel}
              </span>
            </div>
          )}
        </div>

        {!isOwnProfile && viewerId && (
          <ProfileQuickActionsMenu
            viewerId={viewerId}
            profile={profile}
            isMuted={isMuted}
            onMuteChange={setIsMuted}
            onToast={showToast}
          />
        )}
      </div>

      {!isOwnProfile && viewerId && (
        <div style={{ marginTop: 4 }}>
          <MutualConnectionsLine viewerId={viewerId} targetId={profile.id} />
        </div>
      )}

      <div style={{
        marginTop: 20, background: 'linear-gradient(160deg, #FDFCFF 0%, #F1ECFF 100%)', borderRadius: 20,
        padding: '18px 20px', boxShadow: '0 16px 32px -8px rgba(45,15,120,0.35), 0 2px 6px rgba(45,15,120,0.1)',
      }}>
        <NeighbourScoreCard score={score} trustLabel={trustLabel} standing={standing} />
      </div>

      {/* Stats row — Contributions / Followers / Following / Helpful Votes */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {STATS.map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            disabled={!s.onClick}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: '#fff', border: 'none', borderRadius: 16,
              padding: '12px 6px', cursor: s.onClick ? 'pointer' : 'default',
              boxShadow: '0 8px 16px -6px rgba(45,15,120,0.28), 0 1.5px 3px rgba(45,15,120,0.08)',
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
              background: '#fff', border: 'none', borderRadius: 14, padding: '13px 0',
              color: '#6D4AFF', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 10px 20px -6px rgba(45,15,120,0.4), 0 2px 4px rgba(45,15,120,0.1)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
            Share Profile
          </motion.button>
        </div>
      ) : viewerId && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
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
            onClick={() => setShareOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.16)',
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '10px 16px',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(6px)',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
            Share
          </motion.button>
        </div>
      )}

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
    </div>
  );
}
