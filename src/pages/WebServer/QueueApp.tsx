import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

  // Auto-fit the card to whatever OBS source size it's given. 
  // Scale comes from a hidden fixed reference, not the active card, so switching states doesn't change the zoom level.
  const viewportRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const reference = referenceRef.current;
    if (!viewport || !reference) return;

    const measure = () => {
      const naturalWidth = reference.scrollWidth;
      const naturalHeight = reference.scrollHeight;
      if (!naturalWidth || !naturalHeight) return;
      const { width, height } = viewport.getBoundingClientRect();
      setScale(Math.min(width / naturalWidth, height / naturalHeight));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(reference);
    return () => observer.disconnect();
  }, []);

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

  const seconds = enteredAt.current ? Math.max(0, Math.floor((now - enteredAt.current) / 1000)) : 0;
  const isSearching = data?.queueState === 'Queued';
  const isFoundMatch = data?.queueState === 'FoundMatch';

  return (
    <main className="w-screen h-screen p-4 overflow-hidden">
      <div ref={viewportRef} className="relative w-full h-full flex items-center justify-center">
        {data && (
          <div ref={referenceRef} className="invisible absolute pointer-events-none" aria-hidden>
            <Queued queue={data.queue} seconds={seconds} />
          </div>
        )}
        <div className="relative" style={{ transform: `scale(${scale})` }}>
          <AnimatePresence mode="wait">
            {data && isSearching && <Queued key="queued" queue={data.queue} seconds={seconds} />}
            {data && isFoundMatch && <FoundMatch key="found" queue={data.queue} />}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
