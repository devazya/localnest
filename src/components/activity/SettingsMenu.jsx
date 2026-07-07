/**
 * SettingsMenu.jsx — Activity Center & Settings (Segment 8)
 * Full-screen overlay opened from the Activity screen's hamburger icon.
 */
import { motion } from 'framer-motion';
import { BellOutlineIcon, CheckCircleIcon, MuteIcon, FilterIcon, MoonIcon, ShieldIcon } from './icons';
import { COLORS, SHADOW_SOFT, PRIMARY_GRADIENT } from './constants';

function MenuRow({ icon, title, subtitle, onClick, chevron = true }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16,
        padding: '14px 16px', marginBottom: 10, cursor: 'pointer', boxShadow: SHADOW_SOFT,
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: COLORS.softLavender, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.textPrimary }}>{title}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2, lineHeight: 1.35 }}>{subtitle}</div>
      </div>
      {chevron && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2" style={{ flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

export default function SettingsMenu({ onClose, onNavigate, onMarkAllRead, onQuickMute, unreadCount }) {
  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: COLORS.background, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 4px' }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Settings</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textPrimary} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div style={{ padding: '14px 18px 6px' }}>
        <div style={{ backgroundImage: PRIMARY_GRADIENT, borderRadius: 20, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
          {unreadCount > 0 && (
            <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, fontSize: 11, padding: '3px 9px', borderRadius: 999 }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <BellOutlineIcon size={26} color="#fff" />
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16.5, lineHeight: 1.35 }}>Manage your notifications<br />and activity experience</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px 28px' }}>
        <MenuRow icon={<BellOutlineIcon size={19} color={COLORS.accentIndigo} />} title="Notification Preferences" subtitle="Choose what you want to see and when." onClick={() => onNavigate('notifications')} />
        <MenuRow icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={COLORS.accentIndigo} strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>} title="Weekly Recap" subtitle="See your weekly activity and neighbour score progress." onClick={() => onNavigate('recap')} />
        <MenuRow icon={<FilterIcon size={19} color={COLORS.accentIndigo} />} title="Filters" subtitle="Filter and customize your activity feed." onClick={() => onNavigate('filters')} />
        <MenuRow icon={<MoonIcon size={19} color={COLORS.accentIndigo} />} title="Quiet Hours" subtitle="Do not disturb at your preferred time." onClick={() => onNavigate('quietHours')} />
        <MenuRow icon={<CheckCircleIcon size={19} color={COLORS.accentIndigo} />} title="Mark All as Read" subtitle="Clear all unread notifications." onClick={onMarkAllRead} chevron={false} />
        <MenuRow icon={<MuteIcon size={19} color={COLORS.accentIndigo} />} title="Mute Notifications" subtitle="Temporarily stop all notifications." onClick={onQuickMute} chevron={false} />
        <MenuRow icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={COLORS.accentIndigo} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} title="Help & Support" subtitle="Get help and find answers." onClick={onClose} />
        <MenuRow icon={<ShieldIcon size={19} color={COLORS.accentIndigo} />} title="About LocalNest" subtitle="App info, version and more." onClick={onClose} />
      </div>
    </motion.div>
  );
}
