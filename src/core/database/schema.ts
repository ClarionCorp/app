import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Only one row that stores basic app settings
export const appSettings = sqliteTable("appSettings", {
  id: integer("id").primaryKey(),
  gameDirectory: text("gameDirectory"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

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

// Saves data sent from GameStateMod (one row)
export const currentMatch = sqliteTable("currentMatch", {
  id: integer("id").primaryKey(),
  gameState: text("gameState"),
  map: text("map"),
  queue: text("queue"), // Ranked, Norms, Customs, etc.
  teamNum: integer("teamNum").$type<1 | 2>(),

  teamOnePts: integer("teamOnePts"),
  teamTwoPts: integer("teamTwoPts"),
  teamOneSets: integer("teamOneSets"),
  teamTwoSets: integer("teamTwoSets"),

  startedAt: integer("startedAt", { mode: "timestamp" }).notNull(),
});

// Saves data sent from PlayerFinderMod (multi-row)
export const matchPlayers = sqliteTable("matchPlayers", {
  username: text("username").notNull(),
  teamNum: integer("teamNum").$type<1 | 2>(), // can be null if not on a team yet
  role: text("role").$type<'Forward' | 'Goalie'>(),
  charName: text("charName"),
  charId: text("charId"),
  rating: integer("rating").default(0),
  isMe: integer("isMe", { mode: "boolean" }).notNull().default(false), // might go unused
});

// Basic list of previous matches for local match history (will prob be removed l8r)
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