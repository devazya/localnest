import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PaginationIndicator from '../components/ui/PaginationIndicator';

export default function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      style={{
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0 40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Logo + name + tagline */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6D4CFF 0%, #8A6BFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(109,76,255,0.32)',
            marginBottom: 18,
          }}
        >
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path d="M7 18L19 7L31 18V32H24V24H14V32H7V18Z" fill="white" />
          </svg>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 34,
            fontWeight: 700,
            color: '#1D1D1F',
            letterSpacing: -0.8,
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          LocalNest
        </div>

        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 500,
            color: '#6B7280',
          }}
        >
          Your community, connected.
        </div>
      </motion.div>

      {/* Illustration — full width, scaled up significantly */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
        style={{
          marginTop: 28,
          marginBottom: 36,
          width: '130%',           /* wider than container to force full bleed zoom */
          marginLeft: '-15%',
        }}
      >
        <motion.img
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
          src="/images/splash-illustration.png"
          alt="LocalNest city illustration"
          style={{
            width: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </motion.div>

      {/* Pagination dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <PaginationIndicator total={3} active={0} />
      </motion.div>
    </motion.div>
  );
}
