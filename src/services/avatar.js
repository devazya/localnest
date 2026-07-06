/**
 * avatar.js — Profile photo uploads.
 * Uses the existing `avatars` Supabase Storage bucket (public read,
 * upload/update restricted by RLS to the owning user's own folder —
 * already provisioned, not created by this change).
 */
import { supabase } from './supabase/client';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadAvatar(userId, file) {
  if (!userId || !file) throw new Error('Missing user or file');
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG, WEBP or GIF image.');
  if (file.size > MAX_BYTES) throw new Error('Image must be smaller than 5MB.');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Cache-bust so the new photo shows immediately instead of the browser's
  // cached copy of the previous file at the same path.
  return `${data.publicUrl}?v=${Date.now()}`;
}
