import { useEffect, useRef, useState } from "react";

export default function BasicPopover({ displayText, children, preferBelow = false }: { displayText: string; children: React.ReactNode; preferBelow?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const margin = 8
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()

      const top = preferBelow
        ? triggerRect.bottom + margin
        : triggerRect.top - popoverRect.height - margin
      const left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2

      const maxTop = window.innerHeight - popoverRect.height - margin
      const maxLeft = window.innerWidth - popoverRect.width - margin

      setPosition({
        top: Math.min(Math.max(top, margin), Math.max(maxTop, margin)),
        left: Math.min(Math.max(left, margin), Math.max(maxLeft, margin)),
      })
    }
  }, [isOpen, preferBelow])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center justify-center shrink-0"
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-62 px-2 py-1 text-xs rounded bg-surface-overlay border border-background-border text-char pointer-events-none whitespace-nowrap"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {displayText}
        </div>
      )}
    </>
  )
}