// Functions regarding anything to do with interfacing with the user's system or file paths

import { homeDir, join } from "@tauri-apps/api/path";
import { platform } from "@tauri-apps/plugin-os";
import { linux_identity, linux_log, windows_identity, windows_log } from "../constants";
import { exists } from "@tauri-apps/plugin-fs";

// Moved here to be used in bug reports
export async function getIdentityPath(): Promise<string | null> {
  const home = await homeDir();
  const os = platform();
  const fullIdentityPath = await join(home, os == 'windows' ? windows_identity : linux_identity);
  const fileExists = await exists(fullIdentityPath);
  if (fileExists == true) { return fullIdentityPath }
  else { return null }; // cancel early if file doesn't exist here.
}

// Moved here to be used in bug reports
export async function getLogPath(): Promise<string | null> {
  const home = await homeDir();
  const os = platform();
  const fullLogPath = await join(home, os == 'windows' ? windows_log : linux_log);
  const fileExists = await exists(fullLogPath);
  if (fileExists == true) { return fullLogPath }
  else { return null }; // cancel early if file doesn't exist here.
}