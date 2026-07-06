/**
 * hashtags.js — Hashtag parsing utility (Segment 7.2)
 *
 * Pure functions. No Supabase calls. No new tables.
 * Hashtags are extracted from content and saved into the existing
 * `metadata.hashtags` field on community_posts / discussions.
 *
 * Usage:
 *   const tags = parseHashtags('Looking for #badminton players near #spicegarden');
 *   // → ['badminton', 'spicegarden']
 *
 *   const display = formatHashtag('badminton'); // → '#badminton'
 */

/** Matches #word (letters, digits, underscore) of length 2–32. */
export const HASHTAG_REGEX = /#([a-zA-Z0-9_]{2,32})/g;

/**
 * Extract all unique lowercase hashtags from a string.
 * Returns an array of tag strings without the # prefix.
 */
export function parseHashtags(text) {
  if (!text) return [];
  const tags = new Set();
  let match;
  const re = new RegExp(HASHTAG_REGEX);
  while ((match = re.exec(text)) !== null) {
    tags.add(match[1].toLowerCase());
  }
  return Array.from(tags);
}

/** Prepend # for display. */
export function formatHashtag(tag) {
  return `#${tag}`;
}

/**
 * Merge hashtags parsed from title + body into an existing metadata object.
 * Returns a new metadata object — does NOT mutate the original.
 *
 * Usage inside a composer submit handler:
 *   const metadata = mergeHashtagsIntoMeta(fields, title, body);
 *   // Pass metadata to the Supabase insert.
 */
export function mergeHashtagsIntoMeta(existingMeta, ...textFields) {
  const combined = textFields.join(' ');
  const hashtags = parseHashtags(combined);
  if (hashtags.length === 0) return existingMeta || {};
  return { ...(existingMeta || {}), hashtags };
}
