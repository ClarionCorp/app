import { motion } from 'framer-motion'
import { FireIcon, SnowflakeIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { Section } from './Cards'
import { formatPlaytime, SelfStats, winRate } from '../../core/utilities/selfStats'

function WinRateRing({ percent }: { percent: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const positive = percent >= 50

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-match-loss/25" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percent / 100) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="stroke-match-win"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx('text-2xl font-black tabular-nums leading-none', positive ? 'text-match-win' : 'text-match-loss')}>
          {percent}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-char-subtle mt-1">Win Rate</span>
      </div>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="min-w-0 py-2 px-3">
      <p className="text-[10px] uppercase tracking-wider text-char-subtle truncate">{label}</p>
      <p className="text-xl font-bold text-char tabular-nums leading-tight truncate">{value}</p>
      {sub && <p className="text-[10px] text-char-subtle truncate">{sub}</p>}
    </div>
  )
}

export default function OverviewSection({ stats }: { stats: SelfStats }) {
  const losses = stats.games - stats.wins
  const streak = stats.currentStreak
  const onWinStreak = streak?.won ?? false

  return (
    <Section title="Overview">
      <div className="flex items-center gap-4 min-w-0">
        {/* Hero: win rate */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <WinRateRing percent={winRate(stats.wins, stats.games)} />
          <p className="text-xs font-semibold tabular-nums">
            <span className="text-match-win">{stats.wins}W</span>
            <span className="text-char-subtle"> / </span>
            <span className="text-match-loss">{losses}L</span>
          </p>
        </div>

        {/* Secondary stats */}
        <div className="flex-1 min-w-0 grid grid-cols-2 divide-x divide-surface-border/50 [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-surface-border/50">
          <MiniStat label="Matches" value={stats.games} />
          <MiniStat label="MVP Rate" value={`${winRate(stats.mvps, stats.games)}%`} sub={`${stats.mvps} MVPs`} />
          <MiniStat label="Time Played" value={formatPlaytime(stats.totalSeconds)} />
          <MiniStat label="Avg Match" value={formatPlaytime(stats.totalSeconds / stats.games)} />
        </div>
      </div>

      {/* Streak banner */}
      {streak && (
        <div
          className={clsx(
            'mt-4 flex items-center justify-between gap-3 rounded-lg px-3 py-2',
            onWinStreak ? 'bg-match-win/10' : 'bg-match-loss/10'
          )}
        >
          <span className={clsx('flex items-center gap-2 text-sm font-semibold min-w-0', onWinStreak ? 'text-match-win' : 'text-match-loss')}>
            {onWinStreak ? <FireIcon size={18} weight="fill" className="shrink-0" /> : <SnowflakeIcon size={18} weight="fill" className="shrink-0" />}
            <span className="truncate">{streak.count} game {onWinStreak ? 'win' : 'loss'} streak</span>
          </span>
          <span className="text-xs text-char-subtle tabular-nums shrink-0">Best: {stats.bestWinStreak}W</span>
        </div>
      )}
    </Section>
  )
}
