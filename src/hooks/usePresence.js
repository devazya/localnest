/**
 * usePresence.js — Community module (Segment 2)
 * React bindings around services/presence.js (Supabase Realtime Presence).
 */
import { useEffect, useState } from 'react';
import { watchPresenceCount, joinPresence } from '../services/presence';

/**
 * usePresenceCount — live online-member count for a single room.
 *
 * @param {string|null} roomKey   e.g. 'general' or `discussion:${id}`
 * @param {string|undefined} userId  the signed-in user's id, if any
 * @param {boolean} active  pass true only while the current user should
 *   themselves be counted as present (e.g. Neighbourhood Chat is actually
 *   open, or a Discussion Room is mounted). Viewers seeing just a preview
 *   count (cards in a list) should pass `false` — they observe the count
 *   without joining it.
 */
export function usePresenceCount(roomKey, userId, active) {
  const [count, setCount] = useState(0);

  // Observe the room's live count.
  useEffect(() => {
    if (!roomKey) { setCount(0); return; }
    return watchPresenceCount(roomKey, setCount);
  }, [roomKey]);

  // Track self as present only while `active`. Cleanup runs on unmount,
  // on roomKey/userId change, and whenever `active` flips back to false —
  // i.e. leaving the room, switching rooms, or signing out all decrement
  // the count automatically.
  useEffect(() => {
    if (!roomKey || !userId || !active) return undefined;
    const leave = joinPresence(roomKey, userId);
    const handleUnload = () => leave();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      leave();
    };
  }, [roomKey, userId, active]);

  return count;
}

/**
 * usePresenceCounts — live online-member counts for several rooms at once
 * (e.g. every Discussion card shown in the Active Discussions list).
 * Watch-only — does not track the current user as present in any of them.
 *
 * @param {string[]} roomKeys
 * @returns {Record<string, number>} roomKey -> count
 */
export function usePresenceCounts(roomKeys) {
  const [counts, setCounts] = useState({});
  const keysSignature = roomKeys.join('|');

  useEffect(() => {
    const unwatches = roomKeys.map((key) =>
      watchPresenceCount(key, (n) => setCounts((prev) => (prev[key] === n ? prev : { ...prev, [key]: n })))
    );
    return () => unwatches.forEach((fn) => fn());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature]);

  return counts;
}
