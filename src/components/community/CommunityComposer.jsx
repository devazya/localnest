/**
 * CommunityComposer.jsx — Community module
 * The General-channel / Discussion Room chat composer: text input, send
 * button, and @mention support — typing `@` opens MentionAutocomplete
 * above the input; selecting a suggestion inserts `@username `.
 * Controlled component — text state lives in the parent since it needs
 * to coordinate with realtime message submission.
 *
 * Premium Redesign:
 * - Floating glass pill, never flush to any edge — large radius, soft
 *   translucent border, layered shadow (iMessage-quality lift).
 * - Send button morphs into a filled, glowing circle the moment there's
 *   text to send, with a gentle scale-in.
 */
import { useRef, useState } from 'react';
import MentionAutocomplete from './MentionAutocomplete';
import { getActiveMentionQuery, insertMention } from '../../services/social';

export default function CommunityComposer({ user, text, setText, onSubmit, submitting, accent = '#6D4AFF' }) {
  const inputRef = useRef(null);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [focused, setFocused] = useState(false);

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

  const hasText = !!text.trim();

  return (
    <div style={{ padding: '2px 2px 0' }}>
      <MentionAutocomplete query={mentionQuery} excludeId={user.id} onSelect={handleSelectMention} />
      <div
        style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,249,255,0.85))',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: `1.5px solid ${focused ? `${accent}33` : 'rgba(255,255,255,0.7)'}`,
          borderRadius: 24, padding: '11px 8px 11px 18px',
          boxShadow: focused
            ? `0 10px 28px -8px ${accent}30, 0 2px 8px rgba(20,10,50,0.06)`
            : '0 8px 22px -10px rgba(20,10,50,0.16), 0 1px 4px rgba(20,10,50,0.04)',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message — try @name"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !mentionQuery) handleSubmit();
            if (e.key === 'Escape') setMentionQuery(null);
          }}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14.5, color: '#0D0820', fontFamily: 'inherit' }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !hasText}
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasText ? 'pointer' : 'default',
            background: hasText ? accent : '#EEEDF7',
            boxShadow: hasText ? `0 4px 14px -3px ${accent}66` : 'none',
            transform: hasText ? 'scale(1)' : 'scale(0.92)',
            transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), background 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasText ? '#fff' : '#B7B3CC'} strokeWidth="2.4">
            <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
