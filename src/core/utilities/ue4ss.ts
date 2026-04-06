// Helpers and UE4SS management functions
// Most of the file is dormant if the user chooses not to install the companion mods

import { join, tempDir } from "@tauri-apps/api/path";
import { exists, writeFile } from "@tauri-apps/plugin-fs";
import { getAppSettings } from "../database/queries";
import { invoke } from "@tauri-apps/api/core";

const ue4ssRelativePaths = [
  'OmegaStrikers/Binaries/Win64/imgui.ini',
  'OmegaStrikers/Binaries/Win64/UE4SS.dll',
  'OmegaStrikers/Binaries/Win64/Mods',
  'OmegaStrikers/Binaries/Win64/Mods/mods.txt',
];


// We need to pull a specific version that we know works, then strip it down to the barebones.
// Then we can install our helper mods in the UE4SS mods folder.
export async function installUE4SS() {
  try {
    // Check if needed paths are setup.
    const appSettings = await getAppSettings();
    if (!appSettings || !appSettings.gameDir) throw new Error(`App isn't setup or Game Directory is not set!`);

    // Check if already installed
    const alrInst = await checkUE4SS(appSettings.gameDir);
    if (alrInst) throw new Error('UE4SS is already installed! Either update, or uninstall your current version.');

    // Fetch UE4SS download binaries
    const response = await fetch('https://github.com/UE4SS-RE/RE-UE4SS/releases/download/v3.0.1/UE4SS_v3.0.1.zip', { method: 'GET' });
    if (!response.ok) throw new Error(`GitHub Download Failed: ${response.status}`);

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const tmp = await tempDir();
    const zipPath = await join(tmp, 'UE4SS_v3.0.1.zip');

    await writeFile(zipPath, bytes);

    // Once downloaded, extract to game folders.
    await invoke('extract_zip', {
      zipPath,
      destDir: `${await join(appSettings.gameDir, 'OmegaStrikers/Binaries/Win64/')}`
    });

    // Remove unnecessary files (to-do)

    console.log(`Installed UE4SS to Game's Directory.`);

  } catch (e) {
    console.error(`[UE4SS] Failed to install UE4SS!`, e);
    return;
  }
}


// Checks if UE4SS is already installed
export async function checkUE4SS(base: string): Promise<boolean> {
  const results = await Promise.all(ue4ssRelativePaths.map(async p => exists(await join(base, p))));
  return results.some(Boolean);
}