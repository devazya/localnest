import { motion } from 'framer-motion';
import PaginationIndicator from '../components/ui/PaginationIndicator';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function Onboarding({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '56px 24px 0px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Headline + description */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        style={{ width: '100%', maxWidth: 380 }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: '40px',
            color: '#1D1D1F',
            letterSpacing: -0.6,
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {'Everything\nyou need,\nright nearby.'}
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            fontWeight: 400,
            lineHeight: '24px',
            color: '#6B7280',
            marginTop: 16,
            marginBottom: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {'Stay connected with people,\nplaces & updates in your locality.'}
        </p>
      </motion.div>

      {/* Illustration — natural size, no bleed, no scale */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{
          marginTop: 28,
          width: '100%',
          maxWidth: 380,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        <img
          src="/images/onboarding-illustration.png"
          alt="Community illustration"
          style={{
            width: '100%',
            maxHeight: 300,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </motion.div>

      {/* Bottom: indicators + button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        style={{
          width: '100%',
          maxWidth: 380,
          paddingBottom: 40,
          paddingTop: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <PaginationIndicator total={3} active={1} />
        </div>

        <PrimaryButton label="Next" onClick={onDone} />
      </motion.div>
    </motion.div>
  );
}
