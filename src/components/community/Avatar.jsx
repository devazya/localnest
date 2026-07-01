/**
 * Avatar.jsx — Community module
 * Small shared avatar component (initials fallback / image).
 */

import { initials } from './utils';
import { AVATAR_COLORS } from './constants';

export default function Avatar({ profile, size = 40 }) {
  const name  = profile?.full_name || profile?.username || 'User';
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: profile?.avatar_url ? 'transparent' : color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, color: '#fff', overflow: 'hidden',
      fontFamily: 'var(--font-display)',
    }}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </div>
  );
}
