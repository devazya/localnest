export const heroContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const heroLine = {
  initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
  animate: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroSubtle = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export const networkReveal = {
  initial: { opacity: 0, scale: 0.9, rotateX: 8 },
  animate: {
    opacity: 1, scale: 1, rotateX: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
  },
};

export const pulseBarReveal = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.7 },
  },
};

export const floatY = (amplitude = 10, duration = 4) => ({
  animate: {
    y: [0, -amplitude, 0],
    transition: { duration, ease: 'easeInOut', repeat: Infinity },
  },
});

export const glowPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.04, 1],
    transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
  },
};
