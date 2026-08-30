import { motion } from 'framer-motion';

// mainly just so its easier to read below
// (so we're not spamming magic numbers)
export const collapsedWidth = 52;
export const expandedWidth = 250;
export const topBarHeight = 48;
export const cornerRadius = 16;
export const widthTransition = { type: 'spring', stiffness: 300, damping: 30 } as const;

interface NavCornerProps {
  hovered: boolean;
}

const far = 10000; // longer than any realistic window dimension; the svg's own bounds clip the rest

function borderPath(sidebarEdge: number) {
  return `M ${far} ${topBarHeight} L ${sidebarEdge + cornerRadius} ${topBarHeight} A ${cornerRadius} ${cornerRadius} 0 0 0 ${sidebarEdge} ${topBarHeight + cornerRadius} L ${sidebarEdge} ${far}`;
}

// TopBar and Sidebar render with no border of their own.
// This draws the entire boundary between them: TopBar, connecting curve, and Sidebar
// It does this with a single continuous path, so there's physically one line instead of two independently-drawn straight borders meeting a decorative curve.
// z-index is above both TopBar (z-50) and Sidebar (z-40) so the stroke, which lines their shared edge, always renders in front of them instead of half-disappearing behind either one.
export default function NavCorner({ hovered }: NavCornerProps) {
  const sidebarEdge = hovered ? expandedWidth : collapsedWidth;

  return (
    <>
      {/* Fills the corner nook with the panel color; the circular hole reveals the content area's rounded corner underneath */}
      <motion.div
        aria-hidden
        className="fixed pointer-events-none z-55"
        style={{
          top: topBarHeight,
          width: cornerRadius,
          height: cornerRadius,
          background: `radial-gradient(circle at bottom right, transparent ${cornerRadius}px, var(--color-surface-subtle) ${cornerRadius}px)`,
        }}
        initial={{ left: collapsedWidth }}
        animate={{ left: sidebarEdge }}
        transition={widthTransition}
      />

      <svg aria-hidden className="fixed inset-0 w-full h-full pointer-events-none z-55">
        <motion.path
          style={{ fill: 'none', stroke: 'var(--color-background-border)', strokeWidth: 1 }}
          initial={{ d: borderPath(collapsedWidth) }}
          animate={{ d: borderPath(sidebarEdge) }}
          transition={widthTransition}
        />
      </svg>
    </>
  );
}
