import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { homeDir, join } from '@tauri-apps/api/path';
import { windows_log } from './constants';

export type MatchPhase =
  | 'EMatchPhase::Unknown'
  | 'EMatchPhase::None'
  | 'EMatchPhase::PreGame'
  | 'EMatchPhase::ArenaOverview'
  | 'EMatchPhase::BanSelect'
  | 'EMatchPhase::CharacterPreSelect'
  | 'EMatchPhase::LoadoutSelect'
  | 'EMatchPhase::CharacterSelect'
  | 'EMatchPhase::VersusScreen'
  | 'EMatchPhase::FaceOffIntro'
  | 'EMatchPhase::FaceOffCountdown'
  | 'EMatchPhase::InGame'
  | 'EMatchPhase::GoalScore'
  | 'EMatchPhase::GoalCelebration'
  | 'EMatchPhase::Intermission'
  | 'EMatchPhase::IntermissionMvp'
  | 'EMatchPhase::IntermissionIntro'
  | 'EMatchPhase::PostGameCelebration'
  | 'EMatchPhase::PostGameSummary';

export const PHASE_LABELS: Partial<Record<MatchPhase, string>> = {
  'EMatchPhase::None':                 'Idle',
  'EMatchPhase::PreGame':              'Pre Game',
  'EMatchPhase::ArenaOverview':        'Arena Overview',
  'EMatchPhase::CharacterPreSelect':   'Character PreSelect',
  'EMatchPhase::BanSelect':            'Ban Phase',
  'EMatchPhase::LoadoutSelect':        'Loadout Select',
  'EMatchPhase::CharacterSelect':      'Character Select',
  'EMatchPhase::VersusScreen':         'Versus Screen',
  'EMatchPhase::FaceOffIntro':         'Face-Off',
  'EMatchPhase::FaceOffCountdown':     'Face-Off',
  'EMatchPhase::InGame':               'In Game',
  'EMatchPhase::GoalScore':            'Goal Scored',
  'EMatchPhase::GoalCelebration':      'Goal Celebration',
  'EMatchPhase::Intermission':         'Intermission',
  'EMatchPhase::IntermissionMvp':      'Intermission',
  'EMatchPhase::IntermissionIntro':    'Intermission',
  'EMatchPhase::PostGameCelebration':  'Post Game',
  'EMatchPhase::PostGameSummary':      'Post Game',
};

export const PHASE_GROUPS = {
  out_of_game: [
    'EMatchPhase::Unknown',
    'EMatchPhase::None',
    'EMatchPhase::PostGameCelebration',
    'EMatchPhase::PostGameSummary'
  ],
  starting: [
    'EMatchPhase::PreGame',
    'EMatchPhase::ArenaOverview',
    'EMatchPhase::CharacterPreSelect',
    'EMatchPhase::BanSelect',
    'EMatchPhase::LoadoutSelect',
    'EMatchPhase::CharacterSelect',
    'EMatchPhase::VersusScreen',
  ],
  in_game: [
    'EMatchPhase::InGame',
    'EMatchPhase::FaceOffIntro',
    'EMatchPhase::FaceOffCountdown',
    'EMatchPhase::GoalScore',
    'EMatchPhase::GoalCelebration',
    'EMatchPhase::IntermissionMvp',
    'EMatchPhase::IntermissionIntro',
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


export type ScoreEvent = {
  team: 'TeamOne' | 'TeamTwo';
  from: number;
  to: number;
};
 
export type LogMonitorCallbacks = {
  onMatchPhase?: (phase: MatchPhase) => void | Promise<void>;
  onPlayerRegistered?: (username: string) => void | Promise<void>;
  onLevel?: (level: string) => void | Promise<void>;
  onMyCharacter?: (character: string) => void | Promise<void>;
  onScore?: (event: ScoreEvent) => void | Promise<void>;
  onMyTeam?: (team: 'TeamOne' | 'TeamTwo') => void;
};
 
export async function startLogMonitor(
  offset: number,
  callbacks: LogMonitorCallbacks
): Promise<UnlistenFn> {
  const home = await homeDir();
  const logPath = await join(home, windows_log);
 
  await invoke('start_log_monitor', { path: logPath, offset });
 
  const unlisteners: UnlistenFn[] = [];
 
  if (callbacks.onMatchPhase) {
    unlisteners.push(await listen<string>('log://match-phase', (e) => {
      console.log(`[monitor] Phase -> ${e.payload}`);
      void callbacks.onMatchPhase?.(e.payload as MatchPhase);
    }));
  }
 
  if (callbacks.onPlayerRegistered) {
    unlisteners.push(await listen<string>('log://player-registered', (e) => {
      console.log(`[monitor] Player registered: ${e.payload}`);
      callbacks.onPlayerRegistered?.(e.payload);
    }));
  }
 
  if (callbacks.onLevel) {
    unlisteners.push(await listen<string>('log://level', (e) => {
      console.log(`[monitor] Level -> ${e.payload}`);
      callbacks.onLevel?.(e.payload);
    }));
  }
 
  if (callbacks.onMyCharacter) {
    unlisteners.push(await listen<string>('log://my-character', (e) => {
      console.log(`[monitor] My character -> ${e.payload}`);
      callbacks.onMyCharacter?.(e.payload);
    }));
  }
 
  if (callbacks.onScore) {
    unlisteners.push(await listen<string>('log://score', (e) => {
      try {
        const parsed: ScoreEvent = JSON.parse(e.payload);
        console.log(`[monitor] Score -> ${parsed.team} ${parsed.from} -> ${parsed.to}`);
        callbacks.onScore?.(parsed);
      } catch {
        console.warn('[monitor] Failed to parse score event:', e.payload);
      }
    }));
  }

  if (callbacks.onMyTeam) {
    unlisteners.push(await listen<string>('log://my-team', (e) => {
      console.log(`[monitor] My team -> ${e.payload}`);
      callbacks.onMyTeam?.(e.payload as 'TeamOne' | 'TeamTwo');
    }));
  }
 
  return () => unlisteners.forEach((fn) => fn());
}