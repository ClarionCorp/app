import { platform } from "@tauri-apps/plugin-os"
import { linux_identity, macos_identity, windows_identity } from "../constants";
import { homeDir, join } from "@tauri-apps/api/path";
import { IdentityFile } from "../../types/auth";
import { readTextFile } from "@tauri-apps/plugin-fs";

export async function fetchAuth(): Promise<IdentityFile | null> {
  const os = await platform();
  let idenPath = '';
  switch (os) {
    case 'windows':
      idenPath = windows_identity;
      break;
    case 'linux':
      idenPath = linux_identity;
      break;
    case 'macos':
      idenPath = macos_identity;
      break;
  }

  const home = await homeDir();
  const fullPath = await join(home, idenPath);

  try {
    const contents = await readTextFile(fullPath);
    const identity = JSON.parse(contents) as IdentityFile;
    return identity
  } catch (e) {
    console.error(`Failed to find identity.json!`, e);
    return null;
  }
}