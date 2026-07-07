/**
 * QuietHours.jsx — Activity Center & Settings (Segment 8)
 * Writes straight to user_settings.quiet_hours_enabled / _start / _end /
 * active_days. Time fields are shown read-only here — wire up the app's
 * existing time-picker component/modal for editing them.
 */
import { motion } from 'framer-motion';
import Toggle from './Toggle';
import { MoonIcon, ShieldIcon } from './icons';
import { COLORS, SHADOW_SOFT, PRIMARY_GRADIENT, DAY_KEYS, DAY_LABELS } from './constants';

function formatTime(t) {
  if (!t) return '';
  const [hh, mm] = t.split(':');
  const h = parseInt(hh, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${period}`;
}

export default function QuietHours({ onBack, settings, onUpdate }) {
  const activeDays = settings?.active_days || [];

  const toggleDay = (day) => {
    const set = new Set(activeDays);
    set.has(day) ? set.delete(day) : set.add(day);
    onUpdate({ active_days: DAY_KEYS.filter((d) => set.has(d)) });
  };

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
        <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Quiet Hours</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 28px' }}>
        <div style={{ backgroundImage: PRIMARY_GRADIENT, borderRadius: 20, padding: '20px', marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <MoonIcon size={22} color="#fff" />
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Quiet Hours</div>
          <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, marginTop: 4 }}>You won't receive push notifications during this time.</div>
        </div>

        {[
          { label: 'Start Time', value: settings?.quiet_hours_start },
          { label: 'End Time', value: settings?.quiet_hours_end },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: COLORS.surface, borderRadius: 16, padding: '14px 16px', marginBottom: 10, boxShadow: SHADOW_SOFT, border: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: COLORS.textPrimary }}>{row.label}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
              {formatTime(row.value)}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={COLORS.textSecondary} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </span>
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, margin: '16px 0 8px' }}>Repeat</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {DAY_LABELS.map((label, i) => {
            const key = DAY_KEYS[i];
            const active = activeDays.includes(key);
            return (
              <button
                key={i}
                onClick={() => toggleDay(key)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 700,
                  color: active ? '#fff' : COLORS.textSecondary,
                  background: active ? undefined : COLORS.surface,
                  backgroundImage: active ? PRIMARY_GRADIENT : undefined,
                  boxShadow: active ? undefined : SHADOW_SOFT,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: COLORS.surface, borderRadius: 16, padding: '14px 16px', marginBottom: 14, boxShadow: SHADOW_SOFT, border: `1px solid ${COLORS.border}` }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: COLORS.textPrimary }}>Status</div>
            <div style={{ fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2 }}>Quiet Hours is {settings?.quiet_hours_enabled ? 'ON' : 'OFF'}</div>
          </div>
          <Toggle checked={!!settings?.quiet_hours_enabled} onChange={(v) => onUpdate({ quiet_hours_enabled: v })} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <ShieldIcon size={15} color={COLORS.primary} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: COLORS.textSecondary, lineHeight: 1.4 }}>You can still receive important alerts for ride cancellations and safety.</span>
        </div>
      </div>
    </motion.div>
  );
}
