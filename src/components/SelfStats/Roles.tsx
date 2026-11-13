import { Section, WinRateBar } from './Cards'
import { perGame, RoleTotals, SelfStats, winRate } from '../../core/utilities/selfStats'

function RoleColumn({ role, totals }: { role: string; totals: RoleTotals }) {
  const isForward = role === 'Forward'
  const rows: [string, number][] = isForward
    ? [['Goals', totals.goals], ['Assists', totals.assists], ['KOs', totals.kos], ['Shots', totals.shots], ['Damage', totals.damage], ['Orbs', totals.orbs]]
    : [['Saves', totals.saves], ['Assists', totals.assists], ['Redirects', totals.redirects], ['KOs', totals.kos], ['Damage', totals.damage], ['Orbs', totals.orbs]]

  return (
    <div className="flex-1 min-w-0 rounded-lg border border-surface-border bg-surface-raised/10 p-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-char">{role}</span>
        <span className="text-[10px] text-char-subtle">{totals.games} games</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-char-subtle mb-1">
          <span>Win rate</span>
          <span className="tabular-nums">{winRate(totals.wins, totals.games)}%</span>
        </div>
        <WinRateBar percent={winRate(totals.wins, totals.games)} />
      </div>
      <div className="text-[10px] text-char-subtle mb-1">Per game</div>
      <div className="space-y-1">
        {rows.map(([label, total]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-char-subtle">{label}</span>
            <span className="font-semibold text-char tabular-nums">{perGame(total, totals.games, label === 'Damage' ? 0 : 1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RolesSection({ roles }: { roles: SelfStats['roles'] }) {
  return (
    <Section title="Roles">
      <div className="flex flex-col sm:flex-row gap-2">
        <RoleColumn role="Forward" totals={roles.Forward} />
        <RoleColumn role="Goalie" totals={roles.Goalie} />
      </div>
    </Section>
  )
}
