import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { ApiPlaceholder, Section } from './Cards'
import { RatingPoint } from '../../core/utilities/selfStats'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

// Canvas can't resolve var(...) directly, so read the theme's resolved color instead.
function themeColor(cssVar: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return value || fallback
}

function RatingChart({ points }: { points: RatingPoint[] }) {
  const color = themeColor('--theme-primary', '#7c5cff')
  return (
    <div className="h-36">
      <Line
        data={{
          labels: points.map(p => p.at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
          datasets: [{
            data: points.map(p => p.rating),
            borderColor: color,
            backgroundColor: `${color}22`,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 20,
            cubicInterpolationMode: 'monotone',
            fill: true,
          }],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { ticks: { maxTicksLimit: 4 } } },
        }}
      />
    </div>
  )
}

export default function RatingTrendSection({ points }: { points: RatingPoint[] | null }) {
  return (
    <Section title="Rating Trend">
      {points && points.length > 1
        ? <RatingChart points={points} />
        : <ApiPlaceholder label="Rating history coming soon" rows={4} />}
    </Section>
  )
}
