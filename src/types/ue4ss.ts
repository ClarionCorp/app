type TeamNum = 1 | 2;

export type PlayerFinderJSON = {
  players: {
    name: string,
    team: TeamNum,
    role: 'Forward' | 'Goalie',
    character_id: string, // CD_NimbleBlaster
    character_name: string, // "Drek'ar"
  }[],
  timestamp: number, // keeps tauri updating even if data is the same
};

export type GameStateJSON = {
  phase: string,
  my_team: TeamNum,
  t1_goals: number,
  t1_sets: number,
  t2_goals: number,
  t2_sets: number,
  map: string,
  map_id: string,
  queue: string,
  timestamp: number, // keeps tauri updating even if data is the same
}

export type PostGameStatsJSON = [{
  goals: string,
  redirects: string,
  kos: string,
  damage: string,
  shots: string,
  orbs: string,
  assists: string,
  name: string, // username
  saves: string,
}]