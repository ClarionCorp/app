// Functions for custom console commands

import { appDataDir, join } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

// add autocomplete later
export const validConsoleCommands: Record<string, string> = {
  HELP: `Shows a list of all valid console commands`,
  OPEN_LOGS_FOLDER: `Opens the app's logs folder in the system file manager`,
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

export async function runConsoleCommand(command: string) {
  const cmd = command.toUpperCase();
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
    default:
      console.warn(`Invalid Command: ${cmd}`);
      return;
  }
}