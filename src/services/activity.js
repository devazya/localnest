/**
 * activity.js — Activity Center & Settings (Segment 8)
 * Supabase data layer. Mirrors the conventions in services/discussions.js —
 * Supabase is the only source of truth, nothing here is hardcoded.
 *
 * Tables/views (see supabase/migrations/):
 *   public.activities      — per-user notification feed (realtime)
 *   public.user_settings   — quiet hours + notification preferences
 *   public.user_stats      — live view (Community Pulse + Weekly Recap)
 */
import { supabase } from './supabase/client';

export const ACTIVITY_SELECT =
  'id,user_id,actor_id,type,content,created_at,is_read,' +
  'actor:profiles!activities_actor_id_fkey(id,full_name,avatar_url,sector)';

const DEFAULT_NOTIFICATION_PREFERENCES = {
  mentions: true, replies: true, updates_announcements: true, trending_discussions: false,
  new_listings: true, price_drops: true, offers_messages: true,
  ride_updates: true, ride_reminders: true, ride_cancellations: true,
  event_reminders: true, event_updates: true, event_cancellations: true,
  neighbour_score_updates: true, weekly_recap: true, tips_suggestions: false,
};

/** Recent activity feed for one user, newest first. */
export async function fetchActivities(userId, { limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('activities')
    .select(ACTIVITY_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/** Hydrate a realtime INSERT payload (raw columns only) with the actor's profile. */
export async function fetchActivityActor(actorId) {
  if (!actorId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id,full_name,avatar_url,sector')
    .eq('id', actorId)
    .maybeSingle();
  return data || null;
}

export async function markAllActivitiesRead(userId) {
  const { error } = await supabase
    .from('activities')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

/** Community Pulse + Weekly Recap numbers — always live, nothing to keep in sync. */
export async function fetchUserStats(userId) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Fetch settings, creating the default row on first visit (no dummy data — just sane defaults). */
export async function fetchOrCreateUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await supabase
    .from('user_settings')
    .insert({ user_id: userId })
    .select('*')
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function updateUserSettings(userId, patch) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(patch)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateNotificationPreference(userId, currentPreferences, key, value) {
  const nextPrefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(currentPreferences || {}), [key]: value };
  return updateUserSettings(userId, { notification_preferences: nextPrefs });
}

/**
 * Realtime: new + updated activity rows for this user. One dedicated
 * channel per session, matching the pattern in services/discussions.js.
 */
export function subscribeToActivities(userId, { onInsert, onUpdate } = {}) {
  if (!userId) return () => {};
  const channel = supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activities', filter: `user_id=eq.${userId}` },
      (payload) => onInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'activities', filter: `user_id=eq.${userId}` },
      (payload) => onUpdate?.(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
