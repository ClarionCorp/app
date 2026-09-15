import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueueData } from '../../core/utilities/webServer';

const queueStateLabels: Record<string, string> = {
  Queued: 'Searching',
  FoundMatch: 'Match Found',
  StartingGame: 'Starting',
  InGame: 'In Match',
};

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function QueueApp() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isPreview = params.get('preview') === 'true';

  const data = useQueueData(isPreview);
  const [now, setNow] = useState(() => Date.now());
  const enteredAt = useRef<number | null>(null);

  const isQueueing = data?.queueState === 'Queued' || data?.queueState === 'FoundMatch' || data?.queueState === 'StartingGame';

  // We don't actually track queue duration yet, so keep track locally like TopBarMatchStatus does
  useEffect(() => {
    if (isQueueing) {
      if (!enteredAt.current) enteredAt.current = Date.now();
    } else {
      enteredAt.current = null;
    }
  }, [isQueueing]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!data || !isQueueing) return null;

  const seconds = enteredAt.current ? Math.max(0, Math.floor((now - enteredAt.current) / 1000)) : 0;

  return (
    <main className="relative w-full min-h-screen">
      <div className="absolute top-2 left-2 flex flex-col gap-0.5 rounded-xl border bg-black/80 border-white/10 px-4 py-2 w-fit shadow-xl">
        <span className="text-white font-bold text-2xl leading-tight">{data.queue}</span>
        <div className="flex items-center gap-2 text-white/70 text-lg">
          <span>{queueStateLabels[data.queueState] ?? data.queueState}</span>
          <span className="opacity-60">{formatDuration(seconds)}</span>
        </div>
      </div>
    </main>
  );
}
