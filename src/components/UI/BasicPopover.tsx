import { useEffect, useRef, useState } from "react";

export default function BasicPopover({ displayText, children }: { displayText: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      setPosition({
        top: triggerRect.top - popoverRect.height - 8,
        left: triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2,
      })
    }
  }, [isOpen])

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
          className="fixed z-50 px-2 py-1 text-xs rounded bg-surface-overlay border border-background-border text-char pointer-events-none whitespace-nowrap"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {displayText}
        </div>
      )}
    </>
  )
}