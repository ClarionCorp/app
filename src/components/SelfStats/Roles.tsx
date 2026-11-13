import { Radar } from 'react-chartjs-2'
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import { EmptyNote, Section, WinRateBar } from './Cards'
import { RoleTotals, SelfStats, winRate } from '../../core/utilities/selfStats'

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

// Canvas can't resolve var(...) directly, so read the theme's resolved color instead.
function themeColor(cssVar: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return value || fallback
}

type Role = keyof SelfStats['roles']

// Clockwise from the top. Forward stats cluster at the top, Goalie stats at the bottom, Shared stats on the sides.
// "Multiplier" weights each per-game stat relative to Scores (1x), shared across both roles.
// Since the polygon is stretched to its strongest stat, only the multipliers' ratios to each other matter.
// Fractions read as "N of this stat is worth 1 score", (e.g. 1 / 2500 means 2500 damage counts as much as 1 score)
const AXES: { label: string; key: keyof RoleTotals; multiplier: number; digits: number }[] = [
  { label: 'Scores', key: 'goals', multiplier: 1, digits: 1 },
  { label: 'Shots', key: 'shots', multiplier: 1 / 8, digits: 0 },
  { label: 'Damage', key: 'damage', multiplier: 1 / 2500, digits: 0 },
  { label: 'Redirects', key: 'redirects', multiplier: 1 / 30, digits: 0 },
  { label: 'Saves', key: 'saves', multiplier: 1 / 15, digits: 0 },
  { label: 'Orbs', key: 'orbs', multiplier: 1 / 4, digits: 1 },
  { label: 'Assists', key: 'assists', multiplier: 2, digits: 1 },
  { label: 'Knockouts', key: 'kos', multiplier: 1.25, digits: 1 },
]

// Minimum radius (as % of the dial) for any point, so a 0 stat never sits dead center
const RADAR_FLOOR = 15

function PlaystyleRadar({ totals, colorVar, fallback }: { totals: RoleTotals; colorVar: string; fallback: string }) {
  const color = themeColor(colorVar, fallback)
  const gridColor = themeColor('--theme-surface-border', '#3f3f46')
  const labelColor = themeColor('--theme-char-subtle', '#a1a1aa')

  const averages = AXES.map(a => totals[a.key] / totals.games)
  const ratios = AXES.map((a, i) => averages[i] * a.multiplier)

  // Stretch so the strongest stat reaches the edge, and keep a floor so near-zero stats
  // sit on an inner ring instead of collapsing into the center and breaking the shape.
  const peak = Math.max(...ratios)
  const scaled = ratios.map(r => RADAR_FLOOR + (100 - RADAR_FLOOR) * (peak > 0 ? r / peak : 0))

  return (
    <div className="aspect-square w-full max-w-80 mx-auto">
      <Radar
        data={{
          labels: AXES.map(a => a.label),
          datasets: [{
            data: scaled,
            borderColor: color,
            backgroundColor: `${color}33`,
            borderWidth: 2,
            pointRadius: 2,
            pointHitRadius: 12,
            pointBackgroundColor: color,
            fill: true,
          }],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `${averages[ctx.dataIndex].toFixed(AXES[ctx.dataIndex].digits)} per game`,
              },
            },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { display: false, stepSize: 25 },
              grid: { color: gridColor },
              angleLines: { color: gridColor },
              pointLabels: { color: labelColor, font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  )
}

function RoleColumn({ role, totals, colorVar, fallback }: { role: Role; totals: RoleTotals; colorVar: string; fallback: string }) {
  const wr = winRate(totals.wins, totals.games)

  return (
    <div className="flex-1 min-w-0 rounded-lg border border-surface-border bg-surface-raised/10 p-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-char">{role}</span>
        <span className="text-[10px] text-char-subtle">{totals.games} games</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-char-subtle mb-1">
          <span>Win rate</span>
          <span className="tabular-nums">{wr}%</span>
        </div>
        <WinRateBar percent={wr} />
      </div>

      {totals.games > 0
        ? <PlaystyleRadar totals={totals} colorVar={colorVar} fallback={fallback} />
        : <EmptyNote>No {role} games for these filters.</EmptyNote>}
    </div>
  )
}

export default function RolesSection({ roles }: { roles: SelfStats['roles'] }) {
  return (
    <Section title="Roles">
      <div className="flex flex-col sm:flex-row gap-2">
        <RoleColumn role="Forward" totals={roles.Forward} colorVar="--theme-primary" fallback="#7c5cff" />
        <RoleColumn role="Goalie" totals={roles.Goalie} colorVar="--theme-secondary" fallback="#22d3ee" />
      </div>
    </Section>
  )
}
