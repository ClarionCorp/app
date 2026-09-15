import { useEffect, useState } from 'react';
import { POSTLiveMatchV1 } from '../../core/overlay';
import { PREVIEW_MATCH_DATA } from './previewData';

const POLL_INTERVAL_MS = 1000;

// Polls the local overlay HTTP server (see src-tauri/src/overlay/mod.rs) for the latest match snapshot
export function useOverlayData(preview: boolean): POSTLiveMatchV1 | null {
  const [data, setData] = useState<POSTLiveMatchV1 | null>(preview ? PREVIEW_MATCH_DATA : null);

  useEffect(() => {
    if (preview) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.status === 204) { if (!cancelled) setData(null); return; }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // Server not reachable yet (e.g. app still starting up) - just keep polling.
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [preview]);

  return data;
}
