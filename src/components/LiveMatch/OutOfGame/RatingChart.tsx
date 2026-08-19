import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
import gradient from 'chartjs-plugin-gradient';
import { getRankFromLP } from '../../../core/objects/ranks';
import { GameSessionsTable } from '../../../types/database';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler, gradient);

// Canvas fillStyle can't resolve var(...) directly, so read the theme's resolved color instead.
function themeColor(cssVar: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}

export function RatingChart({ session }: { session: GameSessionsTable | null }) {
  const data = session?.endOfMatchLPs ?? [];

  if (data.length < 2) {
    return (
      <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
        <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
          Rating This Session
        </p>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
          Not enough matches played this session yet.
        </div>
      </div>
    );
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const bottomLine = Math.floor(minVal / 100) * 100;
  const topLine = Math.ceil(maxVal / 100) * 100;
  const lastColor = getRankFromLP(data[data.length - 1]).color;

  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Rating This Session
      </p>

      <div className="max-h-56">
        <Line
          data={{
            labels: data.map((_, i) => `Match ${i + 1}`),
            datasets: [
              {
                label: 'Rating',
                data,
                fill: true,
                cubicInterpolationMode: 'monotone',
                borderWidth: 2,
                pointRadius: 6,
                pointHitRadius: 15,
                pointBackgroundColor: data.map(v => getRankFromLP(v).color),
                pointBorderColor: data.map(v => getRankFromLP(v).color),
                gradient: {
                  backgroundColor: {
                    axis: 'y',
                    colors: {
                      [bottomLine]: 'transparent',
                      [topLine]: `${lastColor}52`,
                    },
                  },
                  borderColor: {
                    axis: 'x',
                    colors: Object.fromEntries(data.map((v, i) => [i, getRankFromLP(v).color])),
                  },
                },
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: { top: 10, right: 14 },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => `Rating: ${ctx.parsed.y} (${getRankFromLP(ctx.parsed.y).name})`,
                },
              },
            },
            scales: {
              x: {
                grid: { color: '#85828B0D' },
                ticks: { color: themeColor('--color-char-subtle', 'rgba(255,255,255,0.4)'), font: { size: 10 } },
              },
              y: {
                min: bottomLine,
                max: topLine,
                grid: { color: '#85828B0D' },
                ticks: {
                  stepSize: 100,
                  callback: (value) => {
                    const rank = getRankFromLP(value as number);
                    return rank.threshold === value ? rank.name : value;
                  },
                  color: (ctx) => getRankFromLP(ctx.tick.value)?.color || 'white',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
