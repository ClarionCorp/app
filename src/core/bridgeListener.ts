import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { upsertCurrentMatch } from './database/queries';

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

// Parses "2026.05.22-03.21.41:896" from the Unreal log into a Date.
function parseLogTimestamp(ts: string): Date | null {
  const m = ts.match(/^(\d{4})\.(\d{2})\.(\d{2})-(\d{2})\.(\d{2})\.(\d{2}):(\d+)$/);
  if (!m) return null;
  const [, year, month, day, hour, min, sec, ms] = m;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec), Number(ms)));
}

export async function onGameMatchStarted(): Promise<UnlistenFn> {
  return listen<{ timestamp: string }>('game-match-started', async (event) => {
    const startedAt = parseLogTimestamp(event.payload.timestamp);
    if (!startedAt) return;
    console.debug(`Updating startMatch! ${startedAt}`)
    await upsertCurrentMatch({ startedAt });
  });
}