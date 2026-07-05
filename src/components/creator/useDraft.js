/**
 * useDraft.js — Universal Creator Draft System (Segment 7.1)
 *
 * Lightweight localStorage draft persistence, keyed per post type.
 * Architecture is future-proof — designed to optionally sync with
 * Supabase in Segment 7.2 without any API changes here.
 *
 * Usage:
 *   const { draft, saveDraft, clearDraft, hasDraft } = useDraft('discussion');
 *   // In form onChange: saveDraft({ title, body, category })
 *   // On post success: clearDraft()
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const DRAFT_PREFIX   = 'ln_draft_';
const DRAFT_META_KEY = 'ln_draft_meta';

function safeGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

export function useDraft(typeId) {
  const key = typeId ? `${DRAFT_PREFIX}${typeId}` : null;

  const [draft, setDraft] = useState(() => (key ? safeGet(key) : null));
  const timerRef = useRef(null);

  // Re-read from storage whenever typeId changes (user switches type)
  useEffect(() => {
    setDraft(key ? safeGet(key) : null);
  }, [key]);

  /** Persist immediately */
  const saveDraft = useCallback((data) => {
    if (!key) return;
    const payload = { ...data, _savedAt: new Date().toISOString() };
    safeSet(key, payload);
    setDraft(payload);
    // Keep a meta index so we can show dot indicators
    const meta = safeGet(DRAFT_META_KEY) || {};
    meta[typeId] = payload._savedAt;
    safeSet(DRAFT_META_KEY, meta);
  }, [key, typeId]);

  /** Debounced auto-save — call on every keystroke */
  const autoSave = useCallback((data, delay = 800) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveDraft(data), delay);
  }, [saveDraft]);

  /** Wipe draft after a successful post */
  const clearDraft = useCallback(() => {
    if (!key) return;
    safeRemove(key);
    setDraft(null);
    const meta = safeGet(DRAFT_META_KEY) || {};
    delete meta[typeId];
    safeSet(DRAFT_META_KEY, meta);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [key, typeId]);

  // A draft is meaningful only if it has some actual content
  const hasDraft = !!(
    draft &&
    (draft.title?.trim() || draft.body?.trim() ||
     draft.description?.trim() || draft.content?.trim())
  );

  return { draft, saveDraft, autoSave, clearDraft, hasDraft };
}

/** Returns all typeIds that currently have a saved draft with content */
export function getDraftMeta() {
  return safeGet(DRAFT_META_KEY) || {};
}
