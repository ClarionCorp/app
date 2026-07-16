import { readTextFile } from '@tauri-apps/plugin-fs';
import { OdyAuth } from '../types/odyssey';
import { upsertAuth } from './database/queries';
import { getIdentityPath, getLogPath } from './utilities/system';


export async function readIdentity(): Promise<OdyAuth> {
  const identityPath = await getIdentityPath();
  if (!identityPath) { throw new Error(`Identity path could not be found, please create a bug report!`) };
  const raw = await readTextFile(identityPath);

  let identity: unknown;
  try {
    identity = JSON.parse(raw);
  } catch {
    throw new Error('identity.json exists but could not be parsed. The file may be corrupted.');
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

  await upsertAuth({
    odyJwt: accessTokens.jwt as string,
    odyRft: accessTokens.refreshToken as string,
    createdAt: new Date(),
  })

  return {
    jwt: accessTokens.jwt as string,
    rft: accessTokens.refreshToken as string
  };
}

// Verify identity.json and OmegaStrikers.log exist, and identity has required keys
export async function verifyClientFiles(): Promise<OdyAuth> {
  const identityPath = await getIdentityPath();
  const logPath = await getLogPath();

  if (!identityPath) {
    throw new Error(
      `Could not find identity.json at:\n${identityPath}\n\nMake sure Omega Strikers has been launched at least once.`
    );
  }

  if (!logPath) {
    throw new Error(
      `Could not find OmegaStrikers.log at:\n${logPath}\n\nMake sure Omega Strikers has been launched at least once.`
    );
  }

  return await readIdentity();
}