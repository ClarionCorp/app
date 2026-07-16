// Functions for bug and feedback reporting

import { platform, version, arch, hostname, Platform, Arch } from '@tauri-apps/plugin-os';
import { getIdentityPath, getLogPath } from './system';
import { join, tempDir } from '@tauri-apps/api/path';
import { getAppSettings } from '../database/queries';
import { readDir } from '@tauri-apps/plugin-fs';

export type SysReport = {
  platform: {
    system: Platform,
    version: string,
    architecture: Arch,
    host: string | null
  },
  paths: {
    identity: string | null,
    log: string | null,
    temp: string | null,
    game: string | null,
  },
  gameSysFiles: string[]
}

export async function gatherSystemInfo(): Promise<SysReport> {
  const settings = await getAppSettings();

  // Basic System Info
  const osPlatform = platform();
  const osVersion = version();
  const osArch = arch()
  const host = await hostname();
  

  // Basic Filepaths
  const identityPath = await getIdentityPath();
  const logPath = await getLogPath();
  const tempPath = await tempDir();
  const omegaSys = await gatherModFiles(settings);

  return {
    platform: {
      system: osPlatform,
      version: osVersion,
      architecture: osArch,
      host
    },
    paths: {
      identity: identityPath,
      log: logPath,
      temp: tempPath,
      game: settings?.gameDirectory,
    },
    gameSysFiles: omegaSys
  }
}


async function gatherModFiles(settings: any): Promise<string[]> {
  if (!settings.gameDirectory) return [];
  const omegaSysFolder = await join(settings.gameDirectory, 'OmegaStrikers/Binaries/Win64');
  const omegaSysFiles = await yoinkFileList(omegaSysFolder); // grabs a tree-like list of files in this folder, VERY useful for debugging
  return omegaSysFiles;
}

const exclusions = ['Mods/shared/types'];
async function yoinkFileList(dirPath: string, rootPath: string = dirPath): Promise<string[]> { // lol
  const entries = await readDir(dirPath);
  const fileNames: string[] = [];

  for (const entry of entries) {
    const fullPath = await join(dirPath, entry.name);

    if (entry.isDirectory) {
      // relative path from root, normalized to forward slashes
      const relativePath = fullPath
        .slice(rootPath.length)
        .replace(/^[/\\]+/, '')
        .replace(/\\/g, '/');

      if (exclusions.includes(relativePath)) {
        continue; // skip this folder entirely
      }

      const nestedFiles = await yoinkFileList(fullPath, rootPath);
      fileNames.push(...nestedFiles);
    } else if (entry.isFile) {
      fileNames.push(entry.name);
    }
  }

  return fileNames;
}