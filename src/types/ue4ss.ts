type TeamNum = 1 | 2;

export type PlayerFinderJSON = [{
  name: string,
  team: TeamNum,
  role: 'Forward' | 'Goalie',
  character_id: string, // CD_NimbleBlaster
  character_name: string, // "Drek'ar"
}];

export type GameStateJSON = {
  phase: string,
  my_team: TeamNum,
  t1_goals: number,
  t1_sets: number,
  t2_goals: number,
  t2_sets: number
}

export type PostGameStatsJSON = {
  // forgot to save
}