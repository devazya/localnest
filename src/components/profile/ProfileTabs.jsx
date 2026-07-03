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
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '4px 20px', borderBottom: '1.5px solid #F0EEFF', scrollbarWidth: 'none' }}>
        {TABS.map(t => {
          const active = t.key === activeKey;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                position: 'relative', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 14px', fontSize: 13, fontWeight: 700,
                color: active ? '#6D4AFF' : '#9CA3AF', whiteSpace: 'nowrap',
              }}
            >
              {t.label}
              {active && (
                <motion.div layoutId="profile-tab-underline" style={{
                  position: 'absolute', bottom: -1.5, left: 6, right: 6, height: 2.5,
                  borderRadius: 2, background: '#6D4AFF',
                }} />
              )}
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
