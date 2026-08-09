export const layoutTransition = {
  type: "spring",
  stiffness: 360,
  damping: 34,
  mass: 0.9,
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

export const navVariants = {
  initial: { opacity: 0, y: 18, x: "-50%", scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    x: "-50%",
    scale: 1,
    transition: { ...layoutTransition, delay: 0.12 },
  },
  exit: {
    opacity: 0,
    y: 12,
    x: "-50%",
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};
