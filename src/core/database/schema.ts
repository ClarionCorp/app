import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { MatchPlayer } from "../../types/ue4ss";

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
  trainings: text("trainings", { mode: "json" }).$type<string[]>().notNull().default([]),

  teamOnePts: integer("teamOnePts"),
  teamTwoPts: integer("teamTwoPts"),
  teamOneSets: integer("teamOneSets"),
  teamTwoSets: integer("teamTwoSets"),

  startedAt: integer("startedAt", { mode: "timestamp" }),
});

// Saves data sent from PlayerFinderMod (multi-row)
export const matchPlayers = sqliteTable("matchPlayers", {
  username: text("username").notNull().unique().primaryKey(),
  teamNum: integer("teamNum").$type<1 | 2>(), // can be null if not on a team yet
  role: text("role").$type<'Forward' | 'Goalie'>(),
  charName: text("charName"),
  charId: text("charId"),
  rating: integer("rating"),
  isMe: integer("isMe", { mode: "boolean" }).notNull().default(false), // might go unused
  xp: integer("xp").default(0),
  trainings: text("trainings", { mode: "json" }).$type<string[]>().notNull().default([]),
});

// Basic list of previous matches for local match history
export const matchHistory = sqliteTable("matchHistory", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  mapId: text("mapId").notNull(),
  duration: integer("duration").notNull(),
  queue: text("queue").notNull(),

  players: text("players", { mode: 'json' }).$type<MatchPlayer[]>().notNull().default([]),

  t1_sets: integer("t1_sets").notNull(),
  t2_sets: integer("t2_sets").notNull(),
  myTeam: integer("myTeam").notNull(), // just easier than pathing thru players
  wonGame: integer("wonGame", { mode: "boolean" }).notNull(),

  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});