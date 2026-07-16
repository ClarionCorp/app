// Functions for bug and feedback reporting

import { platform, version, arch, hostname } from '@tauri-apps/plugin-os';

export async function gatherSystemInfo() {
  // Basic System Info
  const osPlatform = platform();
  const osVersion = version();
  const osArch = arch()
  const host = await hostname();
  

  // Basic Filepaths
  
}