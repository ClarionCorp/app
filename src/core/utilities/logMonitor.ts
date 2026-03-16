import { platform } from "@tauri-apps/plugin-os";
import { homeDir, join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { windows_log, linux_log, macos_log } from "../constants";
import { logger } from "../logger";

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

// Byte offset into the log file — persists across page navigations
let _byteOffset = 0;
// Buffer for any incomplete line fragment at the end of the last read
let _partial = '';

export const logState = {
  get byteOffset() { return _byteOffset; },
  set byteOffset(n: number) { _byteOffset = n; },
};

export async function getLogPath(): Promise<string> {
  const os = platform();
  const home = await homeDir();
  let suffix = '';
  switch (os) {
    case 'windows': suffix = windows_log; break;
    case 'linux':   suffix = linux_log;   break;
    case 'macos':   suffix = macos_log;   break;
    default:        suffix = windows_log;
  }
  // Absolute paths (like WSL /mnt/c/...) are used as is
  const resolved = suffix.startsWith('/') ? suffix : await join(home, suffix);
  logger.info(`Log path resolved (os=${os})`, resolved);
  return resolved;
}

export function parseMatchPhase(line: string): MatchPhase | null {
  const match = line.match(/LogPMPerfStatsSubsystem: Game context: MatchPhase: '(EMatchPhase::\w+)'/);
  if (!match) return null;
  const phase = match[1] as MatchPhase;
  logger.info(`Phase -> ${phase}`);
  return phase;
}

export function parsePlayerRegistration(line: string): string | null {
  const match = line.match(/LogPMPlayerState: Player '([^']+)' registering training '([^']+)'/);
  if (!match) return null;
  logger.info(`Player detected: ${match[1]} (${match[2]})`);
  return match[1];
}

/** Read only the bytes appended since the last call.
 *  Throws if the file cannot be read — callers are responsible for handling errors. */
export async function readNewLines(logPath: string): Promise<string[]> {
  const before = performance.now();
  const [newContent, newOffset] = await invoke<[string, number]>('read_log_from', {
    path: logPath,
    offset: _byteOffset,
  });

  if (!newContent) return [];

  _byteOffset = newOffset;

  const text = _partial + newContent;
  const parts = text.split('\n');
  _partial = parts.pop() ?? '';

  const diff = performance.now() - before;
  logger.debug(`Read ${parts.length} new line(s) (${newContent.length} bytes) [${diff.toFixed(1)} ms]`);
  return parts;
}

/** Seek to end of log so we only see events from this point forward. */
export async function seekToEnd(logPath: string): Promise<void> {
  try {
    const [, newOffset] = await invoke<[string, number]>('read_log_from', {
      path: logPath,
      offset: Number.MAX_SAFE_INTEGER,
    });
    _byteOffset = newOffset;
    _partial = '';
    logger.info(`Seeked to end of log (byte ${_byteOffset})`);
  } catch (e) {
    _byteOffset = 0;
    _partial = '';
    logger.warn('seekToEnd failed - starting from byte 0', e);
  }
}
