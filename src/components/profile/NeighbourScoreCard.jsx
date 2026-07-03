/**
 * NeighbourScoreCard.jsx — Trust & Reputation System (Segment 5.2)
 * The profile's visual hero: a 0–100 Neighbour Score with a trust label,
 * a real "Top X% in <locality>" line, and a lifted 3D shield with
 * sparkle accents. Colours hand-matched to the reference design.
 */
import { motion } from 'framer-motion';
import AnimatedNumber from '../community/AnimatedNumber';
import TrustLevel from './TrustLevel';

export default function NeighbourScoreCard({ score = 0, trustLabel, light = false, standing = null }) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  const ring = light ? '#fff' : '#6D4AFF';
  const track = light ? 'rgba(255,255,255,0.3)' : '#EAE5FF';
  const textColor = light ? '#fff' : '#150B33';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: textColor, lineHeight: 1 }}>
            <AnimatedNumber value={score} />
          </span>
          <span style={{ fontSize: 8.5, fontWeight: 600, color: light ? 'rgba(255,255,255,0.75)' : '#9CA3AF', marginTop: 1 }}>/ 100</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: light ? 'rgba(255,255,255,0.85)' : '#9CA3AF', letterSpacing: 0.3 }}>
          <span style={{ color: '#FFC93C' }}>⭐</span> NEIGHBOUR SCORE
        </div>
        <TrustLevel label={trustLabel} light={light} />
        {standing && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
            color: light ? '#fff' : '#6D4AFF', marginTop: 2,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.6"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
            Top {standing.topPercent}%<span style={{ fontWeight: 500, color: light ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}>&nbsp;in {standing.locality}</span>
          </div>
        )}
      </div>

      {/* 3D lifted shield with sparkle accents — decorative, matches reference */}
      <div style={{ position: 'relative', width: 58, height: 62, flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ position: 'absolute', top: -4, left: -6 }}>
          <path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#FFC93C" />
        </svg>
        <svg width="9" height="9" viewBox="0 0 24 24" style={{ position: 'absolute', bottom: 6, right: -4 }}>
          <path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#B9A8FF" />
        </svg>
        <svg width="58" height="62" viewBox="0 0 58 62" style={{ filter: 'drop-shadow(0 6px 10px rgba(76,29,149,0.35))' }}>
          <defs>
            <linearGradient id="nsc-shield-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9C87FF" />
              <stop offset="100%" stopColor="#6D4AFF" />
            </linearGradient>
          </defs>
          <path d="M29 1 L54 10 V29 C54 45 43 55 29 60 C15 55 4 45 4 29 V10 Z" fill="url(#nsc-shield-grad)" />
          <path d="M29 16 L32.6 25.4 L42.6 25.9 L34.8 32.1 L37.5 41.6 L29 36.1 L20.5 41.6 L23.2 32.1 L15.4 25.9 L25.4 25.4 Z" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}
