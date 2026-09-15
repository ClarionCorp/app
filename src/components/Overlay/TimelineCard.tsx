import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { LiveMatchPlayer } from '../../core/overlay'
import { TimelineEntry } from '../../types/ue4ss'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const OUR_COLOR = '#3B82F6'
const ENEMY_COLOR = '#EF4444'

const ME_COLOR = '#2fe010'
const ALLY_COLORS = ['#2f40fa', '#1db8f5']
const ENEMY_COLORS = ['#f21322', '#ed26a7', '#f06f13']

function buildPlayerColors(allies: LiveMatchPlayer[], enemies: LiveMatchPlayer[]) {
  const colors = new Map<string, string>()

  let allyIndex = 0
  for (const player of allies) {
    if (player.isMe) {
      colors.set(player.playerId, ME_COLOR)
    } else {
      colors.set(player.playerId, ALLY_COLORS[allyIndex % ALLY_COLORS.length])
      allyIndex++
    }
  }

  let enemyIndex = 0
  for (const player of enemies) {
    colors.set(player.playerId, ENEMY_COLORS[enemyIndex % ENEMY_COLORS.length])
    enemyIndex++
  }

  return colors
}

function buildGoalPoints(timeline: TimelineEntry[]) {
  const points: { team: 1 | 2; isSet: boolean }[] = []

  for (const entry of timeline) {
    if (entry.event === 'GOAL_SCORE' && entry.team) {
      points.push({ team: entry.team, isSet: false })
    } else if (entry.event === 'WON_SET' && entry.team) {
      const last = points[points.length - 1]
      if (last && last.team === entry.team) {
        last.isSet = true
      } else {
        points.push({ team: entry.team, isSet: true })
      }
    }
  }

  return points
}

export default function TimelineCard({
  timeline,
  players,
  myTeam,
}: {
  timeline: TimelineEntry[] | null
  players: LiveMatchPlayer[]
  myTeam: 1 | 2
}) {
  if (!timeline || timeline.length === 0) return null;

  const goalPoints = buildGoalPoints(timeline)

  if (goalPoints.length === 0) return null;
  if (players.length === 0) return null;

  const labels = goalPoints.map((p, i) => `Goal ${i + 1}${p.isSet ? ' (Set)' : ''}`)
  const pointBorderColor = goalPoints.map((p) => (p.team === myTeam ? OUR_COLOR : ENEMY_COLOR))
  const pointBackgroundColor = goalPoints.map((p, i) => (p.isSet ? pointBorderColor[i] : 'transparent'))

  const allies = players.filter((p) => p.teamNumber === myTeam)
  const enemies = players.filter((p) => p.teamNumber !== myTeam)
  const playerColors = buildPlayerColors(allies, enemies)
  const orderedPlayers = [...allies, ...enemies]

  return (
    <div className="rounded-3xl border bg-black/80 border-white/10 px-1 pt-1 w-full h-50 flex flex-col">
      <div className="flex flex-col items-center gap-0.5 text-[11px]">
        <div className="flex justify-center gap-3">
          {allies.map((player) => (
            <span key={player.playerId} className="flex items-center gap-1 text-white/80">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: playerColors.get(player.playerId) }}
              />
              {player.username}
            </span>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          {enemies.map((player) => (
            <span key={player.playerId} className="flex items-center gap-1 text-white/80">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: playerColors.get(player.playerId) }}
              />
              {player.username}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Line
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} xp`,
                },
              },
            },
            scales: {
              x: {
                grid: { color: (ctx) => `${pointBorderColor[ctx.index] ?? '#85828B'}80` },
                ticks: { display: false },
              },
              y: {
                grid: { color: '#85828B10' },
                ticks: { color: 'rgba(255,255,255,0.7)', callback: (value) => `${value} xp` },
              },
            },
          }}
          data={{
            labels,
            datasets: orderedPlayers.map((player) => {
              const color = playerColors.get(player.playerId) ?? ME_COLOR

              return {
                label: player.username,
                data: player.xpGoals,
                borderColor: color,
                backgroundColor: color,
                pointBackgroundColor,
                pointBorderColor,
                pointBorderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.3,
              }
            }),
          }}
        />
      </div>
    </div>
  )
}
