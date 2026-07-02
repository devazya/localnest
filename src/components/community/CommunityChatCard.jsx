/**
 * CommunityChatCard.jsx — Community module (Segment 3.2)
 * Preview card for the permanent neighbourhood chat.
 *
 * Segment 3.2: the latest message slot now cycles through ALL recent
 * messages like a live ticker — each message shows for 2 s, then fades
 * out while the next one fades + slides in (AnimatePresence popLayout).
 * The `latest` prop is now an ARRAY of { name, text } objects; Community.jsx
 * passes the last N chat messages so we can rotate them here.
 * Falls back gracefully if only one or zero messages are present.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

const MSG_DURATION = 2200; // ms each message is visible

export default function CommunityChatCard({ onlineCount = 0, latest, onJoin }) {
  // `latest` can be a single { name, text } object (legacy) OR an array.
  const messages = Array.isArray(latest)
    ? latest
    : (latest ? [latest] : []);

  const [idx, setIdx] = useState(0);

  // Auto-advance through messages
  useEffect(() => {
    if (messages.length <= 1) return;
    setIdx(0); // reset when message list changes
  // eslint-disable-next-line
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), MSG_DURATION);
    return () => clearInterval(t);
  }, [messages.length]);

  const current = messages[idx % Math.max(messages.length, 1)];

  return (
    <div style={{ padding: '14px 14px 0' }}>
      <motion.button
        onClick={onJoin}
        whileTap={{ scale: 0.97, y: 3, boxShadow: '0 2px 0 rgba(109,74,255,0.20), inset 0 1px 3px rgba(0,0,0,0.06)' }}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          borderRadius: 24, padding: '18px 20px',
          background: 'linear-gradient(160deg, #FFFFFF 0%, #FAF9FF 100%)',
          border: '1.5px solid rgba(109,74,255,0.14)',
          // 3D depth: visible bottom floor + top highlight
          boxShadow: [
            '0 5px 0 rgba(109,74,255,0.14)',       // 3D floor
            '0 10px 28px rgba(109,74,255,0.10)',    // ambient glow
            'inset 0 1px 0 rgba(255,255,255,0.90)', // top glass highlight
          ].join(', '),
          display: 'flex', flexDirection: 'column', gap: 10,
          position: 'relative', overflow: 'hidden',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
      >
        {/* Subtle top shimmer stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #6D4AFF, #9B6AFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 0 rgba(109,74,255,0.35), 0 6px 14px rgba(109,74,255,0.25)',
          }}>
            <span style={{ fontSize: 20 }}>💬</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)' }}>Neighbourhood Chat</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>General conversations across your locality</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'livePulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16A34A', display: 'inline-flex', gap: 4 }}>
              <AnimatedNumber value={onlineCount} /> online
            </span>
          </div>
        </div>

        {/* Live message ticker — AnimatePresence cycles through messages */}
        <div style={{
          minHeight: 38,  // reserve fixed height so card doesn't jump
          position: 'relative',
          overflow: 'hidden',
        }}>
          <AnimatePresence mode="popLayout">
            {current ? (
              <motion.div
                key={`${current.name}-${idx}`}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #F4F2FF, #F8F7FF)',
                  borderRadius: 14, padding: '9px 12px',
                  border: '1px solid rgba(109,74,255,0.08)',
                  position: 'relative',
                }}
              >
                {/* Live pulse dot — shows this is a real-time message */}
                <div style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: '#22C55E',
                  animation: 'livePulse 1.8s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6D4AFF', flexShrink: 0, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {current.name}
                </span>
                <span style={{ fontSize: 12.5, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {current.text}
                </span>
                {/* Subtle message count if multiple */}
                {messages.length > 1 && (
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 700,
                    color: '#9CA3AF', letterSpacing: 0.2,
                  }}>
                    {idx + 1}/{messages.length}
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#F8F7FF', borderRadius: 14, padding: '9px 12px',
                  border: '1px solid rgba(109,74,255,0.06)',
                }}
              >
                <span style={{ fontSize: 12.5, color: '#C4B5FD' }}>Be the first to say something…</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}
