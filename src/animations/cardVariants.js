export const cardReveal = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: '-48px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  hover: {
    y: -6,
    boxShadow: '0 24px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(110,231,183,0.12)',
    borderColor: 'rgba(110,231,183,0.22)',
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

export const shimmer = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: { duration: 1.6, ease: 'linear', repeat: Infinity, repeatDelay: 1.2 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const fadeSlideLeft = {
  initial: { opacity: 0, x: -24 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const fadeSlideRight = {
  initial: { opacity: 0, x: 24 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};
