import { FireIcon, SnowflakeIcon } from '@phosphor-icons/react'
import { Section, StatTile } from './Cards'
import { formatPlaytime, SelfStats, winRate } from '../../core/utilities/selfStats'

export default function OverviewSection({ stats }: { stats: SelfStats }) {
  const wr = winRate(stats.wins, stats.games)

  return (
    <Section title="Overview">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <StatTile label="Matches" value={stats.games} sub={`${stats.wins}W · ${stats.games - stats.wins}L`} />
        <StatTile label="Win Rate" value={`${wr}%`} accent={wr >= 50 ? 'text-match-win' : 'text-match-loss'} />
        <StatTile label="MVP Rate" value={`${winRate(stats.mvps, stats.games)}%`} sub={`${stats.mvps} MVPs`} />
        <StatTile label="Time Played" value={formatPlaytime(stats.totalSeconds)} />
        <StatTile label="Avg Match" value={formatPlaytime(stats.totalSeconds / stats.games)} />
        <StatTile
          label="Streak"
          value={
            <span className="flex items-center gap-1">
              {stats.currentStreak?.won
                ? <FireIcon size={16} weight="fill" className="text-match-win" />
                : <SnowflakeIcon size={16} weight="fill" className="text-match-loss" />}
              {stats.currentStreak?.count}{stats.currentStreak?.won ? 'W' : 'L'}
            </span>
          }
          sub={`Best: ${stats.bestWinStreak}W`}
        />
      </div>
    </Section>
  )
}
