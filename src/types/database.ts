import { auth, currentMatch, matchHistory, matchPlayers, user } from "../core/database/schema";

export type UserTable = typeof user.$inferSelect;
export type AuthTable = typeof auth.$inferSelect;
export type CurrentMatchTable = typeof currentMatch.$inferSelect;
export type MatchPlayersTable = typeof matchPlayers.$inferSelect;
export type MatchHistoryTable = typeof matchHistory.$inferSelect;


export type PlayerCharJSON = {
  characterId: string,
  queue: 'Normal' | 'Ranked',
  role: 'Forward' | 'Goalie',
  games: number,
  winrate: number,
}

export type QueueStates = 'Unknown' | 'Idle' | 'Queued' | 'FoundMatch' | 'StartingGame' | 'InGame' | 'EMatchmakingStateV2_MAX';