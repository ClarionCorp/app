import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Section } from './Cards'
import { getCharacterFromId } from '../../core/objects/characters'
import { getMapObjectFromID } from '../../core/objects/maps'
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

export default function OverviewSection({ stats, customImgs }: { stats: SelfStats; customImgs: boolean }) {
  const losses = stats.games - stats.wins
  const topChar = stats.characters[0]
  const topCharObj = topChar ? getCharacterFromId(topChar.characterId) : undefined
  const topMap = stats.maps[0]
  const topMapObj = topMap ? getMapObjectFromID(topMap.mapId) : undefined

  return (
    <Section>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 min-w-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
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

        {/* Most played: square portrait + 16:9 map, sized so both share a height */}
        <div className="grid grid-cols-[1fr_1.778fr] gap-2 lg:flex lg:h-40 lg:shrink-0">
          {/* Most played character */}
          {topChar && (
            <div className="relative rounded-lg overflow-hidden shadow-xl bg-surface/80 min-w-0 aspect-square lg:h-full">
              <img
                src={customImgs ? topCharObj?.images.custom_portrait : topCharObj?.images.goalscore}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(10,10,10,0.95) 85%)' }} />
              <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-100 bg-black/60 rounded px-1.5 py-0.5">
                Main
              </span>
              <div className="absolute inset-x-0 bottom-0 p-2.5 min-w-0">
                <p className="text-sm font-bold text-zinc-100 truncate leading-tight">{topCharObj?.name ?? topChar.characterId}</p>
                <p className="text-[10px] text-zinc-300 truncate tabular-nums">{topChar.games} games ({winRate(topChar.wins, topChar.games)}% WR)</p>
              </div>
            </div>
          )}

          {/* Most played map */}
          {topMap && (
            <div className="relative rounded-lg overflow-hidden shadow-xl bg-surface/80 min-w-0 aspect-video lg:h-full">
              {topMapObj?.image && (
                <img
                  src={topMapObj.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none brightness-70"
                />
              )}
              <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(10,10,10,0.95) 85%)' }} />
              <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-100 bg-black/60 rounded px-1.5 py-0.5">
                Most Played
              </span>
              <div className="absolute inset-x-0 bottom-0 p-2.5 min-w-0">
                <p className="text-sm font-bold text-zinc-100 truncate leading-tight">{topMapObj?.mapName ?? topMap.mapId}</p>
                <p className="text-[10px] text-zinc-300 truncate tabular-nums">{topMap.games} games ({winRate(topMap.wins, topMap.games)}% WR)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
