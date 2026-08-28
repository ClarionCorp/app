import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
import { getMatchPlayers } from '../../core/database/queries';
import { MatchPlayersTable } from '../../types/database';
import { getLevelFromXP, xpThresholds } from '../../core/objects/levels';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const RECENT_POINTS = 3;
const MY_COLOR = '#25cf0e';
const ALLY_COLORS = ['#1387d4', '#261fed', '#16c4ad'];
const ENEMY_COLORS = ['#fc0303', '#ed26a7', '#e83209'];

export function XPTimeline() {
  const [players, setPlayers] = useState<MatchPlayersTable[]>([]);

  useEffect(() => {
    async function load() {
      setPlayers(await getMatchPlayers());
    }
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const withGoals = players.filter(p => p.xpGoals.length > 0);

  if (withGoals.length === 0) {
    return (
      <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
        <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
          Recent XP Trend
        </p>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
          No recent player data yet.
        </div>
      </div>
    );
  }

  const myTeamNum = players.find(p => p.isMe)?.teamNum ?? null;

  // Everyone starts a match at 600 XP, so anchor each player's series there.
  // Also guarantees a line can render (not just a dot) the moment a player has one real datapoint.
  const series = withGoals.map(p => [600, ...p.xpGoals]);
  const maxLen = Math.max(...series.map(s => s.length));
  const pointCount = Math.min(RECENT_POINTS, maxLen);
  const labels = Array.from({ length: pointCount }, (_, i) => {
    const idx = maxLen - pointCount + i;
    return idx === 0 ? 'Start' : `Goal ${idx}`;
  });

  let allyIdx = 0;
  let enemyIdx = 0;

  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Recent XP Trend
      </p>

      <div className="max-h-48">
        <Line
          data={{
            labels,
            datasets: withGoals.map((p, i) => {
              const color = p.isMe
                ? MY_COLOR
                : myTeamNum != null && p.teamNum === myTeamNum
                  ? ALLY_COLORS[allyIdx++ % ALLY_COLORS.length]
                  : ENEMY_COLORS[enemyIdx++ % ENEMY_COLORS.length];

              const recent = series[i].slice(-pointCount);
              const padded: (number | null)[] = [
                ...Array(pointCount - recent.length).fill(null),
                ...recent,
              ];

              return {
                label: p.username,
                data: padded,
                borderColor: color,
                backgroundColor: `${color}22`,
                borderWidth: p.isMe ? 3 : 2,
                pointRadius: 3,
                tension: 0.3,
                fill: false,
              };
            }),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
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
                ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } },
              },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                afterBuildTicks: (scale) => {
                  const ticks = xpThresholds
                    .filter(t => t.xp >= scale.min && t.xp <= scale.max)
                    .map(t => ({ value: t.xp }));

                  // If no threshold lands near an edge, force a tick there so that edge's level still shows.
                  const range = scale.max - scale.min;
                  const edgeGap = range * 0.15;

                  if (ticks.length === 0 || ticks[0].value - scale.min > edgeGap) {
                    ticks.unshift({ value: scale.min });
                  }
                  if (ticks.length === 0 || scale.max - ticks[ticks.length - 1].value > edgeGap) {
                    ticks.push({ value: scale.max });
                  }

                  scale.ticks = ticks;
                },
                ticks: {
                  color: 'rgba(255,255,255,0.4)',
                  font: { size: 10 },
                  callback: (value) => `Lv. ${getLevelFromXP(value as number)}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
