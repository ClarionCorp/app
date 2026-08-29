import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
import { XIcon } from '@phosphor-icons/react';
import { fetchOnlineGraphs } from '../core/utilities/appAPI';
import { OnlineHistoryObjV1, OnlineHistoryV1 } from '../types/appAPI';
import { AppAPIRegion, getRegionObjectFromAPIRegion } from '../core/objects/regions';
import { getOnlineStatusLevel, ONLINE_STATUS_CLASSES, ONLINE_STATUS_HEX } from '../core/objects/onlineStatus';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

// Canvas fillStyle can't resolve var(...) directly, so read the theme's resolved color instead.
function themeColor(cssVar: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}

const REGION_ORDER: AppAPIRegion[] = ['Global', 'NorthAmerica', 'Europe', 'Oceania', 'SouthAmerica', 'Japan', 'Asia'];

function formatTime(when: Date | string): string {
  return new Date(when).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

interface RegionGraphProps {
  region: AppAPIRegion;
  points: OnlineHistoryObjV1[];
}

function RegionGraph({ region, points }: RegionGraphProps) {
  const label = getRegionObjectFromAPIRegion(region).name;
  const sorted = [...points].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const latest = sorted[sorted.length - 1];
  const level = getOnlineStatusLevel(region, latest?.totalCount ?? 0);
  const lineColor = ONLINE_STATUS_HEX[level];

  // Carry the last known value forward to a synthetic "Now" point, so the line always reaches the right edge.
  const labels = [...sorted.map(p => formatTime(p.createdAt)), 'Now'];
  const values = [...sorted.map(p => p.totalCount), latest?.totalCount ?? 0];

  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle">{label}</p>
        {latest && (
          <p className="text-xs text-char-subtle">
            <span className={`font-medium ${ONLINE_STATUS_CLASSES[level]}`}>{latest.totalCount}</span> online
          </p>
        )}
      </div>

      {sorted.length < 2 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
          Not enough data yet.
        </div>
      ) : (
        <div className="h-40">
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Online',
                  data: values,
                  borderColor: lineColor,
                  backgroundColor: `${lineColor}22`,
                  borderWidth: 2,
                  pointRadius: 0,
                  pointHitRadius: 20,
                  cubicInterpolationMode: 'monotone',
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { display: false },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    label: ctx => `Online: ${ctx.parsed.y}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: '#85828B0D' },
                  ticks: {
                    color: themeColor('--color-char-subtle', 'rgba(255,255,255,0.4)'),
                    font: { size: 9 },
                    maxTicksLimit: 6,
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#85828B0D' },
                  ticks: {
                    color: themeColor('--color-char-subtle', 'rgba(255,255,255,0.4)'),
                    font: { size: 9 },
                    precision: 0,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

function RegionGraphSkeleton() {
  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4 w-full animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 rounded bg-surface-active" />
        <div className="h-3 w-14 rounded bg-surface-active" />
      </div>
      <div className="h-40 rounded-lg bg-surface-active" />
    </div>
  );
}

function CounterStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-semibold text-char">{value}</span>
      <span className="text-[11px] uppercase tracking-widest text-char-subtle">{label}</span>
    </div>
  );
}

function CounterStatSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 animate-pulse">
      <div className="h-7 w-10 rounded bg-surface-active" />
      <div className="h-2.5 w-14 rounded bg-surface-active" />
    </div>
  );
}

interface OnlineGraphsProps {
  open: boolean;
  onClose: () => void;
}

export default function OnlineGraphs({ open, onClose }: OnlineGraphsProps) {
  const [data, setData] = useState<OnlineHistoryV1 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const result = await fetchOnlineGraphs();
        if (!cancelled) setData(result);
      } catch (e) {
        console.error('Failed to fetch online graphs:', e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [open]);

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
            className="relative z-10 w-3xl max-w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl bg-surface border border-background-border shadow-xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-char">Online Players</span>
                <p className="text-xs text-char-subtle mt-0.5">Graphical trends for each region, from the last 36h.</p>
              </div>
              <button onClick={onClose} className="text-char-subtle hover:text-char transition-colors cursor-pointer border-2 rounded-md border-surface-raised">
                <XIcon size={20} />
              </button>
            </div>

            {loading && !data ? (
              <>
                <div className="flex items-center justify-center gap-10 py-2">
                  <CounterStatSkeleton />
                  <CounterStatSkeleton />
                  <CounterStatSkeleton />
                </div>
                <div className="flex flex-col gap-4">
                  {REGION_ORDER.map(region => (
                    <RegionGraphSkeleton key={region} />
                  ))}
                </div>
              </>
            ) : error && !data ? (
              <div className="flex items-center justify-center min-h-32 text-sm text-char-subtle">Failed to load online history.</div>
            ) : (
              <>
                {data && (
                  <div className="flex items-center justify-center gap-10 py-2">
                    <CounterStat value={data.counts.in_game} label="In Game" />
                    <CounterStat value={data.counts.idling} label="Idling" />
                    <CounterStat value={data.counts.seen} label="Seen" />
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {REGION_ORDER.map(region => (
                    <RegionGraph key={region} region={region} points={data?.history[region] ?? []} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
