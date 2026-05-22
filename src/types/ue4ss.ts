import { getLevelFromXP } from "../core/objects/levels";
import { MatchPlayersTable } from "./database";

type TeamNum = 1 | 2;

export type PlayerFinderJSON = {
  players: {
    name: string,
    team: TeamNum,
    role: 'Forward' | 'Goalie',
    character_id: string, // CD_NimbleBlaster
    character_name: string, // "Drek'ar"
    level: number
  }[],
  timestamp: number, // keeps tauri updating even if data is the same
};

export type PlayerAwakenings = {
  username: string,
  trainings: string[],
}

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


export type MatchPlayer = {
  name: string, // username
  rating: number | null,
  characterId: string,
  level: number,
  role: 'Forward' | 'Goalie',
  team: 1 | 2,
  awakenings: string[],
  goals: string,
  redirects: string,
  kos: string,
  damage: string,
  shots: string,
  orbs: string,
  assists: string,
  saves: string,
}


export function mergeMatchPlayers(
  players: MatchPlayersTable[],
  postGameStats: PostGameStatsJSON,
  awakenings: PlayerAwakenings[]
): MatchPlayer[] {
  return players.map(player => {
    const stats = postGameStats.find(s => s.name === player.username);
    const playerAwakenings = awakenings.find(a => a.username === player.username);

    return {
      name: player.username,
      rating: player.rating,
      characterId: player.charId ?? '',
      level: getLevelFromXP(player.xp ?? 0),
      role: player.role ?? 'Forward',
      team: player.teamNum ?? 1,
      awakenings: playerAwakenings?.trainings ?? [],
      goals: stats?.goals ?? '0',
      redirects: stats?.redirects ?? '0',
      kos: stats?.kos ?? '0',
      damage: stats?.damage ?? '0',
      shots: stats?.shots ?? '0',
      orbs: stats?.orbs ?? '0',
      assists: stats?.assists ?? '0',
      saves: stats?.saves ?? '0',
    };
  });
}