/**
 * Avatar.jsx — Community module
 * Small shared avatar component (initials fallback / image).
 */

import { initials } from './utils';
import { AVATAR_COLORS } from './constants';
import { useProfilePreview } from '../../context/ProfilePreviewContext';

/**
 * Avatar — now doubles as the app-wide "click avatar → Profile Preview
 * Bottom Sheet" entry point (Segment 5.1). Every existing call site keeps
 * working unchanged; pass disablePreview to opt a specific avatar out
 * (e.g. inside the sheet/header itself, to avoid opening on top of itself).
 */
export default function Avatar({ profile, size = 40, disablePreview = false, onClick }) {
  const name  = profile?.full_name || profile?.username || 'User';
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const preview = useProfilePreview();

  const clickable = !disablePreview && !!profile?.id && (!!onClick || !!preview);
  const handleClick = (e) => {
    if (!clickable) return;
    e.stopPropagation();
    if (onClick) onClick(e);
    else preview?.open(profile.id);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: profile?.avatar_url ? 'transparent' : color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: size * 0.38, color: '#fff', overflow: 'hidden',
        fontFamily: 'var(--font-display)', cursor: clickable ? 'pointer' : 'default',
      }}
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </div>
  );
}
