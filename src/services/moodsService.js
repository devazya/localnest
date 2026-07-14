/**
 * moodsService.js
 * ---------------------------------------------------------------------
 * Data access for the Home page "Mood Cards" section. No component
 * talks to Supabase directly — everything goes through here (and
 * through useMoodSelection, which wraps this for components).
 *
 * PERSISTENCE STATUS (read before changing)
 * fetchMoods() is real — it reads the `moods` table.
 * getSelectedMood()/setSelectedMood() are an INTERIM implementation
 * backed by localStorage, not a `user_selected_mood` table — that
 * table has been proposed (see the comment block at the bottom of this
 * file) but not created, pending sign-off, since it's per-user data.
 * The moment it exists, only the bodies of these two functions change
 * to Supabase reads/writes — callers (useMoodSelection, and anything
 * built on top of it) do not need to change; both functions are
 * already async for exactly this reason.
 */
import { supabase } from './supabase/client';

const SELECTED_MOOD_STORAGE_KEY = 'ln_selected_mood_slug';

/**
 * fetchMoods() -> Promise<Mood[]>
 * Active moods only, in editor-defined display order.
 */
export async function fetchMoods() {
  const { data, error } = await supabase
    .from('moods')
    .select('id, slug, title, subtitle, emoji, icon_url, theme_color, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    emoji: row.emoji,
    iconUrl: row.icon_url || null,
    themeColor: row.theme_color,
  }));
}

/**
 * getSelectedMood() -> Promise<string|null>
 * Returns the selected mood's slug, or null if none selected yet.
 * INTERIM: localStorage only (see file header). Not tied to the
 * signed-in account — clearing site data or switching devices loses
 * the selection until user_selected_mood exists.
 */
export async function getSelectedMood() {
  try {
    return window.localStorage.getItem(SELECTED_MOOD_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * setSelectedMood(slug) -> Promise<void>
 * Pass null to clear the current selection.
 */
export async function setSelectedMood(slug) {
  try {
    if (slug) window.localStorage.setItem(SELECTED_MOOD_STORAGE_KEY, slug);
    else window.localStorage.removeItem(SELECTED_MOOD_STORAGE_KEY);
  } catch {
    // localStorage unavailable (private browsing, etc.) — selection
    // simply won't survive a reload; not fatal.
  }
}

/* ═══════════════════════════════════════════════════════════════════
 * PROPOSED — NOT YET APPLIED. For review before any migration runs.
 * ═══════════════════════════════════════════════════════════════════
 *
 * user_selected_mood (one row per user — current mood only)
 *   user_id      uuid primary key references auth.users(id)
 *   mood_id      uuid references moods(id)
 *   selected_at  timestamptz not null default now()
 *   RLS: owner-only read/write (auth.uid() = user_id)
 *
 * user_mood_history (append-only log, capped per user)
 *   id           uuid primary key default gen_random_uuid()
 *   user_id      uuid references auth.users(id)
 *   mood_id      uuid references moods(id)
 *   selected_at  timestamptz not null default now()
 *   source       text check (source in
 *                  ('manual_selection','friend_ai','quick_action','future_recommendation'))
 *   RLS: owner-only read/write (auth.uid() = user_id)
 *   Retention: keep the most recent 20–50 rows per user; oldest rows
 *   past that cap are deleted. Cheapest implementation is a trigger
 *   (or a scheduled edge function) that runs after insert and deletes
 *   anything beyond the cap for that user_id — not built yet.
 *
 * Neither table is read by any recommendation logic today. Once
 * approved, getSelectedMood/setSelectedMood above swap to querying
 * user_selected_mood, and setSelectedMood additionally inserts one row
 * into user_mood_history per change — no other file in this section
 * needs to change.
 */
