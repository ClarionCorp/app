type TeamNum = 1 | 2;

// Replaced GameStateMod and GameSessionMod
export type MetaJSON = {
  last_changed: 'state' | 'queue' | 'party',
  queue: {
    id: null | string,
    state: 'Unknown' | 'Idle' | 'Queued' | 'FoundMatch' | 'StartingGame' | 'InGame' | 'EMatchmakingStateV2_MAX',
    timestamp: number, // last updated, helpful for queue times
  },
  local_player: string, // id
  party_size: number,
  max_party_size: number, // usually 3
  party_members: {
    player_id: string,
    level: number | null,
    is_local: boolean
  }[],
  game_state: {
    old_phase: string,
    new_phase: string
  },
  custom_lobby: {
    lobby_name: string,
    lobby_id: string,
    is_private: boolean,
    regions: string[],
    member_count: number,
    lobby_size: number,
    // add member info later
  } | null
}

// Separated from GameStateMod
export type MatchJSON = {
  start_time: number, // unix timestamp, reliable
  team1: {
    goals: number,
    sets: number,
  },
  team2: {
    goals: number,
    sets: number,
  },
  map: {
    name: string, // Taiko Temple
    id: string, // GMD_Drums
  },
  banned_characters: [], // gotta get this still
  timestamp: number, // last updated
}

// Replaced PlayerFinderMod
export type PlayersJSON = {
  players: {
    name: string,
    player_id: string,
    team: TeamNum,
    role: 'Forward' | 'Goalie',
    character_id: string | null,
    character_name: string | null,
    intermission_xp: number,
    xp: number,
    ping_ms: number | null,
    knockouts: number, // earned this match
    trainings: string[]
  }[],
  timestamp: number, // last updated
}

// Replaced PostGameStatsMod
export type PostGameJSON = {
  winning_team: TeamNum,
  resolution: 'Normal' | 'Surrender' | 'AutoCancel',
  mvp: {
    player_id: string,
    name: string,
    team: TeamNum,
  },
  players: {
    player_id: string,
    name: string,
    team: TeamNum,
    goals: number,
    assists: number,
    saves: number,
    knockouts: number,
    redirects: number,
    damage: number,
    shots: number,
    orbs: number,
    mvp: boolean,
  }[],
  timestamp: number, // last updated
}

export type PlayerTrainings = {
  username: string,
  trainings: string[],
}

export type TimelineEventType = 'GAME_START' | 'GOAL_SCORE' | 'WON_SET' | 'WON_GAME';
export type TimelineEntry = {
  when: Date,
  event: TimelineEventType,
  team?: TeamNum,
}

export type MatchPlayer = {
  name: string, // username
  playerId: string | null, // should really never be null tbh
  rating: number | null,
  characterId: string,
  level: number,
  xpGoals: number[],
  role: 'Forward' | 'Goalie',
  team: TeamNum,
  trainings: string[],
  goals: number,
  redirects: number,
  kos: number,
  damage: number,
  shots: number,
  orbs: number,
  assists: number,
  saves: number,
  mvp: boolean
}