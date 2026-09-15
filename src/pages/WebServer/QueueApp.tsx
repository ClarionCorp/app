import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQueueData } from '../../core/utilities/webServer';
import Queued from '../../components/Overlay/Queue/Queued';
import FoundMatch from '../../components/Overlay/Queue/FoundMatch';

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
  const isSearching = data.queueState === 'Queued';
  const isFoundMatch = data.queueState === 'FoundMatch';

  return (
    <main className="relative w-full min-h-screen">
      <AnimatePresence>
        {isSearching && <Queued key="queued" queue={data.queue} seconds={seconds} />}
        {isFoundMatch && <FoundMatch key="found" queue={data.queue} />}
      </AnimatePresence>
    </main>
  );
}
