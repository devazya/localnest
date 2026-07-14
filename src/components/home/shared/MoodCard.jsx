/**
 * MoodCard.jsx (home/shared)
 * ---------------------------------------------------------------------
 * Single mood tile for the Home "Mood Cards" grid — an emotion/intent
 * selector, not a category chip, so it gets full card treatment
 * (emoji, title, one-line subtitle) rather than CategoryChipRow's pill.
 * Selected state: soft lavender fill + a small accent glow + a scale
 * lift, per the approved design brief.
 */
import { motion } from 'framer-motion';

export default function MoodCard({ mood, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={`${mood.title} — ${mood.subtitle}`}
      onClick={() => onSelect(mood.slug)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      animate={{
        scale: selected ? 1.03 : 1,
        background: selected
          ? `linear-gradient(135deg, ${mood.themeColor}1A, ${mood.themeColor}33)`
          : `linear-gradient(135deg, ${mood.themeColor}0D, ${mood.themeColor}1F)`,
        boxShadow: selected
          ? `0 0 0 1.5px ${mood.themeColor}66, 0 10px 28px ${mood.themeColor}33`
          : `0 8px 24px ${mood.themeColor}14, 0 2px 8px ${mood.themeColor}0D`,
      }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        border: 'none',
        borderRadius: 22,
        padding: '18px 10px',
        minHeight: 108,
        cursor: 'pointer',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <motion.span
        aria-hidden="true"
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', damping: 20, stiffness: 320 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          lineHeight: 1,
          marginBottom: 2,
          background: `${mood.themeColor}33`,
          boxShadow: `0 2px 8px ${mood.themeColor}40`,
        }}
      >
        {mood.emoji}
      </motion.span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0D0820', lineHeight: 1.25 }}>
        {mood.title}
      </span>
      <span style={{ fontSize: 10.5, color: '#9CA3AF', lineHeight: 1.35, padding: '0 4px' }}>
        {mood.subtitle}
      </span>
    </motion.button>
  );
}
