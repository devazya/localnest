/**
 * Profile.jsx — Social Identity & Follow System (Segment 5.1)
 *              + Trust & Reputation System (Segment 5.2)
 * Extends the existing Profile page with Identity, the Follow system,
 * realtime follower/following counts, Profile Tabs, and now the full
 * Trust & Reputation System: Neighbour Score, Trust Level, Contribution
 * Summary, Featured Badges, Contribution Timeline and Verification —
 * all derived live from Supabase via services/reputation.js, refreshing
 * automatically on any underlying activity change.
 *
 * userId is optional: omitted (or equal to the signed-in user) → "my
 * profile" (with the settings menu). Any other id → viewing a resident.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import NeighbourScoreCard from '../components/profile/NeighbourScoreCard';
import ContributionStats from '../components/profile/ContributionStats';
import ContributionTimeline from '../components/profile/ContributionTimeline';
import BadgeRow from '../components/profile/BadgeRow';
import BadgeSheet from '../components/profile/BadgeSheet';
import VerificationBadge from '../components/profile/VerificationBadge';
import {
  fetchProfile, fetchFollowCounts, fetchIsFollowing, subscribeToFollowChanges,
} from '../services/followers';
import {
  fetchContributionStats, totalContributions, computeNeighbourScore, getTrustLevel,
  fetchVerifications, computeBadges, fetchContributionTimeline, subscribeToReputationChanges,
} from '../services/reputation';

export default function Profile({ userId: routeUserId, onNavigate }) {
  const { user, profile: myProfile, signOut } = useAuth();

  const targetId      = routeUserId || user?.id || null;
  const isOwnProfile  = !!targetId && targetId === user?.id;

  const [profile, setProfile]         = useState(null);
  const [counts, setCounts]           = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab]     = useState('overview');
  const [loading, setLoading]         = useState(true);

  // ── Trust & Reputation state (Segment 5.2) ──
  const [stats, setStats]             = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [timeline, setTimeline]       = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [badgeSheetOpen, setBadgeSheetOpen]   = useState(false);

  const reload = useCallback(async () => {
    if (!targetId) return;
    try {
      const c = await fetchFollowCounts(targetId);
      setCounts(c);
      if (!isOwnProfile && user) setIsFollowing(await fetchIsFollowing(user.id, targetId));
    } catch (err) {
      console.error('Failed to refresh follow counts:', err);
    }
  }, [targetId, isOwnProfile, user]);

  /** Recomputes every reputation-derived value from Supabase. Pure —
   * Score / Badges / Contribution Count / Timeline are always a live
   * function of the underlying tables, never stored or hardcoded. */
  const reloadReputation = useCallback(async (currentProfile) => {
    if (!targetId) return;
    try {
      setTimelineLoading(true);
      const [s, verifs, tl] = await Promise.all([
        fetchContributionStats(targetId),
        fetchVerifications(targetId, currentProfile),
        fetchContributionTimeline(targetId),
      ]);
      setStats(s);
      setVerifications(verifs);
      setTimeline(tl);
    } catch (err) {
      console.error('Failed to load reputation data:', err);
    } finally {
      setTimelineLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    if (!targetId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setActiveTab('overview');
    (async () => {
      try {
        const p = isOwnProfile && myProfile ? myProfile : await fetchProfile(targetId);
        if (!cancelled) setProfile(p);
        await Promise.all([reload(), reloadReputation(p)]);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!targetId) return;
    const unsub = subscribeToFollowChanges(targetId, reload);
    return unsub;
  }, [targetId, reload]);

  // Realtime: any change to the resident's contribution rows recomputes
  // Score, Badges, Contribution Count and Timeline with no page reload.
  useEffect(() => {
    if (!targetId) return;
    const unsub = subscribeToReputationChanges(targetId, () => reloadReputation(profile));
    return unsub;
  }, [targetId, profile, reloadReputation]);

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '40px 24px' }}>
        <div style={{ fontSize: 48 }}>👤</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#0D0820' }}>Sign in to continue</div>
        <div style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', maxWidth: 280 }}>Create an account to save listings, post content and connect with your community</div>
        <button onClick={() => onNavigate('auth')} style={{ background: '#6D4AFF', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(109,74,255,0.35)' }}>
          Sign In
        </button>
      </div>
    );
  }

  const MENU = [
    { icon: '📋', label: 'My Listings', action: () => onNavigate('pgs'), sub: 'View your listings' },
    { icon: '🔖', label: 'Saved',        action: () => {},                sub: 'Your saved items' },
    { icon: '🎟️', label: 'My Events',    action: () => onNavigate('events'), sub: 'Events you joined' },
    { icon: '⚙️', label: 'Settings',     action: () => {},                sub: 'Account & privacy' },
    { icon: '💬', label: 'Support',      action: () => {},                sub: 'Help & feedback' },
    { icon: '🚪', label: 'Logout',       action: signOut,                 sub: 'Sign out', danger: true },
  ];

  const safeStats     = stats || {};
  const contributions = stats ? totalContributions(stats) : 0;
  const score         = stats ? computeNeighbourScore(stats) : 0;
  const trustLabel     = getTrustLevel(score).label;
  const badges         = stats ? computeBadges(stats, profile, verifications) : [];

  const handleTimelineClick = (link) => {
    if (!link?.page) return;
    onNavigate(link.page, link.params);
  };

  const overviewContent = (
    <div style={{ padding: '18px 20px 8px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {profile?.bio && (
        <div style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6, background: '#F8F7FF', padding: '12px 14px', borderRadius: 14 }}>{profile.bio}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#9CA3AF' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
      </div>

      {/* Neighbour Score + Trust Level */}
      <div style={{ background: '#FAFAFF', border: '1px solid #F0EEFF', borderRadius: 18, padding: '16px 18px' }}>
        <NeighbourScoreCard score={score} trustLabel={trustLabel} />
      </div>

      {/* Verification */}
      {verifications.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {verifications.map(v => <VerificationBadge key={v.type} type={v.type} label={v.label} size="sm" />)}
        </div>
      )}

      {/* Featured Badges */}
      {badges.length > 0 && (
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0820', marginBottom: 10 }}>Badges</div>
          <BadgeRow badges={badges} onViewAll={() => setBadgeSheetOpen(true)} />
        </div>
      )}

      {/* Contribution Summary */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0820', marginBottom: 10 }}>Contribution Summary</div>
        <ContributionStats stats={safeStats} />
      </div>

      {/* Contribution Timeline — centrepiece of the Overview tab */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0D0820', marginBottom: 4 }}>Recent Activity</div>
        <ContributionTimeline items={timeline} loading={timelineLoading} onItemClick={handleTimelineClick} />
      </div>

      {isOwnProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MENU.map(item => (
            <motion.button
              key={item.label}
              onClick={item.action}
              whileTap={{ scale: 0.97 }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', border: '1.5px solid rgba(0,0,0,0.06)', borderRadius: 16, cursor: 'pointer', color: item.danger ? '#EF4444' : '#0D0820', textAlign: 'left', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: item.danger ? 'rgba(239,68,68,0.08)' : '#F5F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.2 }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>{item.sub}</div>
              </div>
              <svg style={{ opacity: 0.3, flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: '#F5F4FF', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-h) + 24px)' }}>
      {loading && !profile ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading profile…</div>
      ) : !profile ? (
        <div style={{ padding: '80px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>This resident couldn't be found.</div>
      ) : (
        <>
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            viewerId={user.id}
            followers={counts.followers}
            following={counts.following}
            isFollowing={isFollowing}
            score={score}
            trustLabel={trustLabel}
            contributions={contributions}
            onFollowChange={(next) => { setIsFollowing(next); setCounts(c => ({ ...c, followers: Math.max(0, c.followers + (next ? 1 : -1)) })); }}
          />
          <div style={{ margin: '-28px 20px 0', background: '#fff', borderRadius: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
            <ProfileTabs activeKey={activeTab} onChange={setActiveTab} overviewContent={overviewContent} />
          </div>
          <BadgeSheet open={badgeSheetOpen} badges={badges} onClose={() => setBadgeSheetOpen(false)} />
        </>
      )}
    </div>
  );
}
