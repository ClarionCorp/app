import { auth, currentMatch, matchHistory, matchPlayers, user } from "../core/database/schema";

export type UserTable = typeof user.$inferSelect;
export type AuthTable = typeof auth.$inferSelect;
export type CurrentMatchTable = typeof currentMatch.$inferSelect;
export type MatchPlayersTable = typeof matchPlayers.$inferSelect;
export type MatchHistoryTable = typeof matchHistory.$inferSelect;