// Shared Framer Motion config so each per-state queue card (Queued, FoundMatch, etc.)
// morphs into the next via a shared layoutId, instead of instantly swapping.
export const cardMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
} as const;
