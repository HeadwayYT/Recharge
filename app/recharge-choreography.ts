export const layoutTransition = {
  type: "spring",
  stiffness: 360,
  damping: 34,
  mass: 0.9,
};

export const spatialTransition = {
  type: "spring",
  stiffness: 300,
  damping: 32,
  mass: 0.95,
};

export const screenVariants = {
  initial: { opacity: 0, y: 18, scale: 0.992, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...layoutTransition, filter: { duration: 0.24 } },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.992,
    filter: "blur(7px)",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

export const spatialScreenVariants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: { duration: 0.12 },
  },
  exit: {
    opacity: 0.18,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

export const composerVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...layoutTransition, delay: 0.08 },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

export const extractedComposerVariants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: {
    opacity: 0.76,
    y: 0,
    scale: 1,
    transition: { ...spatialTransition, delay: 0.12 },
  },
  exit: {
    opacity: 0.18,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

export const signalGroupVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

export const signalVariants = {
  initial: { opacity: 0, y: -10, scale: 0.92 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: layoutTransition,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.94,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

export const extractedSignalVariants = {
  initial: { opacity: 0, y: -4, scale: 0.88 },
  animate: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...spatialTransition, delay },
  }),
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.9,
    transition: { duration: 0.14, ease: "easeInOut" },
  },
};

export const moduleVariants = {
  initial: { opacity: 0, y: 24, scale: 0.975, filter: "blur(8px)" },
  animate: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...layoutTransition, delay, filter: { duration: 0.2, delay } },
  }),
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    filter: "blur(6px)",
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

export const focusFormationVariants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...spatialTransition, delay: 0.34 },
  },
  exit: {
    opacity: 0.12,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

export const experimentFormationVariants = {
  initial: { opacity: 0.28, y: 36, scale: 0.48, borderRadius: 999 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    borderRadius: 34,
    transition: { ...spatialTransition, delay: 0.56 },
  },
  exit: {
    opacity: 0.3,
    scale: 0.92,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

export const contextExtractionVariants = {
  initial: { opacity: 0, y: 18, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...spatialTransition, delay: 0.12 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

export const spatialBehaviors = {
  promote: spatialTransition,
  demote: { ...spatialTransition, damping: 36 },
  reposition: spatialTransition,
  expand: { ...spatialTransition, stiffness: 280 },
  collapse: { ...spatialTransition, damping: 38 },
  extractContext: { ...spatialTransition, stiffness: 330 },
  surfaceInsight: { ...spatialTransition, stiffness: 290 },
};

export const navVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...layoutTransition, delay: 0.12 },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};
