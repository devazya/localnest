/**
 * NeighbourScoreCard.jsx — Trust & Reputation System (Segment 5.2)
 * The profile's visual hero: a 0–100 Neighbour Score with a trust label.
 * Premium, restrained styling — a ring, a number, a label. No gamification.
 */
import { motion } from 'framer-motion';
import AnimatedNumber from '../community/AnimatedNumber';
import TrustLevel from './TrustLevel';

export default function NeighbourScoreCard({ score = 0, trustLabel, light = false }) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  const ring = light ? 'rgba(255,255,255,0.9)' : '#6D4AFF';
  const track = light ? 'rgba(255,255,255,0.22)' : '#EDE9FF';
  const textColor = light ? '#fff' : '#0D0820';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke={track} strokeWidth="6" />
          <motion.circle
            cx="38" cy="38" r={r} fill="none" stroke={ring} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: textColor, lineHeight: 1 }}>
            <AnimatedNumber value={score} />
          </span>
          <span style={{ fontSize: 8.5, fontWeight: 600, color: light ? 'rgba(255,255,255,0.7)' : '#9CA3AF', marginTop: 1 }}>/ 100</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: light ? 'rgba(255,255,255,0.85)' : '#9CA3AF', letterSpacing: 0.3 }}>
          ⭐ NEIGHBOUR SCORE
        </div>
        <TrustLevel label={trustLabel} light={light} />
      </div>
    </div>
  );
}
