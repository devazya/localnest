/**
 * CommunityComposer.jsx — Community module
 * The General-channel / Discussion Room chat composer: text input, send
 * button, and (Segment 5.3) @mention support — typing `@` opens
 * MentionAutocomplete above the input; selecting a suggestion inserts
 * `@username `. Controlled component — text state lives in the parent
 * since it needs to coordinate with realtime message submission.
 */
import { useRef, useState } from 'react';
import MentionAutocomplete from './MentionAutocomplete';
import { getActiveMentionQuery, insertMention } from '../../services/social';

export default function CommunityComposer({ user, text, setText, onSubmit, submitting }) {
  const inputRef = useRef(null);
  const [mentionQuery, setMentionQuery] = useState(null);

  if (!user) {
    return <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', padding: '10px 0' }}>Sign in to chat</div>;
  }

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    const cursor = e.target.selectionStart ?? value.length;
    setMentionQuery(getActiveMentionQuery(value, cursor));
  };

  const handleSelectMention = (username) => {
    const cursor = inputRef.current?.selectionStart ?? text.length;
    const next = insertMention(text, cursor, username);
    setText(next);
    setMentionQuery(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSubmit = () => {
    setMentionQuery(null);
    onSubmit();
  };

  return (
    <div>
      <MentionAutocomplete query={mentionQuery} excludeId={user.id} onSelect={handleSelectMention} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F8F7FF', border: '1.5px solid #EDE9FF', borderRadius: 16, padding: '9px 14px' }}>
        <input
          ref={inputRef}
          value={text}
          onChange={handleChange}
          placeholder="Message #General — try @name"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !mentionQuery) handleSubmit();
            if (e.key === 'Escape') setMentionQuery(null);
          }}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#0D0820', fontFamily: 'inherit' }}
        />
        <button onClick={handleSubmit} disabled={submitting || !text.trim()} style={{ background: 'none', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? '#6D4AFF' : '#D1D5DB'} strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
        </button>
      </div>
    </div>
  );
}
