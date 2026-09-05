// This file is the bridge between the Rust backend and the TS frontend

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

export interface FileChangePayload {
  file: string;
  kind: 'created' | 'modified' | 'removed';
  content: string | null;
}

// new stuff to replace old stuff later
export async function onGameStateChange(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onStateChange', (event) => {
    handler(event.payload);
  });
}

export async function onQueueChange(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onQueueChange', (event) => {
    handler(event.payload);
  });
}

export async function onMatchUpdate(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onMatchUpdate', (event) => {
    handler(event.payload);
  });
}

export async function onPlayersUpdate(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onPlayersUpdate', (event) => {
    handler(event.payload);
  });
}

export async function onMatchFinalize(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onPostGameUpdate', (event) => {
    handler(event.payload);
  });
}

export async function onCustomLobbyHeartbeat(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onCustomLobbyHeartbeat', (event) => {
    handler(event.payload);
  });
}

export async function isProcessRunning(name: string): Promise<boolean> {
  return invoke<boolean>('is_process_running', { name });
}

export async function getLatestRegion(): Promise<string | null> {
  return invoke<string | null>('get_latest_region');
}

export async function getHeartbeat(): Promise<number | null> {
  return invoke<number | null>('get_heartbeat');
}