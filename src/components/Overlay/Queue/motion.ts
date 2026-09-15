// Shared Framer Motion config so each per-state queue card (Queued, FoundMatch, etc.)
// morphs into the next via a shared layoutId, instead of instantly swapping.
export const QUEUE_CARD_LAYOUT_ID = 'queue-status-card';

export const cardMotion = {
  layoutId: QUEUE_CARD_LAYOUT_ID,
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
} as const;
