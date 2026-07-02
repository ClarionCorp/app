import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { upsertCurrentMatch } from './database/queries';
import { markMatchStartIfNone } from './timeline';

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

export async function onMatchFinalize(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('postgame-stats-changed', (event) => {
    handler(event.payload);
  });
}

export async function onTrainingsChanged(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('ue4ss-trainings-changed', (event) => {
    handler(event.payload);
  });
}

export async function onSessionUpdated(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('ue4ss-session-changed', (event) => {
    handler(event.payload);
  });
}

export async function isProcessRunning(name: string): Promise<boolean> {
  return invoke<boolean>('is_process_running', { name });
}

export async function getLatestRegion(): Promise<string | null> {
  return invoke<string | null>('get_latest_region');
}

export async function refreshLatestMatchStart(): Promise<void> {
  const ts = await invoke<string | null>('get_latest_match_timestamp');
  if (!ts) return;
  const m = ts.match(/^(\d{4})\.(\d{2})\.(\d{2})-(\d{2})\.(\d{2})\.(\d{2}):(\d+)$/);
  if (!m) return;
  const [, year, month, day, hour, min, sec, ms] = m;
  const startedAt = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec), Number(ms)));
  await upsertCurrentMatch({ startedAt });
  await markMatchStartIfNone();
}