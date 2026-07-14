/**
 * userEvents.js
 * ---------------------------------------------------------------------
 * Phase 0 minimum-viable behaviour layer — see the LocalNest Phase 0
 * brief. ONE function. No hook, no context, no batching, no retry
 * queue — those are Phase 3 concerns, not this one.
 *
 * Every section that wants to log a behavioural event calls logEvent()
 * directly. No component talks to the user_events table itself.
 */
import { supabase } from './supabase/client';

const SESSION_ID_STORAGE_KEY = 'ln_session_id';

/**
 * getOrCreateSessionId() -> string
 * One random id per tab session, persisted in sessionStorage so every
 * logEvent() call within the same tab reuses it.
 */
function getOrCreateSessionId() {
  try {
    let id = window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — fall back
    // to a per-call id; session reconstruction just won't span calls.
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * logEvent({ eventName, screen, module, objectType, objectId, metadata })
 * -> Promise<void>
 *
 * Fires and forgets — a failed analytics write must never break or
 * visibly affect the user's experience, so errors are only logged to
 * the console, never thrown.
 */
export async function logEvent({
  eventName,
  screen,
  module,
  objectType = null,
  objectId = null,
  metadata = {},
}) {
  try {
    const { data: { session } = {} } = await supabase.auth.getSession();

    const { error } = await supabase.from('user_events').insert({
      event_name: eventName,
      user_id: session?.user?.id || null,
      session_id: getOrCreateSessionId(),
      screen,
      module,
      object_type: objectType,
      object_id: objectId,
      metadata,
    });

    if (error) throw error;
  } catch (err) {
    console.error('[userEvents] failed to log event:', eventName, err);
  }
}
