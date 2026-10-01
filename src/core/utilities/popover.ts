// Positions a fixed-position popover under (or, if there's no room, above) a trigger element,
// clamped so it never renders outside the viewport. Pass preferAbove to flip the preferred side.
export function getClampedPopoverPosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  margin = 8,
  gap = 8,
  preferAbove = false
): { top: number; left: number } {
  let left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - popoverRect.width - margin));

  const below = triggerRect.bottom + gap;
  const above = triggerRect.top - popoverRect.height - gap;

  let top: number;
  if (preferAbove) {
    top = above >= margin ? above : below;
  } else {
    top = below + popoverRect.height <= window.innerHeight - margin ? below : above;
  }
  top = Math.max(margin, top);

  return { top, left };
}
