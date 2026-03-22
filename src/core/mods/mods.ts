import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface DownloadProgress {
  downloaded: number;
  total: number;
}

export interface ScanResult {
  file_name: string;
  enabled: boolean;
}

export async function validateGameDir(gameDir: string): Promise<boolean> {
  try {
    await invoke("validate_game_dir", { gameDir });
    return true;
  } catch {
    return false;
  }
}

export async function toggleMod(
  gameDir: string,
  fileNames: string[],
  enable: boolean
): Promise<void> {
  await invoke("toggle_mod", { gameDir, fileNames, enable });
}

export async function deleteMod(
  gameDir: string,
  fileNames: string[],
  enabled: boolean
): Promise<void> {
  await invoke("delete_mod", { gameDir, fileNames, enabled });
}

export async function scanModsFolder(gameDir: string): Promise<ScanResult[]> {
  return invoke<ScanResult[]>("scan_mods_folder", { gameDir });
}

// Returns the list of pak filenames that were extracted from the zip
export async function downloadMod(
  gameDir: string,
  url: string,
  downloadFileName: string
): Promise<string[]> {
  return invoke<string[]>("download_mod", { gameDir, url, downloadFileName });
}

export function onDownloadProgress(
  cb: (progress: DownloadProgress) => void
): Promise<UnlistenFn> {
  return listen<DownloadProgress>("mod:download_progress", ({ payload }) => cb(payload));
}

export function onDownloadComplete(
  cb: (fileNames: string[]) => void
): Promise<UnlistenFn> {
  return listen<string[]>("mod:download_complete", ({ payload }) => cb(payload));
}