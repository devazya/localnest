/**
 * MentionChip.jsx — Social Interaction Layer (Segment 5.3)
 * Renders a single `@username` token inside chat/discussion/update text.
 * Tapping opens the Profile Preview Bottom Sheet via the shared context —
 * same "click avatar" entry point every other mention-to-profile flow uses.
 */
import { useProfilePreview } from '../../context/ProfilePreviewContext';
import { fetchProfileByUsername } from '../../services/social';

export default function MentionChip({ username }) {
  const preview = useProfilePreview();

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!preview) return;
    const profile = await fetchProfileByUsername(username);
    if (profile) preview.open(profile.id);
  };

  return (
    <span
      onClick={handleClick}
      style={{
        color: '#6D4AFF', fontWeight: 700, cursor: 'pointer',
        background: '#F3F0FF', borderRadius: 6, padding: '0 4px',
      }}
    >
      @{username}
    </span>
  );
}
