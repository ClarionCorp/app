// Helpers and UE4SS management functions
// Most of the file is dormant if the user chooses not to install the companion mods

import { join, tempDir } from "@tauri-apps/api/path";
import { exists, writeFile } from "@tauri-apps/plugin-fs";
import { getAppSettings } from "../database/queries";
import { invoke } from "@tauri-apps/api/core";
import { GithubRelease } from "../../types/github";

const ue4ssRelativePaths = [
  'OmegaStrikers/Binaries/Win64/imgui.ini',
  'OmegaStrikers/Binaries/Win64/UE4SS.dll',
  'OmegaStrikers/Binaries/Win64/Mods',
  'OmegaStrikers/Binaries/Win64/Mods/mods.txt',
];

type ProgressCallback = (stage: 'checking' | 'downloading' | 'extracting' | 'done', percent: number | null, message: string) => void;

// We need to pull a specific version that we know works, then strip it down to the barebones.
// Then we can install our helper mods in the UE4SS mods folder.
export async function installUE4SS(onProgress?: ProgressCallback) {
  try {
    onProgress?.('checking', 0, 'Checking dependencies...');
    // Check if needed paths are setup.
    const appSettings = await getAppSettings();
    if (!appSettings || !appSettings.gameDir) throw new Error(`App isn't setup or Game Directory is not set!`);

    // Check if already installed
    const alrInst = await checkUE4SS(appSettings.gameDir);
    if (alrInst) throw new Error('UE4SS is already installed! Either update, or uninstall your current version.');


    // Download and Install UE4SS from GitHub
    onProgress?.('downloading', 10, 'Starting download...');
    // Fetch UE4SS download binaries
    const ue4ss_response = await fetch('https://github.com/UE4SS-RE/RE-UE4SS/releases/download/v3.0.1/UE4SS_v3.0.1.zip', { method: 'GET' });
    if (!ue4ss_response.ok) throw new Error(`GitHub Download Failed: ${ue4ss_response.status}`);

    const ue4ss_contentLength = Number(ue4ss_response.headers.get('Content-Length') ?? 0);
    const ue4ss_reader = ue4ss_response.body!.getReader();
    const ue4ss_chunks: Uint8Array[] = [];
    let ue4ss_received = 0;

    while (true) {
      const { done, value } = await ue4ss_reader.read();
      if (done) break;
      ue4ss_chunks.push(value);
      ue4ss_received += value.length;
      const percent = ue4ss_contentLength ? Math.round(20 + (ue4ss_received / ue4ss_contentLength) * 30) : null;
      onProgress?.('downloading', percent, `Downloading UE4SS... ${percent ?? '?'}%`); // ends at 50
    }

    // Stitch chunks into one buffer
    const ue4ss_bytes = new Uint8Array(ue4ss_received);
    let ue4ss_offset = 0;
    for (const chunk of ue4ss_chunks) {
      ue4ss_bytes.set(chunk, ue4ss_offset);
      ue4ss_offset += chunk.length;
    }

    // Save to temp
    const tmp = await tempDir();
    const ue4ss_zipPath = await join(tmp, 'UE4SS_v3.0.1.zip');
    await writeFile(ue4ss_zipPath, ue4ss_bytes);

    // Extract
    onProgress?.('extracting', 60, 'Extracting files...');
    await invoke('extract_zip', {
      zipPath: ue4ss_zipPath,
      destDir: await join(appSettings.gameDir, 'OmegaStrikers/Binaries/Win64/'),
    });

    

    // Now we need to do basically the same shit but for our mods repo
    // to override defaults and actually add the mods that make things work.

    onProgress?.('downloading', 65, 'Starting mod downloads...');
    const getLatestMods = await fetch('https://api.github.com/repos/WWYDF/CCAppMods/releases/latest', { method: 'GET' });
    if (!getLatestMods.ok) throw new Error(`GitHub Fetch Failed: ${getLatestMods.status}`);
    const latestMods: GithubRelease = await getLatestMods.json();

    const cm_response = await fetch(latestMods.assets[0].browser_download_url, { method: 'GET' });
    if (!cm_response.ok) throw new Error(`GitHub Download Failed: ${cm_response.status}`);

    const cm_contentLength = Number(cm_response.headers.get('Content-Length') ?? 0);
    const cm_reader = cm_response.body!.getReader();
    const cm_chunks: Uint8Array[] = [];
    let cm_received = 0;

    while (true) {
      const { done, value } = await cm_reader.read();
      if (done) break;
      cm_chunks.push(value);
      cm_received += value.length;
      const percent = cm_contentLength ? Math.round(70 + (cm_received / cm_contentLength) * 20) : null;
      onProgress?.('downloading', percent, `Downloading Mods... ${percent ?? '?'}%`); // ends at 90
    }

    // Stitch chunks into one buffer
    const cm_bytes = new Uint8Array(cm_received);
    let cm_offset = 0;
    for (const chunk of cm_chunks) {
      cm_bytes.set(chunk, cm_offset);
      cm_offset += chunk.length;
    }

    // Save to temp (e.g. "CC-Mods-1.0.0.zip")
    const cm_zipPath = await join(tmp, `CC-Mods-${latestMods.tag_name}.zip`);
    await writeFile(cm_zipPath, cm_bytes);

    // Extract (overwrites existing files, like mods.txt)
    onProgress?.('extracting', 95, 'Extracting files...');
    await invoke('extract_zip', {
      zipPath: cm_zipPath,
      destDir: await join(appSettings.gameDir, 'OmegaStrikers/Binaries/Win64/'),
    });


    onProgress?.('done', 100, 'UE4SS installed successfully!');
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