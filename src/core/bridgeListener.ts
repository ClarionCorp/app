// This file is the bridge between the Rust backend and the TS frontend

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

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

// new stuff to replace old stuff later
export async function onStateChange(
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

export async function onPartyUpdate(
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onPartyUpdate', (event) => {
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

export async function onPostGameUpdate( // rename later
  handler: (payload: FileChangePayload) => void
): Promise<UnlistenFn> {
  return listen<FileChangePayload>('onPostGameUpdate', (event) => {
    handler(event.payload);
  });
}

export async function isProcessRunning(name: string): Promise<boolean> {
  return invoke<boolean>('is_process_running', { name });
}

export async function getLatestRegion(): Promise<string | null> {
  return invoke<string | null>('get_latest_region');
}