import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { homeDir, join } from '@tauri-apps/api/path';
import { windows_log } from './constants';

export type MatchPhase =
  | 'EMatchPhase::Unknown'
  | 'EMatchPhase::None'
  | 'EMatchPhase::BanSelect'
  | 'EMatchPhase::LoadoutSelect'
  | 'EMatchPhase::CharacterSelect'
  | 'EMatchPhase::VersusScreen'
  | 'EMatchPhase::FaceOffIntro'
  | 'EMatchPhase::FaceOffCountdown'
  | 'EMatchPhase::InGame'
  | 'EMatchPhase::GoalScore'
  | 'EMatchPhase::Intermission'
  | 'EMatchPhase::PostGameCelebration';

export const PHASE_LABELS: Partial<Record<MatchPhase, string>> = {
  'EMatchPhase::None':                 'Idle',
  'EMatchPhase::BanSelect':            'Ban Phase',
  'EMatchPhase::LoadoutSelect':        'Loadout Select',
  'EMatchPhase::CharacterSelect':      'Character Select',
  'EMatchPhase::VersusScreen':         'Versus Screen',
  'EMatchPhase::FaceOffIntro':         'Face-Off',
  'EMatchPhase::FaceOffCountdown':     'Face-Off',
  'EMatchPhase::InGame':               'In Game',
  'EMatchPhase::GoalScore':            'Goal Scored',
  'EMatchPhase::Intermission':         'Intermission',
  'EMatchPhase::PostGameCelebration':  'Post Game',
};

export const PHASE_GROUPS = {
  out_of_game: [
    'EMatchPhase::Unknown',
    'EMatchPhase::None',
    'EMatchPhase::PostGameCelebration'
  ],
  starting: [
    'EMatchPhase::BanSelect',
    'EMatchPhase::LoadoutSelect',
    'EMatchPhase::CharacterSelect',
    'EMatchPhase::VersusScreen',
    'EMatchPhase::FaceOffIntro',
    'EMatchPhase::FaceOffCountdown'
  ],
  in_game: [
    'EMatchPhase::InGame',
    'EMatchPhase::GoalScore',
    'EMatchPhase::Intermission'
  ],
} as const;

export type PhaseGroup = keyof typeof PHASE_GROUPS;

const PHASE_GROUP_COLORS: Record<PhaseGroup, string> = {
  out_of_game: 'text-char-subtle',
  starting: 'text-yellow-400',
  in_game: 'text-green-400',
};

export function getPhaseGroup(phase: string): PhaseGroup {
  for (const [group, phases] of Object.entries(PHASE_GROUPS)) {
    if ((phases as readonly string[]).includes(phase)) return group as PhaseGroup;
  }
  return 'out_of_game';
}

export const PHASE_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(PHASE_GROUPS).flatMap(([group, phases]) =>
    phases.map((phase) => [phase, PHASE_GROUP_COLORS[group as PhaseGroup]])
  )
);




export type LogMonitorCallbacks = {
  onMatchPhase?: (phase: MatchPhase) => void;
  onPlayerRegistered?: (username: string) => void;
};

// Starts the Rust log monitor and wires up event listeners.
// Returns an unlisten function to clean up listeners (does NOT stop the Rust thread).
export async function startLogMonitor(
  offset: number,
  callbacks: LogMonitorCallbacks
): Promise<UnlistenFn> {
  const home = await homeDir();
  const logPath = await join(home, windows_log);

  await invoke('start_log_monitor', { path: logPath, offset });

  const unlisteners: UnlistenFn[] = [];

  if (callbacks.onMatchPhase) {
    const unlisten = await listen<string>('log://match-phase', (event) => {
      console.log(`Changing GameState to ${event.payload}.`);
      callbacks.onMatchPhase?.(event.payload as MatchPhase);
    });
    unlisteners.push(unlisten);
  }

  if (callbacks.onPlayerRegistered) {
    const unlisten = await listen<string>('log://player-registered', (event) => {
      console.log(`Player Registered: ${event.payload}.`);
      callbacks.onPlayerRegistered?.(event.payload);
    });
    unlisteners.push(unlisten);
  }

  // Return a single cleanup function that removes all listeners
  return () => unlisteners.forEach((fn) => fn());
}