/**
 * CommunityComposer.jsx — Community module
 * The General-channel chat composer: text input, send button.
 * Controlled component — state lives in the parent (GeneralChat) since it
 * needs to coordinate with realtime message submission.
 * Emoji button removed (Segment 2 UX decision) — users already have emoji
 * keyboards on their devices.
 */

export default function CommunityComposer({ user, text, setText, onSubmit, submitting }) {
  if (!user) {
    return <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', padding: '10px 0' }}>Sign in to chat</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F8F7FF', border: '1.5px solid #EDE9FF', borderRadius: 16, padding: '9px 14px' }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Message #General"
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSubmit()}
        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#0D0820', fontFamily: 'inherit' }} />
      <button onClick={onSubmit} disabled={submitting || !text.trim()} style={{ background: 'none', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? '#6D4AFF' : '#D1D5DB'} strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
      </button>
    </div>
  );
}
