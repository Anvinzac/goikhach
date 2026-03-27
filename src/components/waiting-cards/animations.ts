import type { Variants } from 'framer-motion';

// Entry animations
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// Loop animations
export const breathe = {
  scale: [1, 1.02, 1],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
};

export const glowPulse = {
  opacity: [0.5, 1, 0.5],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
};

export const shimmer = {
  x: ['-100%', '200%'],
  transition: { duration: 3, repeat: Infinity, ease: 'linear' as const, repeatDelay: 2 },
};

export const gradientShift = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const },
};

// Interaction animations
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const tapPress = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// Status-specific animations
export const statusPulse = {
  waiting: {
    boxShadow: [
      '0 0 0 0 rgba(251, 191, 36, 0)',
      '0 0 0 8px rgba(251, 191, 36, 0.15)',
      '0 0 0 0 rgba(251, 191, 36, 0)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
  called: {
    boxShadow: [
      '0 0 0 0 rgba(34, 197, 94, 0)',
      '0 0 0 12px rgba(34, 197, 94, 0.2)',
      '0 0 0 0 rgba(34, 197, 94, 0)',
    ],
    transition: { duration: 1, repeat: Infinity },
  },
  cancelled: {},
  expired: {},
};

// Neon flicker
export const neonFlicker = {
  opacity: [1, 0.8, 1, 0.9, 1, 0.85, 1],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

// Scanline sweep
export const scanlineSweep = {
  y: ['-100%', '200%'],
  transition: { duration: 4, repeat: Infinity, ease: 'linear' as const, repeatDelay: 3 },
};

// Number count up
export const counterSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
};
