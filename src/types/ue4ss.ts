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
    level: number,
    trainings: string[]
  }[],
  timestamp: number, // keeps tauri updating even if data is the same
};

export type PlayerTrainings = {
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
  timestamp: number, // keeps tauri updating even if data is the same
}

export type GameSessionJSON = {
  party_size: number,
  max_party_size: number,
  mm_state: 0 | 1 | 2 | 3 | 4 | 5 | 6, // Unknown, Idle, Queued, FoundMatch, StartingGame, InGame, EMatchmakingStateV2_MAX
  queue_name: string | null,
  timestamp: number, // keeps tauri updating even if data is the same
}

export type TrainingsChangedJSON = {
  trainings: string[]
}

// In order, just because
export type PostGameStatsJSON = [{
  id: string,
  name: string, // username
  team: number,
  goals: string,
  assists: string,
  saves: string,
  kos: string,
  damage: string,
  shots: string,
  redirects: string,
  orbs: string,
}]


export type MatchPlayer = {
  name: string, // username
  rating: number | null,
  characterId: string,
  level: number,
  role: 'Forward' | 'Goalie',
  team: 1 | 2,
  trainings: string[],
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
): MatchPlayer[] {
  return players.map(player => {
    const stats = postGameStats.find(s => s.name === player.username);

    return {
      name: player.username,
      playerId: player.playerId,
      rating: player.rating,
      characterId: player.charId ?? '',
      level: getLevelFromXP(player.xp ?? 0),
      role: player.role ?? 'Forward',
      team: player.teamNum ?? 1,
      trainings: player.trainings,
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