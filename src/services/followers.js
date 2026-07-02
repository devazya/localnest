/**
 * followers.js — Social Identity & Follow System (Segment 5.1)
 * Supabase data layer for the X/Twitter-style follow graph.
 *
 * Table: public.followers (see supabase/migrations/0002_followers_system.sql)
 *   follower_id, following_id, created_at
 *
 * There is no "pending / accepted / rejected" state — a row existing means
 * follower_id follows following_id. Full stop.
 */
import { supabase } from './supabase/client';

export const FOLLOWERS_TABLE = 'followers';

export const PROFILE_SELECT =
  'id,username,full_name,avatar_url,bio,locality,city,is_verified,created_at';

/**
 * Fetch a single resident's profile — used by the Profile page / preview
 * sheet regardless of whether it's "me" or someone else.
 */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Followers / Following counts for a profile. Two lightweight head-count
 * queries — cheap, and always correct (no denormalized counter to drift).
 */
export async function fetchFollowCounts(userId) {
  const [{ count: followers = 0 }, { count: following = 0 }] = await Promise.all([
    supabase.from(FOLLOWERS_TABLE).select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from(FOLLOWERS_TABLE).select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers || 0, following: following || 0 };
}

/** Does `viewerId` currently follow `targetId`? */
export async function fetchIsFollowing(viewerId, targetId) {
  if (!viewerId || !targetId || viewerId === targetId) return false;
  const { data, error } = await supabase
    .from(FOLLOWERS_TABLE)
    .select('follower_id')
    .eq('follower_id', viewerId)
    .eq('following_id', targetId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** One tap. Instant. No request/accept flow. */
export async function followUser(viewerId, targetId) {
  if (viewerId === targetId) throw new Error("You can't follow yourself");
  const { error } = await supabase
    .from(FOLLOWERS_TABLE)
    .insert({ follower_id: viewerId, following_id: targetId });
  if (error && error.code !== '23505') throw error; // ignore "already following"
}

export async function unfollowUser(viewerId, targetId) {
  const { error } = await supabase
    .from(FOLLOWERS_TABLE)
    .delete()
    .eq('follower_id', viewerId)
    .eq('following_id', targetId);
  if (error) throw error;
}

/**
 * Realtime: any INSERT/DELETE on the follow graph touching `userId`
 * (as either side) triggers a recount. Powers instant follower/following
 * counts + Follow/Following button state with no refresh.
 */
export function subscribeToFollowChanges(userId, onChange) {
  if (!userId) return () => {};
  const channel = supabase
    .channel(`followers-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: FOLLOWERS_TABLE, filter: `following_id=eq.${userId}` }, () => onChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: FOLLOWERS_TABLE, filter: `follower_id=eq.${userId}` }, () => onChange?.())
    .subscribe();

  return () => supabase.removeChannel(channel);
}
