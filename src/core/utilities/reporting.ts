// Functions for bug and feedback reporting

import { platform, version, arch, Platform, Arch } from '@tauri-apps/plugin-os';
import { getHardwareInfo, getIdentityPath, getLogPath, getTempDir } from './system';
import { appDataDir, homeDir, join } from '@tauri-apps/api/path';
import { getAppSettings } from '../database/queries';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { linux_default_gamedir, windows_default_gamedir } from '../constants';

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
  gameSysFiles: string[],
  hardware: {
    cpu: {
      brand: string,
      pCores: number | null,
      vCores: number,
    },
    disk?: {
      mount_point: string | undefined,
      type: 'SSD' | 'HDD' | 'Unknown' | undefined,
      total_space: number | undefined
    } | null
  },
}

export async function gatherSystemInfo(): Promise<SysReport | null> {
  try {
    const settings = await getAppSettings();

    // Basic System Info
    const osPlatform = platform();
    const osVersion = version();
    const osArch = arch()
    const hwInfo = await getHardwareInfo();
    

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
      gameSysFiles: omegaSys,
      hardware: {
        cpu: {
          brand: hwInfo.cpu.brand,
          pCores: hwInfo.cpu.physical_cores,
          vCores: hwInfo.cpu.logical_cores,
        },
        disk: {
          mount_point: hwInfo.os_drive?.mount_point,
          type: hwInfo.os_drive?.kind,
          total_space: hwInfo.os_drive?.total_space
        }
      }
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

export async function grabLatestAppLog(): Promise<string> {
  const appFolder = await appDataDir();
  const latestPath = await join(appFolder, 'logs', 'latest.log');
  const logContents = await readTextFile(latestPath);
  return logContents;
}

export async function grabLatestModLogs(): Promise<string> {
  const settings = await getAppSettings();
  const defaultDir = platform() === 'windows' ? windows_default_gamedir : await join(await homeDir(), linux_default_gamedir);
  const gameDir = settings.gameDirectory ?? defaultDir;

  const logPath = await join(gameDir, 'OmegaStrikers', 'Binaries', 'Win64', 'UE4SS.log');
  const logContents = await readTextFile(logPath);
  return logContents;
}

