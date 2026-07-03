/**
 * ProfileAvatar.jsx — Universal avatar frame (Profile UI Premium Polish)
 *
 * Every resident's profile photo is rendered inside the same "profile
 * circle" frame asset — the frame itself never changes, only the photo
 * (or initials fallback) inside it. This is now the single reusable
 * avatar for the Profile page hero.
 *
 * - IF profile.avatar_url exists  -> show the photo, clipped to the circle
 * - ELSE                          -> show initials on a soft gradient, same frame
 * - Online dot only renders when the resident is actually online (real
 *   presence via usePresence — never a hardcoded green dot)
 * - Camera button (own profile only) uploads a new photo to Supabase
 *   Storage (`avatars` bucket) and updates profiles.avatar_url
 */
import { useRef, useState } from 'react';
import profileCircle from '../../assets/images/profile circle.png';
import { initials } from '../community/utils';
import { AVATAR_COLORS } from '../community/constants';
import { supabase } from '../../services/supabase/client';

export default function ProfileAvatar({
  profile,
  size = 108,
  online = false,
  editable = false,
  onUploaded,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!profile) return null;

  const name  = profile.full_name || profile.username || 'Resident';
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !profile?.id) return;
    setUploading(true);
    setError(null);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatar_url = pub?.publicUrl;
      if (avatar_url) {
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ avatar_url })
          .eq('id', profile.id);
        if (updErr) throw updErr;
        onUploaded?.(avatar_url);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Frame art is drawn slightly larger than the photo so the decorative
  // ring/border in the asset stays visible around the clipped photo.
  const photoInset = Math.round(size * 0.09);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Universal frame — same asset for every resident */}
      <img
        src={profileCircle}
        alt=""
        draggable={false}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', pointerEvents: 'none', userSelect: 'none',
          filter: 'drop-shadow(0 10px 20px rgba(20,8,60,0.28))',
        }}
      />

      {/* Photo / initials clipped inside the frame */}
      <div
        style={{
          position: 'absolute', top: photoInset, left: photoInset,
          right: photoInset, bottom: photoInset, borderRadius: '50%',
          overflow: 'hidden', background: profile.avatar_url ? '#EDE9FE' : color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: size * 0.34, color: '#fff',
          }}>
            {initials(name)}
          </span>
        )}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(13,8,32,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
              animation: 'lnAvatarSpin 0.8s linear infinite',
            }} />
            <style>{'@keyframes lnAvatarSpin{to{transform:rotate(360deg)}}'}</style>
          </div>
        )}
      </div>

      {/* Real online indicator only — never a permanent dot */}
      {online && (
        <span style={{
          position: 'absolute', right: size * 0.06, top: size * 0.06,
          width: size * 0.16, height: size * 0.16, minWidth: 12, minHeight: 12,
          borderRadius: '50%', background: '#22C55E', border: '2.5px solid #fff',
          boxShadow: '0 0 0 1px rgba(34,197,94,0.25)',
        }} />
      )}

      {/* Camera button — own profile only, edits the photo inside the frame */}
      {editable && (
        <>
          <button
            onClick={handlePick}
            disabled={uploading}
            aria-label="Change profile photo"
            style={{
              position: 'absolute', right: -2, bottom: -2,
              width: 32, height: 32, borderRadius: '50%',
              background: '#6D4AFF', border: '2.5px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'default' : 'pointer',
              boxShadow: '0 6px 14px rgba(76,29,149,0.4)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </>
      )}

      {error && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          marginTop: 6, fontSize: 10.5, color: '#EF4444', whiteSpace: 'nowrap', fontWeight: 600,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
