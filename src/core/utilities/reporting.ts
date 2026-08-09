// Functions for bug and feedback reporting

import { platform, version, arch, Platform, Arch } from '@tauri-apps/plugin-os';
import { getIdentityPath, getLogPath, getTempDir } from './system';
import { join } from '@tauri-apps/api/path';
import { getAppSettings } from '../database/queries';
import { readDir } from '@tauri-apps/plugin-fs';

export type SysReport = {
  platform: {
    system: Platform,
    version: string,
    architecture: Arch,
  },
  paths: {
    identity: string | null,
    log: string | null,
    temp: string | null,
    game: string | null,
  },
  gameSysFiles: string[]
}

export async function gatherSystemInfo(): Promise<SysReport | null> {
  try {
    const settings = await getAppSettings();

    // Basic System Info
    const osPlatform = platform();
    const osVersion = version();
    const osArch = arch()
    

    // Basic Filepaths
    const identityPath = await getIdentityPath();
    const logPath = await getLogPath();
    const tempPath = await getTempDir();
    const omegaSys = await gatherModFiles(settings);

    return {
      platform: {
        system: osPlatform,
        version: osVersion,
        architecture: osArch,
      },
      paths: {
        identity: identityPath,
        log: logPath,
        temp: tempPath,
        game: settings?.gameDirectory,
      },
      gameSysFiles: omegaSys
    }
  } catch (e) {
    console.error(`Something went wrong while fetching system info!`, e);
    return null;
  }
}

 // grabs a list of files/folders in this folder, VERY useful for debugging UE4SS
async function gatherModFiles(settings: any): Promise<string[]> {
  if (!settings.gameDirectory) return [];
  const omegaSysFolder = await join(settings.gameDirectory, 'OmegaStrikers/Binaries/Win64');
  
  const entries = await readDir(omegaSysFolder);
  return entries.map((entry) => entry.name);
}