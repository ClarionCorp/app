import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { MatchPlayer } from "../../types/ue4ss";
import { PlayerCharJSON, QueueStates } from "../../types/database";
import { Playstyle } from "../../types/clarion";

// Only one row that stores basic app settings
export const appSettings = sqliteTable("appSettings", {
  id: integer("id").primaryKey(),
  gameDirectory: text("gameDirectory"),
  drpcEnabled: integer("drpcEnabled", { mode: "boolean" }).notNull().default(true),
  notifyQueuePop: integer("notifyQueuePop", { mode: "boolean" }).notNull().default(false), // i don't want to annoy anyone :P
  queuePopVol: integer("queuePopVol").notNull().default(50),
  queuePopType: text("queuePopType").notNull().default("Ai.Mi"),
  createdAt: integer("created_at", { mode: "timestamp" }),
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
  region: text("region"), // grabbed from logs
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
  favChar: text("favChar", { mode: "json" }).$type<PlayerCharJSON[]>().notNull().default([]), // most games played
  bestChar: text("bestChar", { mode: "json" }).$type<PlayerCharJSON[]>().notNull().default([]), // highest WR
  normWR: real("normWR"),
  rankedWR: real("rankedWR"),
  normGames: integer("normGames"),
  rankedGames: integer("rankedGames"),
  playstyle: text("playstyle", { mode: "json" }).$type<Playstyle>(),
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

// Table should reset when game is reopened.
export const sessionInfo = sqliteTable("sessionInfo", {
  id: integer("id").primaryKey(),
  partySize: integer("partySize").notNull().default(0),
  maxPartySize: integer("maxPartySize").notNull().default(3),
  queueState: text("queueState").$type<QueueStates>(),
  queueName: text("queueName"),
  // eventually add session rating tracking here :)
});