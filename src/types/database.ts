import { appSettings, auth, currentMatch, installedMods, modCache, user } from "../core/database/schema";

export type UserTable = typeof user.$inferSelect;
export type AuthTable = typeof auth.$inferSelect;
export type CurrentMatchTable = typeof currentMatch.$inferSelect;
export type AppSettingsTable = typeof appSettings.$inferSelect;
export type InstalledMod = typeof installedMods.$inferSelect;
export type CachedMod = typeof modCache.$inferSelect;

export type TelemetryOption = 'game_stats' | 'play_state' | 'play_count';