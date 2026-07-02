/**
 * usePresence.js — LocalNest Realtime Presence Layer
 *
 * ONE implementation of presence for the entire app.
 * Every live feature (Neighbourhood Chat, Discussion Rooms, Sports Live,
 * Event Rooms, Marketplace Rooms, any future realtime feature) consumes
 * this hook — no duplicate presence logic should exist anywhere else.
 *
 * Built on top of services/presence.js (Supabase Realtime Presence engine).
 * UI components only consume the values returned here; they never touch
 * Supabase Presence APIs directly.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PRIMARY HOOK — usePresence(roomKey, options)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * @param {string|null} roomKey
 *   Unique room identifier. Examples:
 *     'neighbourhood'          → Neighbourhood Chat
 *     `discussion:${id}`       → Discussion Room
 *     `sports:${matchId}`      → Sports Live Room
 *     `event:${eventId}`       → Event Discussion
 *     `ride:${rideId}`         → Ride Discussion
 *
 * @param {object} [options]
 * @param {string}  [options.userId]   Authenticated user id (if signed in).
 * @param {boolean} [options.active]   Pass `true` while the user is actively
 *   INSIDE a room (the component is mounted and visible). The user is then
 *   counted as online. Pass `false` (or omit) for watch-only/preview mode —
 *   the count is observed without adding the current user to it.
 *
 * @returns {{ onlineCount, isConnected, roomMembers, loading, joinRoom, leaveRoom }}
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SECONDARY HOOK — usePresenceCounts(roomKeys)
 * ─────────────────────────────────────────────────────────────────────────
 * Watch-only batch watcher for multiple rooms simultaneously.
 * Use when you need counts for a list of cards (e.g. all Discussion cards)
 * without joining any of them.
 *
 * @param {string[]} roomKeys
 * @returns {Record<string, number>} roomKey → count
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BACKWARDS-COMPATIBLE ALIAS — usePresenceCount(roomKey, userId, active)
 * ─────────────────────────────────────────────────────────────────────────
 * Kept so existing call sites in Community.jsx and DiscussionRoom.jsx
 * continue to work without changes. Prefer usePresence() for new code.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { watchPresenceCount, joinPresence } from '../services/presence';

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: usePresence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Primary presence hook — covers every live room in the app.
 *
 * Usage:
 *   const { onlineCount } = usePresence('neighbourhood')
 *   const { onlineCount, isConnected } = usePresence(discussion.id, { userId: user?.id, active: true })
 *   const { onlineCount, joinRoom, leaveRoom } = usePresence(sportsRoom.id)
 */
export function usePresence(roomKey, options = {}) {
  const { userId = null, active = false } = options;

  const [onlineCount,  setOnlineCount]  = useState(0);
  const [isConnected,  setIsConnected]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  // roomMembers: array of unique user_id strings currently online (derived
  // from presence state). Useful for rendering member avatars etc.
  const [roomMembers,  setRoomMembers]  = useState([]);

  // Internal: whether the user has explicitly joined via joinRoom().
  // We also support the declarative `active` option so the caller doesn't
  // have to call joinRoom() imperatively — both paths are equivalent.
  const joinedRef = useRef(false);
  const leaveRef  = useRef(null);  // cleanup fn returned by joinPresence()

  // ── Watch the room's live count ──────────────────────────────────────────
  useEffect(() => {
    if (!roomKey) {
      setOnlineCount(0);
      setIsConnected(false);
      setRoomMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const unwatch = watchPresenceCount(roomKey, (count, members) => {
      setOnlineCount(count);
      setRoomMembers(Array.isArray(members) ? members : []);
      setIsConnected(true);
      setLoading(false);
    });

    // Mark connected once subscription is set up (even before first sync)
    setIsConnected(true);

    return () => {
      unwatch();
      setIsConnected(false);
    };
  }, [roomKey]);

  // ── Declarative join: track self when `active` is true ───────────────────
  useEffect(() => {
    if (!roomKey || !userId || !active) return undefined;

    const leave = joinPresence(roomKey, userId);
    leaveRef.current = leave;
    joinedRef.current = true;

    const handleUnload = () => leave();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      leave();
      leaveRef.current = null;
      joinedRef.current = false;
    };
  }, [roomKey, userId, active]);

  // ── Imperative API: joinRoom / leaveRoom ─────────────────────────────────
  // Use these when you need to programmatically join/leave a room instead of
  // relying on the `active` option (e.g. user presses a "Join" button).

  const joinRoom = useCallback(() => {
    if (!roomKey || !userId || joinedRef.current) return;
    const leave = joinPresence(roomKey, userId);
    leaveRef.current = leave;
    joinedRef.current = true;

    const handleUnload = () => leave();
    window.addEventListener('beforeunload', handleUnload);
    // Store cleanup on the ref so leaveRoom() can remove the listener too
    leaveRef._unload = handleUnload;
  }, [roomKey, userId]);

  const leaveRoom = useCallback(() => {
    if (!joinedRef.current || !leaveRef.current) return;
    if (leaveRef._unload) window.removeEventListener('beforeunload', leaveRef._unload);
    leaveRef.current();
    leaveRef.current = null;
    joinedRef.current = false;
  }, []);

  return {
    /** Number of unique authenticated users currently online in this room. */
    onlineCount,
    /** True once the Supabase Realtime channel is subscribed. */
    isConnected,
    /** True while the first presence sync is still pending. */
    loading,
    /** Array of user_id strings online in this room. */
    roomMembers,
    /** Imperatively join the room (alternative to the `active` option). */
    joinRoom,
    /** Imperatively leave the room. */
    leaveRoom,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECONDARY: usePresenceCounts — batch watch-only for lists of rooms
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Efficiently watch live counts for many rooms at once.
 * Used by Discussion card lists, Explore pages, etc.
 * Watch-only — does NOT count the current user as present in any room.
 *
 * @param {string[]} roomKeys
 * @returns {Record<string, number>} roomKey → onlineCount
 *
 * Example:
 *   const discussionKeys = discussions.map(d => `discussion:${d.id}`);
 *   const counts = usePresenceCounts(discussionKeys);
 *   const count = counts[`discussion:${discussion.id}`] ?? 0;
 */
export function usePresenceCounts(roomKeys) {
  const [counts, setCounts] = useState({});
  // Stable string signature avoids effect re-running on every render
  // when the caller derives the array inline.
  const keysSignature = roomKeys.join('|');

  useEffect(() => {
    if (roomKeys.length === 0) return;
    const unwatches = roomKeys.map((key) =>
      watchPresenceCount(key, (n) =>
        setCounts((prev) => (prev[key] === n ? prev : { ...prev, [key]: n }))
      )
    );
    return () => unwatches.forEach((fn) => fn());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature]);

  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARDS-COMPATIBLE ALIAS — keeps existing call sites working
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Prefer `usePresence(roomKey, { userId, active })` for new code.
 * Kept for backwards compatibility — Community.jsx and DiscussionRoom.jsx
 * still call this and will continue to work without changes.
 */
export function usePresenceCount(roomKey, userId, active) {
  const { onlineCount } = usePresence(roomKey, { userId, active });
  return onlineCount;
}
