// Functions regarding anything to do with interfacing with the user's system or file paths

import { homeDir, join, tempDir } from "@tauri-apps/api/path";
import { platform } from "@tauri-apps/plugin-os";
import { linux_identity, linux_log, proton_temp, windows_identity, windows_log } from "../constants";
import { exists } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

export type HardwareInfo = {
  cpu: {
    brand: string,
    physical_cores: number | null,
    logical_cores: number,
  },
  os_drive: {
    mount_point: string,
    kind: "SSD" | "HDD" | "Unknown",
    total_space: number,
  } | null,
}

// Basic hardware info (CPU model, whether the OS drive is an SSD) for bug reports
export async function getHardwareInfo(): Promise<HardwareInfo> {
  return await invoke<HardwareInfo>("get_hardware_info");
}

// Moved here to be used in bug reports
export async function getIdentityPath(): Promise<string | null> {
  const home = await homeDir();
  const os = platform();
  const fullIdentityPath = await join(home, os == 'windows' ? windows_identity : linux_identity);
  const fileExists = await exists(fullIdentityPath);
  if (fileExists == true) { return fullIdentityPath }
  else { return null }; // cancel early if file doesn't exist here.
}

// Moved here to be used in bug reports (game log)
export async function getLogPath(): Promise<string | null> {
  const home = await homeDir();
  const os = platform();
  const fullLogPath = await join(home, os == 'windows' ? windows_log : linux_log);
  const fileExists = await exists(fullLogPath);
  if (fileExists == true) { return fullLogPath }
  else { return null }; // cancel early if file doesn't exist here.
}

// Needed because on Linux, we don't use /tmp,
// we use the Proton tmp path in windows' LocalAppData.
export async function getTempDir(): Promise<string> {
  const os = platform();
  if (os == 'windows') {
    return await tempDir();
  } else { // Not windows, return Proton path instead
    const home = await homeDir();
    return await join(home, proton_temp);
  }
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)

  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`
}

// Compact clock style, e.g. "3:45".
// For small always-on timers (queue/match status badges).
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Verbose word style, e.g. "3m 45s" or "1h 2m 3s".
// For descriptive duration text.
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}