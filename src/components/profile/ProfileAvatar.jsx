/**
 * ProfileAvatar.jsx — Profile UI Premium Polish
 * The "profile circle" frame shared by every resident: real photo (or
 * initials fallback, via the existing Avatar component), a soft gradient
 * ring, a real online indicator (driven by the app-wide presence room —
 * see services/presence.js / hooks/usePresence.js, never a hardcoded
 * green dot), and — for the signed-in resident viewing their own profile
 * — a camera overlay that uploads a real photo to the existing `avatars`
 * Supabase Storage bucket.
 */
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from '../community/Avatar';
import { uploadAvatar } from '../../services/avatar';

export default function ProfileAvatar({ profile, size = 92, online = false, editable = false, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file next time
    if (!file || !profile?.id) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAvatar(profile.id, file);
      onUploaded?.(url);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError(err.message || 'Upload failed — try again');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', padding: 3, boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.35) 100%)',
        boxShadow: '0 10px 26px rgba(0,0,0,0.22)',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
          <Avatar profile={profile} size={size - 6} disablePreview />
        </div>
      </div>

      {online && (
        <div
          title="Online now"
          style={{
            position: 'absolute', bottom: size * 0.03, right: size * 0.03,
            width: size * 0.2, height: size * 0.2, minWidth: 14, minHeight: 14,
            borderRadius: '50%', background: '#22C55E', border: '3px solid #fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.22)',
          }}
        />
      )}

      {editable && (
        <>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
            style={{
              position: 'absolute', bottom: -2, left: -2,
              width: size * 0.32, height: size * 0.32, minWidth: 26, minHeight: 26,
              borderRadius: '50%', background: '#6D4AFF', border: '3px solid #fff', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.7 : 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            }}
          >
            <svg width={Math.max(13, size * 0.15)} height={Math.max(13, size * 0.15)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </motion.button>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </>
      )}

      {error && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8,
          background: '#0D0820', color: '#fff', fontSize: 11, fontWeight: 600, padding: '6px 10px',
          borderRadius: 8, whiteSpace: 'nowrap', zIndex: 20, boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
