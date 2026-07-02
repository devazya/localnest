/**
 * MentionText.jsx — Social Interaction Layer (Segment 5.3)
 * Renders free text with `@username` tokens turned into tappable
 * MentionChips. Used anywhere a message/post/update body is displayed
 * (General Chat, Discussion Rooms, Neighbourhood Updates).
 */
import { splitMentions } from '../../services/social';
import MentionChip from './MentionChip';

export default function MentionText({ text }) {
  const parts = splitMentions(text || '');
  if (parts.length === 0) return null;
  return (
    <>
      {parts.map((p, i) => p.type === 'mention'
        ? <MentionChip key={i} username={p.value} />
        : <span key={i}>{p.value}</span>)}
    </>
  );
}
