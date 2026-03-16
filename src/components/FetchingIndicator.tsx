// stolen from cc pepelaugh
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

type FetchingIndicatorProps = {
  /** Controls whether the spinner/label panel is shown. Backdrop is always shown. */
  show: boolean
  /** Show the spinner when `show` is true. Default: true */
  showSpinner?: boolean
  /** Show the label when `show` is true AND a label is provided. Default: true */
  showLabel?: boolean
  /** Text to show next to the spinner. If omitted, no label text renders. */
  label?: string
  /** Apply backdrop blur. Default: true */
  blur?: boolean
  /** Z-index utility for stacking. Default: 'z-[9999]' */
  zIndexClassName?: string
  /** Prevent page scroll while the overlay is mounted. Default: true */
  blockScroll?: boolean
  /** Extra classes for the inner panel */
  panelClassName?: string
}

export default function FetchingIndicator({
  show,
  showSpinner = true,
  showLabel = true,
  label = 'Loading…',
  blur = true,
  zIndexClassName = 'z-[1000]',
  blockScroll = true,
  panelClassName = '',
}: FetchingIndicatorProps) {
  // Lock scroll while the overlay is present
  useEffect(() => {
    if (!blockScroll) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [blockScroll])

  // Decide if we actually render the inner panel (card)
  const renderPanel = show && (showSpinner || (showLabel && !!label))

  return (
    <div
      role="presentation"
      className={clsx(
        'fixed inset-0',
        'flex items-center justify-center p-6',
        'bg-black/40',
        blur && 'backdrop-blur-sm',
        zIndexClassName
      )}
    >
      {/* Animate the panel only; backdrop is always mounted */}
      <AnimatePresence>
        {renderPanel && (
          <motion.div
            key="panel"
            className={clsx(
              'flex items-center gap-4 rounded-xl bg-gray-900/40 border border-zinc-800 px-4 py-3 shadow-xl',
              panelClassName
            )}
            initial={{ scale: 0.98, y: 6, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 6, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.28 }}
            role="alert"
            aria-busy="true"
          >
            {showSpinner && (
              <span
                aria-hidden
                className="inline-block h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin"
              />
            )}
            {showLabel && !!label && (
              <span className="text-sm text-white/90">{label}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}