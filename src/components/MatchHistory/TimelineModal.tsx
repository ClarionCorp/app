import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from '@phosphor-icons/react'
import { MatchPlayer, TimelineEntry } from '../../types/ue4ss'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const CHART_COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#a78bfa', '#fb923c']

function formatElapsed(start: Date | string, end: Date | string): string {
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

interface TimelineChartProps {
  players: MatchPlayer[]
  timeline: TimelineEntry[]
  myTeam: number
}

function TimelineChart({ players, timeline, myTeam }: TimelineChartProps) {
  const safeTimeline = timeline ?? []
  const gameStart = safeTimeline.find(e => e.event === 'GAME_START')

  // Walk the timeline to collect goal events and flag which ones won a set
  const goalEvents: TimelineEntry[] = []
  const setWinnerGoals = new Set<number>()
  for (let i = 0; i < safeTimeline.length; i++) {
    if (safeTimeline[i].event === 'GOAL_SCORE') {
      const idx = goalEvents.length
      goalEvents.push(safeTimeline[i])
      if (safeTimeline[i + 1]?.event === 'WON_SET') setWinnerGoals.add(idx)
    }
  }

  const maxGoals = Math.max(...players.map(p => (p.xpGoals ?? []).length), 0)

  const labels = Array.from({ length: maxGoals }, (_, i) => {
    const event = goalEvents[i]
    if (!event || !gameStart) return `G${i + 1}`
    const t = formatElapsed(gameStart.when, event.when)
    return setWinnerGoals.has(i) ? `${t} (Set)` : t
  })

  const tickColors = labels.map((_, i) => {
    const event = goalEvents[i]
    if (!event) return 'rgba(255,255,255,0.4)'
    return event.team === myTeam ? '#60a5fa' : '#f87171'
  })

  const pointRadii = Array.from({ length: maxGoals }, (_, i) =>
    setWinnerGoals.has(i) ? 5 : 4
  )

  return (
    <Line
      data={{
        labels,
        datasets: players.map((p, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length]
          const pointBg = Array.from({ length: maxGoals }, (_, j) =>
            setWinnerGoals.has(j) ? color : 'transparent'
          )
          return {
            label: p.name,
            data: p.xpGoals ?? [],
            borderColor: color,
            backgroundColor: color + '22',
            borderWidth: 2,
            pointRadius: pointRadii,
            pointBorderColor: color,
            pointBackgroundColor: pointBg,
            pointBorderWidth: 2,
            tension: 0.3,
            fill: false,
          }
        }),
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString() ?? '—'} XP`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: tickColors, font: { size: 10 } },
          },
          y: {
            title: { display: true, text: 'XP', color: 'rgba(255,255,255,0.4)', font: { size: 10 } },
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } },
          },
        },
      }}
    />
  )
}

interface TimelineModalProps {
  open: boolean
  onClose: () => void
  players: MatchPlayer[]
  timeline: TimelineEntry[]
  myTeam: number
}

export function TimelineModal({ open, onClose, players, timeline, myTeam }: TimelineModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-overlay/60" onClick={onClose} />
          <motion.div
            className="relative z-10 w-135 max-w-[95vw] rounded-xl bg-surface border border-background-border shadow-xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-char">Match Timeline</span>
                <p className="text-[11px] text-char-subtle mt-0.5">XP gained per player at each goal</p>
              </div>
              <button onClick={onClose} className="text-char-subtle hover:text-char transition-colors">
                <XIcon size={16} />
              </button>
            </div>
            <TimelineChart players={players} timeline={timeline} myTeam={myTeam} />
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {players.map((p, pi) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[pi % CHART_COLORS.length] }} />
                    <span className="text-xs text-char-subtle">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs text-char-subtle">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                  Ally goal
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f87171]" />
                  Enemy goal
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-char-subtle shrink-0" />
                  Set win
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
