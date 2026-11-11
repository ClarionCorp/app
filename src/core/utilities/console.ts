// Functions for custom console commands

import { appDataDir, join } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

export async function openLogsFolder() {
  try {
    const appData = await appDataDir();
    const logsPath = await join(appData, 'logs');
    await openPath(logsPath);
  } catch (e) {
    console.error(`Failed to open logs folder in system's file manager!`, e);
  }
}