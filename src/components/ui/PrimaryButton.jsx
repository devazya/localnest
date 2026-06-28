import { motion } from 'framer-motion';

export default function PrimaryButton({ label = 'Next', onClick, style = {} }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '17px 0',
        borderRadius: 18,
        background: 'linear-gradient(135deg, #6D4CFF 0%, #8A6BFF 100%)',
        color: '#fff',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(109,76,255,0.38)',
        letterSpacing: 0.2,
        ...style,
      }}
    >
      {label}
    </motion.button>
  );
}
