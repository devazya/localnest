/**
 * WhatCanIPostSheet.jsx — Community / Neighbourhood Updates (Segment 4)
 * Premium Apple-style bottom sheet that explains what belongs in Neighbourhood Updates.
 * Used both from the "What can I post?" button and on first visit.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { NU_WHAT_CAN_I_POST_EXAMPLES } from './constants';

export default function WhatCanIPostSheet({ onClose }) {
  // Lock body scroll while sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 700,
        background: 'rgba(0,0,0,0.48)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 560,
          background: 'linear-gradient(180deg, #FFFDF7 0%, #FFFFFF 100%)',
          borderRadius: '28px 28px 0 0',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -16px 64px rgba(217,119,6,0.12), 0 -4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#0D0820', fontFamily: 'var(--font-display)', letterSpacing: -0.5 }}>
                What can I post here?
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3, lineHeight: 1.5 }}>
                Neighbourhood Updates is for important information that benefits your locality.
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                flexShrink: 0, marginLeft: 12,
                width: 30, height: 30, borderRadius: '50%',
                background: '#F3F4F6', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B7280', fontSize: 16, fontWeight: 700,
              }}
            >×</button>
          </div>

          {/* Amber decorative bar */}
          <div style={{ height: 3, borderRadius: 3, background: 'linear-gradient(90deg, #D97706, #FBBF24, #FEF3C7)', marginTop: 14, marginBottom: 0 }} />
        </div>

        {/* Scrollable examples list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NU_WHAT_CAN_I_POST_EXAMPLES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.045, duration: 0.28 }}
                style={{
                  display: 'flex', gap: 13, alignItems: 'flex-start',
                  background: '#FFFBF2',
                  border: '1.5px solid #FEF3C7',
                  borderRadius: 16,
                  padding: '13px 14px',
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item.role}</div>
                  <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.55 }}>"{item.example}"</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider + Bottom message */}
          <div style={{ margin: '18px 0 0', padding: '16px 14px', background: '#F8F7FF', borderRadius: 16, border: '1.5px solid #EDE9FF' }}>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: '#6D4AFF' }}>Only post information that benefits the neighbourhood.</span>
              <br />
              General conversations belong inside <span style={{ fontWeight: 600, color: '#6D4AFF' }}>Neighbourhood Chat</span>.
              Topic discussions belong inside their respective Community channels.
            </div>
          </div>

          {/* Safe-area spacer */}
          <div style={{ height: 'max(24px, env(safe-area-inset-bottom, 24px))' }} />
        </div>

        {/* Got it button */}
        <div style={{ padding: '14px 16px', background: '#fff', borderTop: '1px solid #F4F3FF', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '15px 0', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(217,119,6,0.35)',
              letterSpacing: -0.2,
            }}
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
