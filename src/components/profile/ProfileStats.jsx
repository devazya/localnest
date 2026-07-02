/**
 * ProfileStats.jsx — Social Identity & Follow System (Segment 5.1)
 * Followers / Following counts. Purely presentational — count state and
 * realtime wiring live in the parent (ProfileHeader / ProfilePreviewSheet)
 * so both places share the same live counts without duplicating sockets.
 */
import AnimatedNumber from '../community/AnimatedNumber';

export default function ProfileStats({ followers = 0, following = 0, contributions, onFollowersClick, onFollowingClick, align = 'left', light = false }) {
  const numColor   = light ? '#fff' : '#0D0820';
  const labelColor = light ? 'rgba(255,255,255,0.75)' : '#9CA3AF';

  const Stat = ({ n, label, onClick }) => (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        display: 'flex', alignItems: 'baseline', gap: 5, background: 'none', border: 'none',
        cursor: onClick ? 'pointer' : 'default', padding: 0,
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: numColor }}>
        <AnimatedNumber value={n} />
      </span>
      <span style={{ fontSize: 12.5, color: labelColor, fontWeight: 500 }}>{label}</span>
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: 18, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
      {contributions !== undefined && <Stat n={contributions} label="Contributions" />}
      <Stat n={followers} label="Followers" onClick={onFollowersClick} />
      <Stat n={following} label="Following" onClick={onFollowingClick} />
    </div>
  );
}
