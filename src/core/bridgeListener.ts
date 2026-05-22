import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface FileChangePayload {
  file: string;
  kind: 'created' | 'modified' | 'removed';
  content: string | null;
}

export async function onPlayersChanged(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('ue4ss-players-changed', (event) => {
    handler(event.payload);
  });
}

export async function onGameStateChanged(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('ue4ss-gamestate-changed', (event) => {
    handler(event.payload);
  });
}

export async function onPostGameStatsChanged(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('postgame-stats-changed', (event) => {
    handler(event.payload);
  });
}
