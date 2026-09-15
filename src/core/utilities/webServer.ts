import { useEffect, useState } from 'react';
import { POSTLiveMatchV1, QueueOverlayInfo } from '../../core/overlay';
import { PREVIEW_MATCH_DATA } from '../../components/Overlay/previewData';

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

// Subscribes to the local overlay HTTP server's push stream (see src-tauri/src/overlay/mod.rs) instead of polling.
// Just a separate channel/endpoint since queue status is valid even outside a match.
export function useQueueData(preview: boolean): QueueOverlayInfo | null {
  const [data, setData] = useState<QueueOverlayInfo | null>(preview ? PREVIEW_QUEUE_DATA : null);

  useEffect(() => {
    if (preview) return;

    const source = new EventSource('/api/queue/stream');
    source.onmessage = (event) => {
      setData(event.data === 'null' ? null : JSON.parse(event.data));
    };
    return () => source.close();
  }, [preview]);

  return data;
}

const PREVIEW_QUEUE_DATA: QueueOverlayInfo = {
  queue: 'Ranked',
  queueState: 'Queued',
};
