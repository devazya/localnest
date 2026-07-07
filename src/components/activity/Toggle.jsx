/**
 * Toggle.jsx — Activity Center & Settings (Segment 8)
 * iOS-style switch, matching FilterSheet.jsx's existing "verified only"
 * toggle pattern but promoted to a reusable component (this segment uses
 * it ~20 times across Notification Preferences + Quiet Hours).
 */
import { motion } from 'framer-motion';
import { PRIMARY_GRADIENT } from './constants';

export default function Toggle({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 999,
        background: checked ? undefined : '#E5E7EB',
        backgroundImage: checked ? PRIMARY_GRADIENT : undefined,
        position: 'relative', flexShrink: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          left: checked ? 21 : 3,
        }}
      />
    </div>
  );
}
