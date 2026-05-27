// Helpers and UE4SS management functions
// Most of the file is dormant if the user chooses not to install the companion mods

import { join, tempDir } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, remove, writeFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";

const ue4ssRelativePaths = [
  'OmegaStrikers/Binaries/Win64/Mods',
  'OmegaStrikers/Binaries/Win64/imgui.ini',
  'OmegaStrikers/Binaries/Win64/UE4SS.dll',
  'OmegaStrikers/Binaries/Win64/UE4SS-settings.ini',
  'OmegaStrikers/Binaries/Win64/dwmapi.dll',
  'OmegaStrikers/Binaries/Win64/Changelog.md',
  'OmegaStrikers/Binaries/Win64/README.md',
];

type InstallProgressCallback = (stage: 'checking' | 'downloading' | 'installing' | 'updating' | 'extracting' | 'done', percent: number | null, message: string) => void;
type UnInstallProgressCallback = (stage: 'checking' | 'removing' | 'cleaning' | 'done', percent: number | null, message: string) => void;

// The main function for checking if UE4SS is installed, and setting it up/updating if it isn't.
export async function checkUE4SS(gameDirectory: string, onProgress?: InstallProgressCallback) {
  try {
    onProgress?.('checking', 0, 'Checking if UE4SS is installed...');
    let ue4ss_installed = true;

    const doCoreFilesExist = (
      await Promise.all(ue4ssRelativePaths.map(async p => exists(await join(gameDirectory, p))))
    ).every(Boolean);

    if (doCoreFilesExist == false) {
      ue4ss_installed = false;
      // We need to download and install UE4SS before continuing
      onProgress?.('downloading', 10, 'Fetching UE4SS from GitHub...');

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
        const percent = ue4ss_contentLength ? Math.round(20 + (ue4ss_received / ue4ss_contentLength) * 10) : null;
        onProgress?.('downloading', percent, `Downloading UE4SS... ${percent ?? '?'}%`); // ends at 30
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
      onProgress?.('extracting', 40, 'Extracting files...');
      await invoke('extract_zip', {
        zipPath: ue4ss_zipPath,
        destDir: await join(gameDirectory, 'OmegaStrikers/Binaries/Win64/'),
      });

      // Overwrite the default mods.txt with a cut-down version
      onProgress?.('installing', 45, 'Setting up defaults...');
      await writeTextFile(
        await join(gameDirectory, 'OmegaStrikers/Binaries/Win64/Mods/mods.txt'),
        `ConsoleCommandsMod : 0\nConsoleEnablerMod : 0\n\n; Built-in keybinds, do not move up!\nKeybinds : 1\n`
      );
    }

    // Check for mod updates (or force it if ue4ss_installed is false)
    onProgress?.('checking', 50, 'Checking mod versions...');
    for (let i = 0; i < MODS.length; i++) {
      const mod = MODS[i];
      const percent = Math.round(50 + (i / MODS.length) * (90 - 50));

      const scriptDir = await join(gameDirectory, 'OmegaStrikers/Binaries/Win64/Mods', mod.name, 'Scripts');
      const installedPath = await join(scriptDir, 'main.lua');
      const isInstalled = await exists(installedPath);

      if (!isInstalled || !ue4ss_installed) {
        onProgress?.('installing', percent, `Installing ${mod.name} v${mod.version}...`);
        await mkdir(scriptDir, { recursive: true });
        await writeTextFile(installedPath, mod.source);
        console.log(`Installed ${mod.name} v${mod.version}`);
      } else {
        const installedContent = await readTextFile(installedPath);
        const installedVersion = parseVersion(installedContent);
        if (installedVersion !== mod.version) {
          onProgress?.('updating', percent, `Updating ${mod.name} ${installedVersion} -> ${mod.version}...`);
          await writeTextFile(installedPath, mod.source);
          console.log(`Updated ${mod.name} to v${mod.version}`);
        }
        // this mod is up to date, continue
        console.debug(`Mod ${mod.name} is up-to-date (v${mod.version})`);
      }

      await ensureModEnabled(mod.name, await join(gameDirectory, 'OmegaStrikers/Binaries/Win64/Mods'));
    }

    onProgress?.('done', 100, 'UE4SS & Mods Up-to-date!');
    console.log(`Successfully validated UE4SS & Installed Mods.`);

  } catch (e) {
    console.error(`[UE4SS] Failed to install UE4SS!`, e);
    return;
  }
}


// Mod Handling
const modFiles = import.meta.glob('../../assets/mods/*.lua', { as: 'raw', eager: true });

const parseVersion = (lua: string) =>
  lua.match(/local ModVersion\s*=\s*"([^"]+)"/)?.[1] ?? '0.0.0';

const parseName = (lua: string) =>
  lua.match(/local ModName\s*=\s*"([^"]+)"/)?.[1];

export type ModEntry = {
  name: string;
  version: string;
  source: string; // raw lua content for copying
};

export const MODS: ModEntry[] = Object.values(modFiles).map(source => ({
  name: parseName(source as string)!,
  version: parseVersion(source as string),
  source: source as string,
}));


async function ensureModEnabled(modName: string, modsFolder: string) {
  const modsFilePath = await join(modsFolder, 'mods.txt');

  if (!await exists(modsFilePath)) {
    await writeTextFile(modsFilePath, `${modName} : 1\n`);
    return;
  }

  const content = await readTextFile(modsFilePath);
  const entryRegex = new RegExp(`^(${modName}\\s*:\\s*)(\\d)`, 'm');
  const match = content.match(entryRegex);

  if (match) {
    if (match[2] === '1') return;
    await writeTextFile(modsFilePath, content.replace(entryRegex, (_, prefix) => `${prefix}1`));
    return;
  }

  // Not in file, insert before the built-in keybinds comment
  const lines = content.split('\n');
  const keybindsIdx = lines.findIndex(l => l.startsWith('; Built-in keybinds'));
  const entry = `${modName} : 1`;

  if (keybindsIdx !== -1) {
    lines.splice(keybindsIdx, 0, entry);
  } else {
    lines.push(entry);
  }

  await writeTextFile(modsFilePath, lines.join('\n'));
}

export async function unInstallUE4SS(gameDirectory: string, onProgress?: UnInstallProgressCallback) {
  try {
    onProgress?.('checking', 0, 'Checking system...');

    // Check if game is running.
    const gameRunning = await invoke<boolean>("is_process_running", { name: "OmegaStrikers.exe" }); // verify actual exe name later
    if (gameRunning == true) throw new Error(`Game is currently running! Please close it before trying again.`);

    // Find and remove associated files
    onProgress?.('removing', 20, 'Removing Mods Folder...');
    const modsFolder = await join(gameDirectory, ue4ssRelativePaths[0]);
    if (await exists(modsFolder)) {
      await remove(modsFolder, { recursive: true });
    }

    onProgress?.('removing', 50, 'Removing UE4SS Binaries...');
    for (const path of ue4ssRelativePaths) {
      let compPath = await join(gameDirectory, path);
      if (await exists(compPath)) {
        await remove(compPath, { recursive: true });
      }
    }

    onProgress?.('cleaning', 90, 'Cleaning up...');

    onProgress?.('done', 100, 'UE4SS uninstalled successfully!');
    console.log(`Uninstalled UE4SS from Game's Directory.`);

  } catch (e) {
    console.error(`[UE4SS] Failed to uninstall UE4SS!`, e);
    return;
  }
}