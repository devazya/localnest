/**
 * useActivityCenter.js — Activity Center & Settings (Segment 8)
 * Loads the current user's activity feed, stats, and settings, keeps the
 * feed live via Realtime, and exposes the mutations the UI needs
 * (mark-all-read, settings updates, notification toggles). Mirrors the
 * fetch → realtime → optimistic-mutation shape used by Community.jsx.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchActivities,
  fetchActivityActor,
  fetchUserStats,
  fetchOrCreateUserSettings,
  markAllActivitiesRead,
  updateUserSettings,
  updateNotificationPreference,
  subscribeToActivities,
} from '../services/activity';

export function useActivityCenter(userId) {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unreadCount = activities.filter((a) => !a.is_read).length;

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [activityRows, statsRow, settingsRow] = await Promise.all([
        fetchActivities(userId),
        fetchUserStats(userId),
        fetchOrCreateUserSettings(userId),
      ]);
      setActivities(activityRows);
      setStats(statsRow);
      setSettings(settingsRow);
    } catch (err) {
      console.error('[useActivityCenter] load failed:', err);
      setError(err.message || 'Could not load your activity.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ─ Realtime feed ─
  useEffect(() => {
    if (!userId) return;
    return subscribeToActivities(userId, {
      onInsert: async (row) => {
        const actor = await fetchActivityActor(row.actor_id);
        setActivities((prev) => (prev.some((a) => a.id === row.id) ? prev : [{ ...row, actor }, ...prev]));
      },
      onUpdate: (row) => {
        setActivities((prev) => prev.map((a) => (a.id === row.id ? { ...a, ...row } : a)));
      },
    });
  }, [userId]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const previous = activities;
    setActivities((prev) => prev.map((a) => ({ ...a, is_read: true })));
    try {
      await markAllActivitiesRead(userId);
    } catch (err) {
      console.error('[useActivityCenter] mark all read failed:', err);
      setActivities(previous);
    }
  }, [userId, activities]);

  const patchSettings = useCallback(async (patch) => {
    if (!userId) return;
    const previous = settings;
    setSettings((prev) => ({ ...prev, ...patch }));
    try {
      const saved = await updateUserSettings(userId, patch);
      setSettings(saved);
    } catch (err) {
      console.error('[useActivityCenter] settings update failed:', err);
      setSettings(previous);
    }
  }, [userId, settings]);

  const toggleNotificationPreference = useCallback(async (key, value) => {
    if (!userId) return;
    const previous = settings;
    setSettings((prev) => ({
      ...prev,
      notification_preferences: { ...(prev?.notification_preferences || {}), [key]: value },
    }));
    try {
      const saved = await updateNotificationPreference(userId, settings?.notification_preferences, key, value);
      setSettings(saved);
    } catch (err) {
      console.error('[useActivityCenter] notification preference update failed:', err);
      setSettings(previous);
    }
  }, [userId, settings]);

  return {
    activities, stats, settings, loading, error, unreadCount,
    markAllRead, patchSettings, toggleNotificationPreference, refetch: load,
  };
}
