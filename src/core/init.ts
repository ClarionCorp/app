import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { homeDir, join } from '@tauri-apps/api/path';
import { windows_identity, windows_log, OdyAPI } from './constants';
import { OdyAuth, SelfQuery } from '../types/odyssey';


async function readIdentity(): Promise<OdyAuth> {
  const home = await homeDir();
  const fullIdentityPath = await join(home, windows_identity);
  const raw = await readTextFile(fullIdentityPath);

  let identity: unknown;
  try {
    identity = JSON.parse(raw);
  } catch {
    throw new Error('identity.json exists but could not be parsed. The file may be corrupted.');
  }

  if (typeof identity !== 'object' || identity === null) {
    throw new Error('identity.json is not a valid object.');
  }

  const { accessTokens } = identity as Record<string, unknown>;

  if (
    typeof accessTokens !== 'object' ||
    accessTokens === null ||
    !('jwt' in accessTokens) ||
    !('refreshToken' in accessTokens)
  ) {
    throw new Error(
      'identity.json is missing required keys. Expected both "jwt" and "refreshToken" under "accessTokens".'
    );
  }

  return {
    jwt: accessTokens.jwt as string,
    rft: accessTokens.refreshToken as string
  };
}

// 1) Verify identity.json and OmegaStrikers.log exist, and identity has required keys
export async function verifyClientFiles(): Promise<OdyAuth> {
  const home = await homeDir();

  const fullIdentityPath = await join(home, windows_identity);
  const fullLogPath = await join(home, windows_log);

  const identityExists = await exists(fullIdentityPath);
  if (!identityExists) {
    throw new Error(
      `Could not find identity.json at:\n${fullIdentityPath}\n\nMake sure Omega Strikers has been launched at least once.`
    );
  }

  const logExists = await exists(fullLogPath);
  if (!logExists) {
    throw new Error(
      `Could not find OmegaStrikers.log at:\n${fullLogPath}\n\nMake sure Omega Strikers has been launched at least once.`
    );
  }

  return await readIdentity();
}

// 2) Fetch the player's account info from the Ody API
export async function fetchSelfQuery(): Promise<SelfQuery> {
  const { jwt, rft } = await readIdentity();

  const res = await fetch(`${OdyAPI}/v1/me`, {
    headers: {
      'X-Authorization': `Bearer ${jwt}`,
      'x-Refresh-Token': rft,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch account info from Ody API. Status: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<SelfQuery>;
}