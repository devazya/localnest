/**
 * ProfileTabs.jsx — Social Identity & Follow System (Segment 5.1)
 * Structure only. Only "Overview" is functional this segment — the rest
 * render premium "coming soon" placeholders until their own segments.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { key: 'overview',     label: 'Overview' },
  { key: 'updates',      label: 'Activity' },
  { key: 'discussions',  label: 'Community' },
  { key: 'marketplace',  label: 'Marketplace' },
];

function Placeholder({ label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '56px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #F3F0FF, #E9E4FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>✨</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0D0820' }}>{label}</div>
      <div style={{ fontSize: 12.5, color: '#9CA3AF', maxWidth: 220 }}>Coming soon — this tab is being crafted for a future update.</div>
    </div>
  );
}

export default function ProfileTabs({ activeKey, onChange, overviewContent, activityContent }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 16px', borderBottom: '1.5px solid #F0EEFF', scrollbarWidth: 'none' }}>
        {TABS.map(t => {
          const active = t.key === activeKey;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                position: 'relative', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                padding: '9px 16px', fontSize: 13, fontWeight: 700, borderRadius: 999,
                color: active ? '#fff' : '#9CA3AF', whiteSpace: 'nowrap', zIndex: 1,
                transition: 'color 0.2s',
              }}
            >
              {active && (
                <motion.div layoutId="profile-tab-pill" transition={{ type: 'spring', damping: 26, stiffness: 340 }} style={{
                  position: 'absolute', inset: 0, borderRadius: 999,
                  background: 'linear-gradient(135deg, #6D4AFF 0%, #8F7BFF 100%)',
                  boxShadow: '0 6px 14px -4px rgba(76,29,149,0.4)', zIndex: -1,
                }} />
              )}
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {activeKey === 'overview'
            ? overviewContent
            : activeKey === 'updates'
            ? (activityContent || <Placeholder label="Activity" />)
            : <Placeholder label={TABS.find(t => t.key === activeKey)?.label} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
