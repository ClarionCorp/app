import { ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import { CloudSlashIcon } from '@phosphor-icons/react'
import clsx from 'clsx'

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      variants={sectionVariants}
      className={clsx('bg-surface-subtle border border-background-border rounded-xl p-4 min-w-0', className)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-xs uppercase font-semibold tracking-widest text-char-subtle truncate">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: string // text color class for the value
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-surface-border bg-surface-raised/10 px-3 py-2.5 min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-char-subtle truncate">{label}</span>
      <span className={clsx('text-lg font-bold leading-tight tabular-nums truncate', accent ?? 'text-char')}>{value}</span>
      {sub && <span className="text-[10px] text-char-subtle truncate">{sub}</span>}
    </div>
  )
}

export function WinRateBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-match-loss/25 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-match-win"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

// Rendered for sections that depend on APIs that don't exist yet
export function ApiPlaceholder({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div className="relative rounded-lg border border-dashed border-background-border p-3 overflow-hidden">
      <div className="space-y-2 opacity-40">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-surface-overlay animate-pulse"
            style={{ width: `${90 - i * 18}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs text-char-subtle">
        <CloudSlashIcon size={14} />
        {label}
      </div>
    </div>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-xs text-char-subtle text-center py-4">{children}</p>
}
