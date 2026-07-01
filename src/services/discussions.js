/**
 * discussions.js — Community module (Segment 3)
 * Supabase data layer for the reusable Discussion Ecosystem. Supabase is
 * the only source of truth — no discussion is ever hardcoded on the client.
 *
 * Table: public.discussions (see supabase/migrations/0001_discussions.sql)
 *   id, title, description, community_channel, category,
 *   creator_id, created_at, updated_at, last_activity_at, status
 */
import { supabase } from './supabase/client';

export const DISCUSSIONS_TABLE = 'discussions';

export const DISCUSSION_SELECT =
  'id,title,description,community_channel,category,creator_id,created_at,updated_at,last_activity_at,status,' +
  'profiles:creator_id(id,full_name,username,avatar_url,is_verified)';

/**
 * Fetch active (optionally + archived) discussions for a single Community
 * channel, newest activity first. Used by every channel's discussion list.
 */
export async function fetchChannelDiscussions(slug, { includeArchived = false, limit = 50 } = {}) {
  let q = supabase.from(DISCUSSIONS_TABLE).select(DISCUSSION_SELECT).eq('community_channel', slug);
  if (!includeArchived) q = q.eq('status', 'active');
  q = q.order('last_activity_at', { ascending: false }).limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch active discussions across ALL channels — the raw feed General's
 * discovery hub (Trending / Recently Active / Popular) is built from.
 * The actual discussion still lives inside its own channel; General only
 * surfaces it here.
 */
export async function fetchDiscoveryDiscussions({ limit = 60 } = {}) {
  const { data, error } = await supabase
    .from(DISCUSSIONS_TABLE)
    .select(DISCUSSION_SELECT)
    .eq('status', 'active')
    .order('last_activity_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single discussion (with creator profile joined) — used to hydrate
 * a realtime INSERT payload, which only carries raw table columns.
 */
export async function fetchDiscussionById(id) {
  const { data, error } = await supabase
    .from(DISCUSSIONS_TABLE)
    .select(DISCUSSION_SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Create a discussion inside its assigned Community channel. Every
 * discussion belongs to exactly one channel (community_channel).
 */
export async function createDiscussion({ title, description, community_channel, category, creator_id }) {
  const { data, error } = await supabase
    .from(DISCUSSIONS_TABLE)
    .insert({
      title,
      description: description || null,
      community_channel,
      category,
      creator_id,
      status: 'active',
      last_activity_at: new Date().toISOString(),
    })
    .select(DISCUSSION_SELECT)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Every new message updates last_activity_at — used later for sorting,
 * Trending, Recently Active, and Auto Archive. The Discussion Room itself
 * keeps its message list local/ephemeral (unchanged, not rebuilt this
 * segment); this is only the activity-timestamp side effect.
 */
export async function touchDiscussionActivity(id) {
  const { error } = await supabase
    .from(DISCUSSIONS_TABLE)
    .update({ last_activity_at: new Date().toISOString(), status: 'active' })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Auto-archive: 24 hours without activity → archived. Archived discussions
 * disappear from Active Discussions but are never deleted. There's no
 * server-side cron wired up yet, so this is called opportunistically
 * (on mount + on an interval) as a lazy sweep — safe to call repeatedly.
 */
export async function sweepArchivedDiscussions(hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from(DISCUSSIONS_TABLE)
    .update({ status: 'archived' })
    .eq('status', 'active')
    .lt('last_activity_at', cutoff);
  if (error) throw error;
}

/**
 * Realtime: notify every viewer of a Community channel the instant a new
 * discussion is created — no refresh needed. One shared subscription for
 * the whole discussions table; callers filter by channel themselves so a
 * single socket powers every channel's list plus General's discovery hub.
 */
export function subscribeToDiscussions({ onInsert, onUpdate } = {}) {
  const channel = supabase
    .channel('discussions-all')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: DISCUSSIONS_TABLE }, (payload) => {
      onInsert?.(payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: DISCUSSIONS_TABLE }, (payload) => {
      onUpdate?.(payload.new);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
