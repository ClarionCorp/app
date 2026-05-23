// This file should match what the AMA API expects

type OnlineStatus = 'IDLING' | 'STARTING' | 'IN_GAME' | 'OFFLINE'

const gameStateMap: Record<string, OnlineStatus> = {
  'Unknown':                'IDLING',
  'None':                   'IDLING',
  'PostGameCelebration':    'IDLING',
  'PostGameSummary':        'IDLING',

  'PreGame':                'STARTING',
  'ArenaOverview':          'STARTING',
  'CharacterPreSelect':     'STARTING',
  'BanSelect':              'STARTING',
  'LoadoutSelect':          'STARTING',
  'CharacterSelect':        'STARTING',
  'VersusScreen':           'STARTING',

  'InGame':                 'IN_GAME',
  'FaceOffIntro':           'IN_GAME',
  'FaceOffCountdown':       'IN_GAME',
  'GoalScore':              'IN_GAME',
  'GoalCelebration':        'IN_GAME',
  'IntermissionMvp':        'IN_GAME',
  'IntermissionIntro':      'IN_GAME',
  'Intermission':           'IN_GAME',
  'IntermissionOutro':      'IN_GAME',
};

export function getGameStatus(state: string | undefined | null): OnlineStatus {
  if (!state) return 'OFFLINE';
  return gameStateMap[state] ?? 'OFFLINE';
}