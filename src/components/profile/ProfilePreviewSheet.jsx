/**
 * ProfilePreviewSheet.jsx — Social Identity & Follow System (Segment 5.1)
 *                          + Trust & Reputation System (Segment 5.2)
 *                          + Profile UI Premium Polish
 *
 * Compact, centered "3D style" overlay card opened by clicking any avatar
 * anywhere in LocalNest. It never navigates or changes screen — it's a
 * floating popover: Avatar / Name / Username / Neighbour Score / Trust
 * Level / Featured Badges / Followers / Following / Contribution Count +
 * Follow / View Profile.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../community/Avatar';
import FollowButton from './FollowButton';
import NeighbourScoreCard from './NeighbourScoreCard';
import BadgeRow from './BadgeRow';
import MutualConnectionsLine from './MutualConnectionsLine';
import ProfileQuickActionsMenu from './ProfileQuickActionsMenu';
import AnimatedNumber from '../community/AnimatedNumber';
import { fetchProfile, fetchFollowCounts, fetchIsFollowing, subscribeToFollowChanges } from '../../services/followers';
import {
  fetchContributionStats, totalContributions, computeNeighbourScore, getTrustLevel,
  fetchVerifications, computeBadges, subscribeToReputationChanges,
} from '../../services/reputation';

export default function ProfilePreviewSheet({ userId, viewerId, onClose, onViewProfile }) {
  const [profile, setProfile]   = useState(null);
  const [counts, setCounts]     = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [stats, setStats]       = useState(null);
  const [badges, setBadges]     = useState([]);
  const [toast, setToast]       = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      const c = await fetchFollowCounts(userId);
      setCounts(c);
      if (viewerId && viewerId !== userId) {
        setIsFollowing(await fetchIsFollowing(viewerId, userId));
      }
    } catch (err) {
      console.error('ProfilePreviewSheet reload failed:', err);
    }
  }, [userId, viewerId]);

  const reloadReputation = useCallback(async (currentProfile) => {
    if (!userId) return;
    try {
      const [s, verifs] = await Promise.all([
        fetchContributionStats(userId),
        fetchVerifications(userId, currentProfile),
      ]);
      setStats(s);
      setBadges(computeBadges(s, currentProfile, verifs));
    } catch (err) {
      console.error('ProfilePreviewSheet reputation reload failed:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setProfile(null); setStats(null); setBadges([]); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [p] = await Promise.all([fetchProfile(userId), reload()]);
        if (!cancelled) setProfile(p);
        if (!cancelled) await reloadReputation(p);
      } catch (err) {
        console.error('Failed to load profile preview:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToFollowChanges(userId, reload);
    return unsub;
  }, [userId, reload]);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToReputationChanges(userId, () => reloadReputation(profile));
    return unsub;
  }, [userId, profile, reloadReputation]);

  const isOpen = !!userId;
  const isOwn  = viewerId && viewerId === userId;
  const name   = profile?.full_name || profile?.username || 'Resident';
  const contributions = stats ? totalContributions(stats) : 0;
  const score  = stats ? computeNeighbourScore(stats) : 0;
  const trustLabel = getTrustLevel(score).label;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(13,8,32,0.5)', zIndex: 200, backdropFilter: 'blur(3px)' }}
          />
          <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 320, background: '#fff', borderRadius: 26,
                padding: '20px 18px', pointerEvents: 'auto',
                boxShadow: '0 30px 60px -12px rgba(45,15,120,0.45), 0 8px 20px -4px rgba(45,15,120,0.2)',
              }}
            >
              {loading && !profile ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
              ) : profile ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ boxShadow: '0 6px 16px -4px rgba(45,15,120,0.3)', borderRadius: '50%' }}>
                      <Avatar profile={profile} size={58} disablePreview />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 700, color: '#0D0820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        {profile.is_verified && <span style={{ fontSize: 11, color: '#6D4AFF' }}>✓</span>}
                      </div>
                      {profile.username && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>@{profile.username}</div>}
                      {!isOwn && <MutualConnectionsLine viewerId={viewerId} targetId={profile.id} />}
                    </div>
                    {!isOwn && (
                      <ProfileQuickActionsMenu
                        viewerId={viewerId}
                        profile={profile}
                        onToast={showToast}
                        iconOnly
                      />
                    )}
                  </div>

                  <div style={{ marginTop: 14, background: 'linear-gradient(160deg, #FDFCFF 0%, #F1ECFF 100%)', border: '1px solid #F0EEFF', borderRadius: 18, padding: '12px 14px' }}>
                    <NeighbourScoreCard score={score} trustLabel={trustLabel} />
                  </div>

                  {badges.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <BadgeRow badges={badges} size="sm" />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
                    {[
                      { label: 'Contributions', value: contributions },
                      { label: 'Followers', value: counts.followers },
                      { label: 'Following', value: counts.following },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#F8F7FF', border: '1px solid #F1EEFF', borderRadius: 12, padding: '8px 4px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 800, color: '#0D0820', lineHeight: 1 }}>
                          <AnimatedNumber value={s.value || 0} />
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#9CA3AF', marginTop: 3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isOwn ? '1fr' : 'auto 1fr', gap: 8, marginTop: 14 }}>
                    {!isOwn && (
                      <FollowButton
                        viewerId={viewerId}
                        targetId={profile.id}
                        isFollowing={isFollowing}
                        onChange={(next) => { setIsFollowing(next); setCounts(c => ({ ...c, followers: Math.max(0, c.followers + (next ? 1 : -1)) })); }}
                      />
                    )}
                    <button
                      onClick={() => onViewProfile?.(profile.id)}
                      style={{
                        padding: '9px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                        background: '#F5F4FF', color: '#6D4AFF', border: 'none', cursor: 'pointer',
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Couldn't load this profile.</div>
              )}
            </motion.div>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                style={{
                  position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
                  zIndex: 400, background: '#0D0820', color: '#fff', fontSize: 12.5, fontWeight: 600,
                  padding: '10px 18px', borderRadius: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
                }}
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
