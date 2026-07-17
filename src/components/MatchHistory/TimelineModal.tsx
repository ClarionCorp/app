import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleIcon, XIcon } from '@phosphor-icons/react'
import { MatchPlayer, TimelineEntry } from '../../types/ue4ss'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const MY_COLOR = '#25cf0e'
const ALLY_COLORS = ['#1387d4', '#261fed', '#16c4ad']
const ENEMY_COLORS = ['#fc0303', '#ed26a7', '#e83209']

function getPlayerColors(players: MatchPlayer[], myTeam: number, myPlayerId: string | null): string[] {
  let allyIdx = 0
  let enemyIdx = 0
  return players.map(p => {
    if (p.playerId === myPlayerId) return MY_COLOR
    if (p.team === myTeam) return ALLY_COLORS[allyIdx++ % ALLY_COLORS.length]
    return ENEMY_COLORS[enemyIdx++ % ENEMY_COLORS.length]
  })
}

function formatElapsed(start: Date | string, end: Date | string): string {
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

interface TimelineChartProps {
  players: MatchPlayer[]
  colors: string[]
  timeline: TimelineEntry[]
  myTeam: number
  hiddenPlayers: Set<string>
}

function TimelineChart({ players, colors, timeline, myTeam, hiddenPlayers }: TimelineChartProps) {
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
  const totalPoints = maxGoals + 1 // +1 for Start

  const labels = Array.from({ length: totalPoints }, (_, i) => {
    if (i === 0) return 'Start'
    const goalIdx = i - 1
    const event = goalEvents[goalIdx]
    if (!event || !gameStart) return `G${i}`
    const t = formatElapsed(gameStart.when, event.when)
    if (setWinnerGoals.has(goalIdx)) return `${t} (${event.team === myTeam ? 'Won' : 'Lost'} Set)`
    return t
  })

  const tickColors = labels.map((_, i) => {
    if (i === 0) return 'rgba(255,255,255,0.4)'
    const event = goalEvents[i - 1]
    if (!event) return 'rgba(255,255,255,0.4)'
    return event.team === myTeam ? '#60a5fa' : '#f87171'
  })

  return (
    <Line
      data={{
        labels,
        datasets: players.filter(p => !hiddenPlayers.has(p.name)).map(p => {
          const color = colors[players.indexOf(p)]
          return {
            label: p.name,
            data: [600, ...(p.xpGoals ?? [])],
            borderColor: color,
            backgroundColor: color + '22',
            borderWidth: 2,
            pointRadius: 0,
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
            grid: {
              color: (ctx: { index: number }) => {
                const i = ctx.index
                const c = tickColors[i]
                if (!c || c === 'rgba(255,255,255,0.4)') return 'rgba(255,255,255,0.05)'
                return c + (setWinnerGoals.has(i - 1) ? '66' : '33')
              },
            },
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
  myPlayerId: string | null
}

export function TimelineModal({ open, onClose, players, timeline, myTeam, myPlayerId }: TimelineModalProps) {
  const playerColors = getPlayerColors(players, myTeam, myPlayerId)
  const [hiddenPlayers, setHiddenPlayers] = useState<Set<string>>(new Set())

  const togglePlayer = (name: string) =>
    setHiddenPlayers(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

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
          <div className="absolute inset-0 bg-overlay/80" onClick={onClose} />
          <motion.div
            className="relative z-10 w-3xl max-w-[95vw] rounded-xl bg-surface border border-background-border shadow-xl p-5 flex flex-col gap-4"
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
              <button onClick={onClose} className="text-char-subtle hover:text-char transition-colors cursor-pointer">
                <XIcon size={16} />
              </button>
            </div>
            <TimelineChart players={players} colors={playerColors} timeline={timeline} myTeam={myTeam} hiddenPlayers={hiddenPlayers} />
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {players.map((p, pi) => {
                  const hidden = hiddenPlayers.has(p.name)
                  const color = playerColors[pi]
                  return (
                    <button
                      key={p.name}
                      onClick={() => togglePlayer(p.name)}
                      className="flex items-center gap-1.5 cursor-pointer transition-opacity"
                      style={{ opacity: hidden ? 0.35 : 1 }}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border-2 transition-colors"
                        style={{ borderColor: color, backgroundColor: hidden ? 'transparent' : color }}
                      />
                      <span className="text-xs text-char-subtle">{p.name}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs text-char-subtle">
                <div className="flex items-center gap-1">
                  <CircleIcon size={12} weight='fill' className='text-[#60a5fa]' />
                  Our Goals
                </div>
                <div className="flex items-center gap-1">
                  <CircleIcon size={12} weight='fill' className='text-[#f87171]' />
                  Enemy Goals
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
