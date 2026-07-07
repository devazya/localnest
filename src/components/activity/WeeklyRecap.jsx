/**
 * WeeklyRecap.jsx — Activity Center & Settings (Segment 8)
 * Reads live numbers from public.user_stats. The trend line is derived
 * from neighbour_score_weekly_change (no history table exists yet, so it's
 * shown as a single ramp toward this week's real total rather than invented
 * daily data points).
 */
import { motion } from 'framer-motion';
import { COLORS, SHADOW_SOFT, PRIMARY_GRADIENT } from './constants';

function TrendChart({ weeklyChange }) {
  const width = 300, height = 90;
  const points = [0, 0.15, 0.3, 0.5, 0.68, 0.85, 1].map((t) => 40 + weeklyChange * t);
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => [i * stepX, height - ((p - min) / range) * height]);
  const path = coords.reduce((acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`), '');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 88, marginTop: 8 }}>
      <defs>
        <linearGradient id="ln-recap-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.primary} />
          <stop offset="100%" stopColor={COLORS.primaryLight} />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#ln-recap-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={COLORS.primary} />
    </svg>
  );
}

function StatBlock({ value, label }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 11, marginTop: 3 }}>{label}</div>
    </div>
  );
}

export default function WeeklyRecap({ onBack, stats }) {
  const weeklyChange = stats?.neighbour_score_weekly_change ?? 0;

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
        <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Weekly Recap</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 28px' }}>
        <div style={{ backgroundImage: PRIMARY_GRADIENT, borderRadius: 20, padding: '20px', marginBottom: 16 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>You were active this week! 🎉</div>
          <div style={{ display: 'flex' }}>
            <StatBlock value={stats?.helpful_votes ?? 0} label="Neighbours Helped" />
            <StatBlock value={stats?.discussions ?? 0} label="Discussions Joined" />
            <StatBlock value={stats?.events ?? 0} label="Events Attended" />
          </div>
        </div>

        <div style={{ background: COLORS.surface, borderRadius: 20, padding: '18px', boxShadow: SHADOW_SOFT, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.textSecondary }}>Neighbour Score</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: weeklyChange >= 0 ? COLORS.success : COLORS.error, marginTop: 2 }}>
            {weeklyChange >= 0 ? '+' : ''}{weeklyChange}
            <span style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.textSecondary, marginLeft: 8 }}>This Week</span>
          </div>
          <TrendChart weeklyChange={weeklyChange} />
        </div>

        <button
          style={{ width: '100%', marginTop: 18, padding: '14px 0', borderRadius: 999, border: 'none', backgroundImage: PRIMARY_GRADIENT, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 18px rgba(109,74,255,0.32)' }}
        >
          View Detailed Summary
        </button>
      </div>
    </motion.div>
  );
}
