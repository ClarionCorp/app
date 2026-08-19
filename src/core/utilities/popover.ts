// Positions a fixed-position popover under (or, if there's no room, above) a trigger element,
// clamped so it never renders outside the viewport.
export function getClampedPopoverPosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  margin = 8,
  gap = 8
): { top: number; left: number } {
  let left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - popoverRect.width - margin));

  let top = triggerRect.bottom + gap;
  if (top + popoverRect.height > window.innerHeight - margin) {
    top = triggerRect.top - popoverRect.height - gap;
  }
  top = Math.max(margin, top);

  return { top, left };
}
