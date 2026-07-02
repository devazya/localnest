/**
 * presence.js — Community module (Segment 2)
 * Real online-member counts via Supabase Realtime Presence.
 *
 * No schema/table changes — presence is purely ephemeral and lives in
 * Supabase Realtime only, so this satisfies "do not create duplicate
 * tables / do not redesign backend architecture" while still giving real,
 * non-mock online counts for Neighbourhood Chat and Discussion Rooms.
 *
 * Dedup rule: a presence "key" is fixed per Realtime channel connection.
 * To make "one authenticated account = one online member" hold true across
 * browser tabs/browsers, every tab that *tracks* itself in a room must open
 * its channel with `presence.key` set to the user's id — Realtime then
 * merges all connections sharing that key into a single presence entry.
 * As a second line of defence we also dedup the synced state by the
 * `user_id` carried in the tracked payload itself, so the count is always
 * unique authenticated users, never raw tab/socket connections.
 *
 * A small in-page registry (per browser tab) avoids opening more than one
 * socket per room when both a "preview" (watch-only) and an "open room"
 * (watch + track) consumer are mounted at once.
 */
import { supabase } from './supabase/client';

const registry = new Map(); // roomKey -> entry

function topic(roomKey) {
  return `presence:${roomKey}`;
}

function buildChannel(roomKey, key) {
  return supabase.channel(topic(roomKey), {
    config: { presence: { key: key || undefined } },
  });
}

function attach(entry, roomKey) {
  const notify = () => {
    const state = entry.channel.presenceState();
    // Dedup by user_id (the tracked payload), not just by presence key —
    // this is the authoritative "one authenticated account = one online
    // member" rule, independent of how many sockets/tabs/browsers a user
    // has open.
    const seen = new Set();
    Object.values(state).forEach((metas) => {
      (metas || []).forEach((m) => { if (m?.user_id) seen.add(m.user_id); });
    });
    const count = seen.size > 0 ? seen.size : Object.keys(state).length;
    // Pass (count, members[]) — listeners that only accept count still work
    // because extra arguments are silently ignored in JavaScript.
    const members = Array.from(seen);
    entry.listeners.forEach((fn) => fn(count, members));
  };

  entry.channel
    .on('presence', { event: 'sync' }, notify)
    .on('presence', { event: 'join' }, notify)
    .on('presence', { event: 'leave' }, notify)
    .subscribe((status) => {
      entry.subscribed = status === 'SUBSCRIBED';
      if (entry.subscribed) {
        // Re-track on every (re)subscribe — this fires on first connect
        // AND on automatic reconnect after a dropped/restored connection
        // or a page refresh, so presence is restored correctly with no
        // extra wiring and no duplicate users.
        if (entry.trackedUserId) {
          entry.channel.track({ user_id: entry.trackedUserId, online_at: new Date().toISOString() });
        }
        notify();
      }
    });

  registry.set(roomKey, entry);
}

function teardown(roomKey, entry) {
  registry.delete(roomKey);
  supabase.removeChannel(entry.channel);
}

function rebuildWithKey(roomKey, entry, newKey) {
  supabase.removeChannel(entry.channel);
  const rebuilt = {
    channel: buildChannel(roomKey, newKey),
    listeners: entry.listeners,
    refCount: entry.refCount,
    trackedUserId: newKey,
    subscribed: false,
    presenceKey: newKey,
  };
  attach(rebuilt, roomKey);
  return rebuilt;
}

function getOrCreateEntry(roomKey, preferredKey) {
  let entry = registry.get(roomKey);
  if (entry) return entry;
  entry = {
    channel: buildChannel(roomKey, preferredKey),
    listeners: new Set(),
    refCount: 0,
    trackedUserId: preferredKey || null,
    subscribed: false,
    presenceKey: preferredKey || null,
  };
  attach(entry, roomKey);
  return entry;
}

/**
 * Watch a room's live online count without counting yourself as present.
 * Use for previews/lists (e.g. a Discussion card before it's been opened).
 * @returns {() => void} unsubscribe
 */
export function watchPresenceCount(roomKey, onCount) {
  if (!roomKey) return () => {};
  const entry = getOrCreateEntry(roomKey, null);
  entry.refCount += 1;
  entry.listeners.add(onCount);
  onCount(Object.keys(entry.channel.presenceState()).length);

  return () => {
    const current = registry.get(roomKey);
    if (!current) return;
    current.listeners.delete(onCount);
    current.refCount -= 1;
    if (current.refCount <= 0) teardown(roomKey, current);
  };
}

/**
 * Mark an authenticated user as actively present in a room (e.g. they
 * opened Neighbourhood Chat, or are inside a Discussion Room). Increments
 * the real online count; the returned function decrements it again
 * (covers leaving the room, navigating away, and component unmount).
 * @returns {() => void} leave
 */
export function joinPresence(roomKey, userId) {
  if (!roomKey || !userId) return () => {};
  let entry = registry.get(roomKey);
  if (!entry) {
    entry = getOrCreateEntry(roomKey, userId);
  } else if (entry.presenceKey !== userId) {
    entry = rebuildWithKey(roomKey, entry, userId);
  } else {
    entry.trackedUserId = userId;
    if (entry.subscribed) entry.channel.track({ user_id: userId, online_at: new Date().toISOString() });
  }
  entry.refCount += 1;

  return () => {
    const current = registry.get(roomKey);
    if (!current) return;
    current.channel.untrack();
    current.refCount -= 1;
    if (current.refCount <= 0) teardown(roomKey, current);
  };
}
