/**
 * discussionMessages.js — Community module (Discussion Room persistence)
 *
 * Root-cause fix: Discussion Room messages were previously 100% client-side
 * (see the old comment in services/discussions.js — "the Discussion Room
 * itself keeps its message list local/ephemeral"). Nothing was ever written
 * to Supabase, so every message vanished on refresh.
 *
 * This backs each Discussion Room with a row in the existing generic
 * `conversations` / `conversation_members` / `messages` tables (already
 * provisioned with RLS, previously unused — 0 rows), using:
 *   conversations.context_type = 'community'
 *   conversations.context_id   = discussions.id
 *
 * No new table was created. A partial unique index on
 * conversations(context_id) WHERE context_type = 'community' guarantees a
 * single shared conversation per discussion room, even if two people open
 * a brand-new room at the same instant.
 *
 * Note: messages.sender_id references auth.users (not public.profiles), so
 * PostgREST cannot embed `profiles:sender_id(...)` directly — profile data
 * is joined manually in JS instead.
 */
import { supabase } from './supabase/client';

const PROFILE_COLS = 'id,full_name,username,avatar_url';

/**
 * Get the conversation backing a discussion room, creating it (and adding
 * the current user as its first member) if it doesn't exist yet.
 * Race-safe: if two clients try to create the same room's conversation at
 * once, the unique index rejects the loser's insert (Postgres 23505) and
 * we simply re-select the row the winner created.
 */
export async function getOrCreateDiscussionConversation(discussionId, userId) {
  const { data: existing, error: findErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('context_type', 'community')
    .eq('context_id', discussionId)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing.id;

  const { data: created, error: createErr } = await supabase
    .from('conversations')
    .insert({ context_type: 'community', context_id: discussionId, created_by: userId })
    .select('id')
    .single();

  if (createErr) {
    if (createErr.code === '23505') {
      const { data: nowExisting, error: reselectErr } = await supabase
        .from('conversations')
        .select('id')
        .eq('context_type', 'community')
        .eq('context_id', discussionId)
        .single();
      if (reselectErr) throw reselectErr;
      return nowExisting.id;
    }
    throw createErr;
  }

  const { error: memberErr } = await supabase
    .from('conversation_members')
    .insert({ conversation_id: created.id, user_id: userId });
  if (memberErr) throw memberErr;

  return created.id;
}

/**
 * Make sure the current user is a member of the conversation. Required by
 * RLS to read/send — idempotent, safe to call every time a room is opened.
 */
export async function ensureConversationMembership(conversationId, userId) {
  const { error } = await supabase
    .from('conversation_members')
    .upsert(
      { conversation_id: conversationId, user_id: userId },
      { onConflict: 'conversation_id,user_id', ignoreDuplicates: true }
    );
  if (error) throw error;
}

/** Attach `profiles` (full_name/username/avatar_url) to a list of message rows. */
async function hydrateProfiles(rows) {
  const ids = [...new Set(rows.map(r => r.sender_id))];
  if (ids.length === 0) return rows;
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLS).in('id', ids);
  if (error) throw error;
  const byId = {};
  (data || []).forEach(p => { byId[p.id] = p; });
  return rows.map(r => ({ ...r, profiles: byId[r.sender_id] || null }));
}

const MESSAGE_COLS = 'id,conversation_id,sender_id,message,created_at,edited_at,deleted_at';

/** Fetch every message in a conversation, oldest → newest, with reactions. */
export async function fetchDiscussionMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_COLS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const hydrated = await hydrateProfiles(data || []);
  return attachReactions(hydrated);
}

/** Attach a `reactions` map ({ emoji: [userId,...] }) to each message row. */
async function attachReactions(rows) {
  if (rows.length === 0) return rows;
  const ids = rows.map(r => r.id);
  const { data, error } = await supabase
    .from('message_reactions')
    .select('message_id,user_id,emoji')
    .in('message_id', ids);
  if (error) throw error;
  const byMessage = {};
  (data || []).forEach(r => {
    (byMessage[r.message_id] ||= {});
    (byMessage[r.message_id][r.emoji] ||= []).push(r.user_id);
  });
  return rows.map(r => ({ ...r, reactions: byMessage[r.id] || {} }));
}

/** Send a message into the conversation. Returns the row with profile attached. */
export async function sendDiscussionMessage(conversationId, userId, text) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: userId, message: text })
    .select(MESSAGE_COLS)
    .single();
  if (error) throw error;
  const [hydrated] = await hydrateProfiles([data]);
  return { ...hydrated, reactions: {} };
}

/** Edit window: 15 minutes from creation, matching the server-independent
 *  client-side check used to hide/show the Edit action. */
export const EDIT_WINDOW_MS = 15 * 60 * 1000;
export function canEditMessage(msg) {
  return Date.now() - new Date(msg.created_at).getTime() < EDIT_WINDOW_MS;
}

/** Edit a message's text (only the sender can, only inside the edit window
 * — enforced client-side here and backstopped by the existing "sender can
 * update own" RLS policy). Sets edited_at so "Edited" persists after refresh. */
export async function editDiscussionMessage(messageId, userId, newText) {
  const { data, error } = await supabase
    .from('messages')
    .update({ message: newText, edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', userId)
    .select(MESSAGE_COLS)
    .single();
  if (error) throw error;
  return data;
}

/** Delete-for-everyone: soft delete. Row stays (so realtime UPDATE fires
 * for every viewer, syncing the deletion instantly) but content is wiped. */
export async function deleteDiscussionMessage(messageId, userId) {
  const { data, error } = await supabase
    .from('messages')
    .update({ message: '', deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', userId)
    .select(MESSAGE_COLS)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Instagram-style reaction: one reaction per user per message. Tapping the
 * same emoji again removes it; tapping a different emoji swaps it.
 * Returns the new emoji, or null if the reaction was removed.
 */
export async function toggleDiscussionReaction(messageId, userId, emoji) {
  const { data: existing, error: findErr } = await supabase
    .from('message_reactions')
    .select('id,emoji')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing && existing.emoji === emoji) {
    const { error } = await supabase.from('message_reactions').delete().eq('id', existing.id);
    if (error) throw error;
    return null;
  }
  if (existing) {
    const { error } = await supabase.from('message_reactions').update({ emoji }).eq('id', existing.id);
    if (error) throw error;
    return emoji;
  }
  const { error } = await supabase.from('message_reactions').insert({ message_id: messageId, user_id: userId, emoji });
  if (error) throw error;
  return emoji;
}

/**
 * Realtime: new messages (INSERT), edits/deletes (UPDATE — deletes are a
 * soft-delete update, so they arrive on the same stream and sync instantly
 * for every viewer), for this conversation. Raw payloads, no join — the
 * caller hydrates the profile if needed.
 */
export function subscribeToDiscussionMessages(conversationId, { onInsert, onUpdate } = {}) {
  const channel = supabase
    .channel(`discussion-messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onUpdate?.(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/**
 * Realtime: reaction changes for every message in this conversation.
 * Filtering by conversation isn't possible directly on message_reactions
 * (no conversation_id column there), so the caller passes the set of
 * message ids it currently has rendered and we filter client-side.
 */
export function subscribeToDiscussionReactions(conversationId, onChange) {
  const channel = supabase
    .channel(`discussion-reactions:${conversationId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_reactions' },
      (payload) => onChange?.(payload)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/** Fetch a single profile — used to hydrate a realtime message from someone else. */
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLS).eq('id', userId).single();
  if (error) throw error;
  return data;
}
