/**
 * CommunityDrawer.jsx — Community module (Segment 1 redesign)
 * Now a Community-specific menu (My Discussions, Saved Posts, Drafts,
 * My Announcements, Community Settings, Community Rules, and — for
 * admins only — Moderation Queue) rather than a duplicate channel list
 * or duplicate Bottom Navigation. Channel switching now lives in
 * ChannelNavigation. Presentation only — no new backend logic; items
 * without a destination yet simply close the drawer.
 */

import { motion } from 'framer-motion';

const ICONS = {
  discussions: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  saved: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
  drafts: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  announcements: <><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  rules: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></>,
  moderation: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
};

function DrawerItem({ icon, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 14px', borderRadius: 16, marginBottom: 3,
        background: 'none', border: 'none', cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F8F7FF'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: accent ? 'rgba(239,68,68,0.08)' : '#F4F3FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent ? '#DC2626' : '#6D4AFF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: accent ? '#DC2626' : '#0D0820' }}>{label}</span>
    </button>
  );
}

export default function CommunityDrawer({ isAdmin, onClose, onOpenModeration }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex' }}>
      <motion.div
        initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ width: 290, height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '8px 0 40px rgba(0,0,0,0.12)' }}
      >
        <div style={{ padding: '32px 20px 16px', background: 'linear-gradient(180deg, #FAFAFF 0%, #fff 100%)', borderBottom: '1px solid #F4F3FF' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0D0820', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Community</div>
          <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>Green Sector • Anekal</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 8px' }}>
          <DrawerItem icon={ICONS.discussions}   label="My Discussions"   onClick={onClose} />
          <DrawerItem icon={ICONS.saved}         label="Saved Posts"      onClick={onClose} />
          <DrawerItem icon={ICONS.drafts}        label="Drafts"           onClick={onClose} />
          <DrawerItem icon={ICONS.announcements} label="My Announcements" onClick={onClose} />

          <div style={{ height: 1, background: '#F4F3FF', margin: '10px 6px' }} />

          <DrawerItem icon={ICONS.settings} label="Community Settings" onClick={onClose} />
          <DrawerItem icon={ICONS.rules}    label="Community Rules"    onClick={onClose} />

          {isAdmin && (
            <>
              <div style={{ height: 1, background: '#F4F3FF', margin: '10px 6px' }} />
              <DrawerItem icon={ICONS.moderation} label="Moderation Queue" accent onClick={() => { onOpenModeration?.(); onClose(); }} />
            </>
          )}
        </div>
      </motion.div>
      <div style={{ flex: 1, background: 'rgba(13,8,32,0.3)' }} onClick={onClose} />
    </motion.div>
  );
}
