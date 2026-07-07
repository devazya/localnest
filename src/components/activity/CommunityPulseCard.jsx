/**
 * CommunityPulseCard.jsx — Activity Center & Settings (Segment 8)
 * Horizontal-scroll live stats card, sourced from the public.user_stats view.
 */
import Glyph from './Glyph';
import { COLORS, SHADOW_SOFT } from './constants';

const METRICS = [
  { key: 'helpful_votes', label: 'Helpful',      glyph: 'heart',    color: COLORS.error },
  { key: 'discussions',   label: 'Discussions',  glyph: 'message',  color: COLORS.primaryLight },
  { key: 'events',        label: 'Events',       glyph: 'calendar', color: COLORS.accentIndigo },
  { key: 'ride_offers',   label: 'Ride Offers',  glyph: 'car',      color: COLORS.primary },
  { key: 'listings',      label: 'Listings',     glyph: 'bag',      color: COLORS.warning },
];

export default function CommunityPulseCard({ stats, onOpenRecap }) {
  return (
    <div style={{ padding: '0 18px 10px' }}>
      <div style={{ background: COLORS.surface, borderRadius: 20, padding: '16px 16px 14px', boxShadow: SHADOW_SOFT, border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary, fontFamily: 'var(--font-display)' }}>Community Pulse</span>
          <button
            onClick={onOpenRecap}
            style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: COLORS.primary, cursor: 'pointer', padding: 0 }}
          >
            Today
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }} className="ln-no-scrollbar">
          {METRICS.map((m) => {
            const value = stats ? (stats[m.key] ?? 0) : 0;
            return (
              <div key={m.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 62 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Glyph name={m.glyph} size={17} color={m.color} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary }}>{value}</span>
                <span style={{ fontSize: 10.5, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
