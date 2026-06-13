import { invoke } from '@tauri-apps/api/core';
import { fetch } from '@tauri-apps/plugin-http';
import { appDataDir, join, tempDir } from '@tauri-apps/api/path';
import { writeFile, readFile } from '@tauri-apps/plugin-fs';
import { playAudio } from './audio';
import { AiMiAPI } from '../constants';

export interface SoundPack {
  name: string;
  files: string[];
}

let defaultsDownloaded = false;

async function downloadDefaultPacks(): Promise<void> {
  const response = await fetch(`${AiMiAPI}/assets/sounds/packs/defaults.zip`, { method: 'GET' });
  if (!response.ok) throw new Error(`Server returned ${response.status}`);

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }

  const zipPath = await join(await tempDir(), 'queue_pops_defaults.zip');
  await writeFile(zipPath, bytes);

  const packsDir = await join(await appDataDir(), 'queue_pops');
  await invoke('extract_zip', { zipPath, destDir: packsDir });
}

export async function checkSetupSoundPacks(): Promise<void> {
  if (defaultsDownloaded) return;
  defaultsDownloaded = true;
  try {
    const packs = await invoke<SoundPack[]>('list_queue_pop_packs');
    if (packs.length === 0) await downloadDefaultPacks();
  } catch (e) {
    console.error('[SoundPacks] Failed to download default packs:', e);
  }
}

export async function getAvailableSoundPacks(): Promise<SoundPack[]> {
  try {
    return await invoke<SoundPack[]>('list_queue_pop_packs');
  } catch {
    return [];
  }
}

export async function playQueuePop(packName: string, volume: number): Promise<void> {
  const packs = await getAvailableSoundPacks();
  const pack = packs.find(p => p.name === packName) ?? packs[0];

  if (!pack?.files.length) return;

  const file = pack.files[Math.floor(Math.random() * pack.files.length)];
  const data = await readFile(file);
  const url = URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }));
  const audio = await playAudio(url, volume);
  
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
}
