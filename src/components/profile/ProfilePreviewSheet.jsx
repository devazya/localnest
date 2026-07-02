/**
 * ProfilePreviewSheet.jsx — Social Identity & Follow System (Segment 5.1)
 *                          + Trust & Reputation System (Segment 5.2)
 * Bottom sheet opened by clicking any avatar anywhere in LocalNest.
 * Avatar / Name / Username / Locality / Neighbour Score / Trust Level /
 * Featured Badges / Followers / Following / Contribution Count +
 * Follow, View Profile, Message (Coming Soon), Invite (Coming Soon).
 * Buttons are unchanged from Segment 5.1 — only the summary above them
 * gained the reputation snapshot.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../community/Avatar';
import ProfileStats from './ProfileStats';
import FollowButton from './FollowButton';
import NeighbourScoreCard from './NeighbourScoreCard';
import BadgeRow from './BadgeRow';
import MutualConnectionsLine from './MutualConnectionsLine';
import ProfileQuickActionsMenu from './ProfileQuickActionsMenu';
import ShareProfileSheet from './ShareProfileSheet';
import ContributionTimeline from './ContributionTimeline';
import { fetchProfile, fetchFollowCounts, fetchIsFollowing, subscribeToFollowChanges } from '../../services/followers';
import {
  fetchContributionStats, totalContributions, computeNeighbourScore, getTrustLevel,
  fetchVerifications, computeBadges, fetchContributionTimeline, subscribeToReputationChanges,
} from '../../services/reputation';
import { fetchIsMuted } from '../../services/social';

const ACTIVITY_PREVIEW_LIMIT = 5;

export default function ProfilePreviewSheet({ userId, viewerId, onClose, onViewProfile }) {
  const [profile, setProfile]   = useState(null);
  const [counts, setCounts]     = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [stats, setStats]       = useState(null);
  const [badges, setBadges]     = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [isMuted, setIsMuted]   = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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
      setTimelineLoading(true);
      const [s, verifs, tl] = await Promise.all([
        fetchContributionStats(userId),
        fetchVerifications(userId, currentProfile),
        fetchContributionTimeline(userId),
      ]);
      setStats(s);
      setBadges(computeBadges(s, currentProfile, verifs));
      setTimeline(tl.slice(0, ACTIVITY_PREVIEW_LIMIT));
    } catch (err) {
      console.error('ProfilePreviewSheet reputation reload failed:', err);
    } finally {
      setTimelineLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setProfile(null); setStats(null); setBadges([]); setTimeline([]); setIsMuted(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [p] = await Promise.all([fetchProfile(userId), reload()]);
        if (!cancelled) setProfile(p);
        if (!cancelled) await reloadReputation(p);
        if (!cancelled && viewerId && viewerId !== userId) setIsMuted(await fetchIsMuted(viewerId, userId));
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
  const contributions = stats ? totalContributions(stats) : undefined;
  const score  = stats ? computeNeighbourScore(stats) : 0;
  const trustLabel = getTrustLevel(score).label;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(13,8,32,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
              background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 22px calc(24px + env(safe-area-inset-bottom))',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.18)', maxWidth: 480, margin: '0 auto',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 4, background: '#E5E7EB', margin: '4px auto 18px' }} />

            {loading && !profile ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
            ) : profile ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <Avatar profile={profile} size={64} disablePreview />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0D0820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      {profile.is_verified && <span style={{ fontSize: 11, color: '#6D4AFF' }}>✓</span>}
                    </div>
                    {profile.username && <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 1 }}>@{profile.username}</div>}
                    {profile.locality && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>📍 {profile.locality}{profile.city ? `, ${profile.city}` : ''}</div>}
                    {!isOwn && <MutualConnectionsLine viewerId={viewerId} targetId={profile.id} />}
                  </div>
                  {!isOwn && (
                    <ProfileQuickActionsMenu
                      viewerId={viewerId}
                      profile={profile}
                      isMuted={isMuted}
                      onMuteChange={setIsMuted}
                      onToast={showToast}
                    />
                  )}
                </div>

                <div style={{ marginTop: 16, background: '#FAFAFF', border: '1px solid #F0EEFF', borderRadius: 16, padding: '12px 14px' }}>
                  <NeighbourScoreCard score={score} trustLabel={trustLabel} />
                </div>

                {badges.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <BadgeRow badges={badges} size="sm" />
                  </div>
                )}

                <div style={{ marginTop: 14 }}>
                  <ProfileStats followers={counts.followers} following={counts.following} contributions={contributions} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isOwn ? '1fr' : 'auto 1fr', gap: 10, marginTop: 20 }}>
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
                      padding: '9px 22px', borderRadius: 999, fontSize: 13.5, fontWeight: 700,
                      background: '#F5F4FF', color: '#6D4AFF', border: 'none', cursor: 'pointer',
                    }}
                  >
                    View Profile
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <button disabled style={{ padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#FAFAFA', color: '#C0C0CC', border: '1.5px solid #F0F0F0', cursor: 'not-allowed' }}>
                    💬 Message · Soon
                  </button>
                  <button disabled style={{ padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#FAFAFA', color: '#C0C0CC', border: '1.5px solid #F0F0F0', cursor: 'not-allowed' }}>
                    ✉️ Invite · Soon
                  </button>
                </div>

                <button
                  onClick={() => setShareOpen(true)}
                  style={{
                    width: '100%', marginTop: 10, padding: '9px 14px', borderRadius: 999, fontSize: 13,
                    fontWeight: 600, background: '#FAFAFF', color: '#6D4AFF', border: '1.5px solid #F0EEFF', cursor: 'pointer',
                  }}
                >
                  📤 Share Profile
                </button>

                {(timeline.length > 0 || timelineLoading) && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0820' }}>Recent Activity</div>
                      <button
                        onClick={() => onViewProfile?.(profile.id)}
                        style={{ background: 'none', border: 'none', fontSize: 11.5, fontWeight: 700, color: '#6D4AFF', cursor: 'pointer', padding: 0 }}
                      >
                        View Profile →
                      </button>
                    </div>
                    <ContributionTimeline items={timeline} loading={timelineLoading} />
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Couldn't load this profile.</div>
            )}
          </motion.div>

          {shareOpen && <ShareProfileSheet profile={profile} onClose={() => setShareOpen(false)} />}

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
