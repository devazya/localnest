/**
 * CommunityChatScreen.jsx — Community module (Segment 2)
 * Full-screen wrapper around the existing GeneralChat implementation —
 * reused as-is, not rebuilt. Slides in when the user taps "Join Chat" on
 * the CommunityChatCard preview. Label reads "Neighbourhood Chat";
 * component name kept as "CommunityChatScreen" per architecture decisions.
 */

import { motion } from 'framer-motion';
import GeneralChat from './GeneralChat';
import PostSkeleton from './PostSkeleton';
import AnimatedNumber from './AnimatedNumber';

export default function CommunityChatScreen({ onBack, posts, initialLoad, user, onDelete, onPost, onlineCount = 0 }) {
  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500, background: '#EEEEFF',
        display: 'flex', flexDirection: 'column', height: '100dvh',
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(109,74,255,0.08)', padding: '0 14px', height: 60,
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: '50%', background: '#F8F8FF', border: '1.5px solid rgba(109,74,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Neighbourhood Chat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'livePulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 500, display: 'inline-flex', gap: 4 }}><AnimatedNumber value={onlineCount} /> online</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '14px 14px 0', display: 'flex', flexDirection: 'column' }}>
        {initialLoad ? <PostSkeleton /> : <GeneralChat posts={posts} user={user} onDelete={onDelete} onPost={onPost} onlineCount={onlineCount} />}
      </div>
    </motion.div>
  );
}
