// rename file later lol

// Replaced GameStateMod and GameSessionMod
export type MetaJSON = {
  last_changed: 'state' | 'queue' | 'party',
  queue: {
    name: null | string,
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
  }
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
    team: 1 | 2 | number,
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
  winning_team: 1 | 2 | number,
  resolution: 'Normal' | 'Surrender' | 'AutoCancel',
  mvp: {
    player_id: string,
    name: string,
    team: 1 | 2 | number,
  },
  players: {
    player_id: string,
    name: string,
    team: 1 | 2 | number,
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