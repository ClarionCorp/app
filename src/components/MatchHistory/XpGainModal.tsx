import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from '@phosphor-icons/react'
import { MatchPlayer } from '../../types/ue4ss'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)
const CHART_COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#a78bfa', '#fb923c']

function XpLineChart({ players }: { players: MatchPlayer[] }) {
  const maxGoals = Math.max(...players.map(p => (p.xpGoals ?? []).length), 0)
  const labels = Array.from({ length: maxGoals }, (_, i) => `Goal ${i + 1}`)

  return (
    <Line
      data={{
        labels,
        datasets: players.map((p, i) => ({
          label: p.name,
          data: p.xpGoals ?? [],
          borderColor: CHART_COLORS[i % CHART_COLORS.length],
          backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '22',
          borderWidth: 2,
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        })),
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } },
          },
        },
      }}
    />
  )
}

export function XpGainModal({ open, onClose, players }: { open: boolean; onClose: () => void; players: MatchPlayer[] }) {
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
              <span className="text-sm font-semibold text-char">XP Gain per Goal</span>
              <button onClick={onClose} className="text-char-subtle hover:text-char transition-colors">
                <XIcon size={16} />
              </button>
            </div>
            <XpLineChart players={players} />
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {players.map((p, pi) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[pi % CHART_COLORS.length] }} />
                  <span className="text-xs text-char-subtle">{p.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
