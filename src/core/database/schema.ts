import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Only one row that stores basic, refetchable user data
export const user = sqliteTable("user", {
  id: integer("id").primaryKey(), // always 1
  username: text("username").notNull(),
  playerId: text("player_id").notNull(),
  emoticonId: text("emoticon_id").notNull(),
  nameplateId: text("nameplate_id").notNull(),
  titleId: text("title_id").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  masteryLevel: integer("mastery_level").notNull(),
  playerStatus: text("player_status").notNull(),
  displayNameStatus: text("display_name_status").notNull(),
  lastDisplayNameChangeTimestamp: integer("last_display_name_change_timestamp", { mode: "timestamp" }),
  matchmakingRegion: text("matchmaking_region").notNull(),
  gameLiftRegionUrls: text("gamelift_region_urls", { mode: "json" }).$type<{ region: string; url: string }[]>().notNull().default([]),
  discordId: text("discord_id"), // nullable, no connection = null
  rating: integer("rating"),
});

// Only one row that stores basic, refetchable auth tokens
export const auth = sqliteTable("auth", {
  id: integer("id").primaryKey(),
  odyJwt: text("odyJwt").notNull(),
  odyRft: text("odyRft").notNull(),
  ccJwt: text("ccJwt"),
  appId: text("appId").notNull().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Only one row that stores basic, refetchable current game data
// I would normally use the match table (that has history) with a bool, but we'll do the safer option for now (this)
export const currentMatch = sqliteTable("currentMatch", {
  id: integer("id").primaryKey(),

  rawPhase: text("rawPhase").notNull(),
  level: text("level"),
  queue: text("queue"),
  myCharacter: text("myCharacter"),
  myTeam: text("myTeam"),

  teamOnePts: integer("teamOnePts"),
  teamTwoPts: integer("teamTwoPts"),
  teamOneSets: integer("teamOneSets"),
  teamTwoSets: integer("teamTwoSets"),

  playerNames: text("playerNames", { mode: 'json' }).$type<string[]>().notNull().default([]),

  startedAt: integer("startedAt", { mode: "timestamp" }).notNull(),
});


// Only one row that stores basic app settings
export const appSettings = sqliteTable("appSettings", {
  id: integer("id").primaryKey(),
  gameDir: text("gameDir").notNull().default("C:\\Program Files (x86)\\Steam\\steamapps\\common\\OmegaStrikers"),
  finishedSetup: integer("finishedSetup", { mode: "boolean" }).notNull().default(false),

  // Consents
  sendStats: integer("sendStats", { mode: "boolean" }).notNull().default(true),           // Match History, etc.
  sendPlayState: integer("sendPlayState", { mode: "boolean" }).notNull().default(true),   // Discord RPC, CC "queuing" pilot status
  sendPlayCount: integer("sendPlayCount", { mode: "boolean" }).notNull().default(true),   // Simply +1 to the player counter (anonymous)
  appTerms: integer("appTerms", { mode: "boolean" }).notNull().default(false),            // App ToS
  gbTerms: integer("gbTerms", { mode: "boolean" }).notNull().default(false),              // GameBanana ToS for downloading mods
  ue4ss: text("ue4ss"),                                                                   // UE4SS Mod Release Version. null = not installed.

  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const installedMods = sqliteTable("installedMods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gbId: integer("gbId"),
  name: text("name").notNull(),
  version: text("version"),
  thumbUrl: text("thumbUrl"),
  submitterName: text("submitterName"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  fileNames: text("fileNames", { mode: "json" }).$type<string[]>().notNull().default([]),
  installedAt: integer("installedAt", { mode: "timestamp" }).notNull(),
});

export const modCache = sqliteTable("modCache", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  version: text("version"),
  thumbUrl: text("thumbUrl"),
  submitterName: text("submitterName").notNull(),
  categoryName: text("categoryName"),
  categoryId: integer("categoryId"),
  likeCount: integer("likeCount").notNull().default(0),
  viewCount: integer("viewCount").notNull().default(0),
  wasFeatured: integer("wasFeatured", { mode: "boolean" }).notNull().default(false),
  profileUrl: text("profileUrl").notNull(),
  popularityScore: real("popularityScore").notNull().default(0),
  cachedAt: integer("cachedAt", { mode: "timestamp" }).notNull(),
});


// Basic list of previous matches for local match history
// Doesn't get cleared in "Reset Database", actual file must be deleted
export const matchHistory = sqliteTable("matchHistory", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  players: text("players", { mode: 'json' }).$type<string[]>().notNull().default([]),
  mapId: text("mapId").notNull(),
  characterId: text("characterId").notNull(),
  duration: integer("duration").notNull(),
  myScore: integer("myScore").notNull(),
  enemyScore: integer("enemyScore").notNull(),

  wonGame: integer("wonGame", { mode: "boolean" }).notNull(),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  kos: integer("kos").notNull().default(0),
  damage: integer("damage").notNull().default(0),
  shots: integer("shots").notNull().default(0),
  redirects: integer("redirects").notNull().default(0),
  orbs: integer("orbs").notNull().default(0),

  allGameStats: text("allGameStats", { mode: 'json' }).notNull().default([]),

  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});