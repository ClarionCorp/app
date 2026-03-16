import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { homeDir, join } from '@tauri-apps/api/path';
import { windows_identity, windows_log, OdyAPI } from './constants';
import { SelfQuery } from '../types/odyssey';
import { invoke } from '@tauri-apps/api/core';

export type MatchPhase =
  | 'EMatchPhase::None'
  | 'EMatchPhase::BanSelect'
  | 'EMatchPhase::LoadoutSelect'
  | 'EMatchPhase::CharacterSelect'
  | 'EMatchPhase::VersusScreen'
  | 'EMatchPhase::FaceOffIntro'
  | 'EMatchPhase::InGame'
  | 'EMatchPhase::GoalScore'
  | 'EMatchPhase::Intermission'
  | 'EMatchPhase::PostGameCelebration';

export const PHASE_LABELS: Record<MatchPhase, string> = {
  'EMatchPhase::None':                'Idle',
  'EMatchPhase::BanSelect':           'Ban Phase',
  'EMatchPhase::LoadoutSelect':       'Loadout Select',
  'EMatchPhase::CharacterSelect':     'Character Select',
  'EMatchPhase::VersusScreen':        'Versus Screen',
  'EMatchPhase::FaceOffIntro':        'Face-Off Intro',
  'EMatchPhase::InGame':              'In Game',
  'EMatchPhase::GoalScore':           'Goal Scored',
  'EMatchPhase::Intermission':        'Intermission',
  'EMatchPhase::PostGameCelebration': 'Post Game',
};


async function readIdentity(): Promise<{ jwt: string; refreshToken: string }> {
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

  return accessTokens as { jwt: string; refreshToken: string };
}

// 1) Verify identity.json and OmegaStrikers.log exist, and identity has required keys
export async function verifyClientFiles(): Promise<void> {
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

  await readIdentity();
}

// 2) Fetch the player's account info from the Ody API
export async function fetchSelfQuery(): Promise<SelfQuery> {
  const { jwt, refreshToken } = await readIdentity();

  const res = await fetch(`${OdyAPI}/v1/me`, {
    headers: {
      'X-Authorization': `Bearer ${jwt}`,
      'x-Refresh-Token': refreshToken,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch account info from Ody API. Status: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<SelfQuery>;
}

// 3) Read the log from the beginning and find the most recent match phase
export async function readInitialMatchPhase(): Promise<MatchPhase | null> {
  const home = await homeDir();
  const logPath = await join(home, windows_log);
 
  const [content] = await invoke<[string, number]>('read_log_from', {
    path: logPath,
    offset: 0,
  });
 
  if (!content) {
    console.warn('[init] Log file was empty, could not determine initial match phase.');
    return null;
  }
 
  const PHASE_REGEX = /LogPMPerfStatsSubsystem: Game context: MatchPhase: '(EMatchPhase::\w+)'/;
 
  let lastPhase: MatchPhase | null = null;
  for (const line of content.split('\n')) {
    const match = line.match(PHASE_REGEX);
    if (match) lastPhase = match[1] as MatchPhase;
  }
 
  if (!lastPhase) {
    console.warn('[init] No match phase found in log. Game may not have been launched yet.');
    return null;
  }
 
  return lastPhase;
}