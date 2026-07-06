/**
 * Avatar.jsx — Community module
 * Small shared avatar component (initials fallback / image).
 *
 * Always shows YOUR current profile photo, even inside old/cached data
 * (e.g. a chat message fetched before you changed your picture): if the
 * avatar being rendered belongs to the signed-in user, it's overridden
 * with the live profile from AuthContext instead of trusting whatever
 * avatar_url snapshot was joined onto that row when it was fetched.
 */

import { initials } from './utils';
import { AVATAR_COLORS } from './constants';
import { useProfilePreview } from '../../context/ProfilePreviewContext';
import { useAuth } from '../../context/AuthContext';

export default function Avatar({ profile, size = 40, disablePreview = false, onClick }) {
  const preview = useProfilePreview();
  const { user, profile: myProfile } = useAuth();

  // If this avatar belongs to the signed-in user, always prefer the live
  // AuthContext profile (kept fresh everywhere the moment the photo
  // changes) over whatever stale copy was passed in.
  const isMe = !!profile?.id && !!user?.id && profile.id === user.id;
  const effective = isMe && myProfile ? { ...profile, ...myProfile } : profile;

  const name  = effective?.full_name || effective?.username || 'User';
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const clickable = !disablePreview && !!effective?.id && (!!onClick || !!preview);
  const handleClick = (e) => {
    if (!clickable) return;
    e.stopPropagation();
    if (onClick) onClick(e);
    else preview?.open(effective.id);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: effective?.avatar_url ? 'transparent' : color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: size * 0.38, color: '#fff', overflow: 'hidden',
        fontFamily: 'var(--font-display)', cursor: clickable ? 'pointer' : 'default',
      }}
    >
      {effective?.avatar_url
        ? <img src={effective.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </div>
  );
}
