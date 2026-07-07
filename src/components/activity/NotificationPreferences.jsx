/**
 * NotificationPreferences.jsx — Activity Center & Settings (Segment 8)
 * Every toggle writes straight to user_settings.notification_preferences.
 */
import { motion } from 'framer-motion';
import Toggle from './Toggle';
import { COLORS, SHADOW_SOFT, NOTIFICATION_GROUPS } from './constants';

export default function NotificationPreferences({ onBack, preferences, onToggle }) {
  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      style={{ position: 'fixed', inset: 0, zIndex: 550, background: COLORS.background, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textPrimary} strokeWidth="2.2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Notification Preferences</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 28px' }}>
        {NOTIFICATION_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{group.title}</div>
            <div style={{ background: COLORS.surface, borderRadius: 16, boxShadow: SHADOW_SOFT, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
              {group.prefs.map((pref, i) => {
                const checked = !!preferences?.[pref.key];
                return (
                  <div key={pref.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < group.prefs.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <span style={{ fontSize: 13.5, color: COLORS.textPrimary, fontWeight: 500 }}>{pref.label}</span>
                    <Toggle checked={checked} onChange={(v) => onToggle(pref.key, v)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
