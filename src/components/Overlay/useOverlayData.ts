import { useEffect, useState } from 'react';
import { POSTLiveMatchV1 } from '../../core/overlay';
import { PREVIEW_MATCH_DATA } from './previewData';

// Subscribes to the local overlay HTTP server's push stream (see src-tauri/src/overlay/mod.rs) instead of polling.
// It sends the current snapshot immediately on connect, then again whenever it changes.
// EventSource also reconnects on its own if the server isn't up yet.
export function useOverlayData(preview: boolean): POSTLiveMatchV1 | null {
  const [data, setData] = useState<POSTLiveMatchV1 | null>(preview ? PREVIEW_MATCH_DATA : null);

  useEffect(() => {
    if (preview) return;

    const source = new EventSource('/api/state/stream');
    source.onmessage = (event) => {
      setData(event.data === 'null' ? null : JSON.parse(event.data));
    };
    return () => source.close();
  }, [preview]);

  return data;
}
