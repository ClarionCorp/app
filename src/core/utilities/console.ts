// Functions for custom console commands

import { appDataDir, join } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import { getAppSettings } from "../database/queries";
import { readDir, stat } from "@tauri-apps/plugin-fs";

// add autocomplete later
export const validConsoleCommands: Record<string, string> = {
  HELP: `Shows a list of all valid console commands`,
  OPEN_LOGS_FOLDER: `Opens the app's logs folder in the system file manager`,
  NAVIGATE: `Force navigate to a specific page in the app (Usage: 'NAVIGATE <slug>')`,
  CHECK_FOR_DUMPS: `Print a list of recent crash dumps found in game folder`,
  OPEN_UE4SS_FOLDER: `Open Win64 folder (where UE4SS is) for Mods or crash dumps`,
};

export async function openLogsFolder() {
  try {
    const appData = await appDataDir();
    const logsPath = await join(appData, 'logs');
    console.debug(`Opening logs folder at ${logsPath}`);
    await openPath(logsPath);
  } catch (e) {
    console.error(`Failed to open logs folder in system's file manager!`, e);
  }
}

export async function navCommand(args: string[]) {
  try {
    if (!args[0]) {
      console.error(`No page slug provided! (Usage: 'NAVIGATE home')`);
      return;
    }
    console.debug(`Forcing navigation to page ${args[0]}...`);
    window.location.hash = `#/${args[0]}`;  // Updating the hash triggers a route change, though it WILL crash if page is invalid
  } catch (e) {
    console.error(`Failed to navigate to the specified page!`, e);
    return;
  }
}

async function listDumpFiles() {
  try {
    const appSettings = await getAppSettings();
    if (!appSettings.gameDirectory) { throw new Error('gameDirectory is not setup yet!') };
    const win64 = await join(appSettings.gameDirectory, 'OmegaStrikers', 'Binaries', 'Win64');

    const entries = await readDir(win64);
    const dumps = entries.filter((e) => e.isFile && e.name.toLowerCase().endsWith(".dmp"));
    const weekAgo = Date.now() - 604_800_000;

    console.log(`Dumps found from the last week:`);
    return Promise.all(
      dumps.map(async (e) => {
        const path = await join(win64, e.name);
        const info = await stat(path);
        const modified = info.mtime;
        if (modified !== null && modified.getTime() >= weekAgo) {
          console.log(`${e.name}: ${info.size} bytes (${modified})`);
        }
      })
    )
  } catch (e) {
    console.error(`Ran into an error while fetching dump files!`, e);
  }
}

async function openUE4SSFolder() {
  try {
    const appSettings = await getAppSettings();
    if (!appSettings.gameDirectory) { throw new Error('gameDirectory is not setup yet!') };
    const win64 = await join(appSettings.gameDirectory, 'OmegaStrikers', 'Binaries', 'Win64');

    console.debug(`Opening UE4SS folder at ${win64}`);
    await openPath(win64);
  } catch (e) {
    console.error(`Failed to open UE4SS folder in system's file manager!`, e);
  }
}

export async function runConsoleCommand(command: string) {
  const [rawCmd, ...args] = command.trim().split(/\s+/);
  const cmd = rawCmd.toUpperCase();
  switch (cmd) {
    case 'HELP':
      console.log('Valid console commands:');
      for (const [name, desc] of Object.entries(validConsoleCommands)) {
        console.log(`  ${name} - ${desc}`);
      }
      return;
    case 'OPEN_LOGS_FOLDER':
      await openLogsFolder();
      return;
    case 'NAVIGATE':
      await navCommand(args);
      return;
    case 'CHECK_FOR_DUMPS':
      await listDumpFiles();
      return;
    case 'OPEN_UE4SS_FOLDER':
      await openUE4SSFolder();
      return;
    default:
      console.warn(`Invalid Command: ${cmd}`);
      return;
  }
}