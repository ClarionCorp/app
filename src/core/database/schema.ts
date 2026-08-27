import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { MatchPlayer, TimelineEntry } from "../../types/ue4ss";
import { QueueStates } from "../../types/database";
import { Playstyle, SmurfConfidence } from "../../types/clarion";
import { PreferredDataSources } from "../../types/appAPI";
import { ProminentChar } from "../utilities/players";

// Only one row that stores basic app settings
export const appSettings = sqliteTable("appSettings", {
  id: integer("id").primaryKey(),
  seenWelcome: integer("seenWelcome", { mode: "boolean" }).notNull().default(false), // going to the leave this one up here
  gameDirectory: text("gameDirectory"),
  drpcEnabled: integer("drpcEnabled", { mode: "boolean" }).notNull().default(true),
  notifyQueuePop: integer("notifyQueuePop", { mode: "boolean" }).notNull().default(false), // i don't want to annoy anyone :P
  queuePopVol: integer("queuePopVol").notNull().default(50),
  queuePopType: text("queuePopType").notNull().default("Ai.Mi"),
  exitOnGameClose: integer("exitOnGameClose", { mode: "boolean" }).notNull().default(false),
  sendMatchData: integer("sendMatchData", { mode: "boolean" }).notNull().default(false),
  prefDataSource: text("prefDataSource").$type<PreferredDataSources>().default('ClarionCorp'),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// Keep track of which dialogues have been shown to the user
// The existence of an entry here means that it has been shown
export const seenDialogues = sqliteTable("seenDialogues", {
  id: text("id").primaryKey().notNull().unique(), // e.g. 'DISCORD_CTA'
  count: integer("count").notNull().default(1), // in case we need to keep track
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

// Only one row that stores basic, refetchable user data
export const user = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  nameHistory: text("name_history", { mode: "json" }).$type<string[]>().notNull().default([]),
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
  queue: text("queue"), // id, must be translated before use
  queueState: text("queueState").$type<QueueStates>(), // Idle, FoundMatch, InGame, etc.
  partySize: integer("partySize").notNull().default(0),
  teamNum: integer("teamNum").$type<1 | 2>(),
  trainings: text("trainings", { mode: "json" }).$type<string[]>().notNull().default([]),
  bans: text("bans", { mode: "json" }).$type<string[]>().notNull().default([]),
  timeline: text("timeline", { mode: 'json' }).$type<TimelineEntry[]>().notNull().default([]),

  teamOnePts: integer("teamOnePts"),
  teamTwoPts: integer("teamTwoPts"),
  teamOneSets: integer("teamOneSets"),
  teamTwoSets: integer("teamTwoSets"),

  startedAt: integer("startedAt", { mode: "timestamp" }),
});

// Saves data sent from PlayerFinderMod (multi-row)
export const matchPlayers = sqliteTable("matchPlayers", {
  username: text("username").notNull().unique().primaryKey(),
  playerId: text("playerId").unique().notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  teamNum: integer("teamNum").$type<1 | 2>(), // can be null if not on a team yet
  role: text("role").$type<'Forward' | 'Goalie'>(),
  charName: text("charName"),
  charId: text("charId"),
  rating: integer("rating"),
  isMe: integer("isMe", { mode: "boolean" }).notNull().default(false), // might go unused
  xp: integer("xp").default(0),
  gainedXp: integer("gainedXp").default(0), // intermissionXp
  xpGoals: text("xpGoals", { mode: "json" }).$type<number[]>().notNull().default([]),
  ping: integer("ping").default(0),
  trainings: text("trainings", { mode: "json" }).$type<string[]>().notNull().default([]),
  favChar: text("favChar", { mode: "json" }).$type<ProminentChar[]>().notNull().default([]), // most games played
  bestChar: text("bestChar", { mode: "json" }).$type<ProminentChar[]>().notNull().default([]), // highest WR
  normWR: real("normWR"),
  rankedWR: real("rankedWR"),
  normGames: integer("normGames"),
  rankedGames: integer("rankedGames"),
  playstyle: text("playstyle", { mode: "json" }).$type<Playstyle>(),
  knockouts: integer("knockouts"),
  smurfProbability: text("smurfProbability").$type<SmurfConfidence>().notNull().default('none'),
});

// Basic list of previous matches for local match history
export const matchHistory = sqliteTable("matchHistory", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  mapId: text("mapId").notNull(),
  duration: integer("duration").notNull(),
  queue: text("queue").notNull(),
  bans: text("bans", { mode: "json" }).$type<string[]>().notNull().default([]),
  playerId: text("playerId"), // null will just show regardless of filter

  players: text("players", { mode: 'json' }).$type<MatchPlayer[]>().notNull().default([]),
  timeline: text("timeline", { mode: 'json' }).$type<TimelineEntry[]>().notNull().default([]),

  t1_pts: integer("t1_pts").notNull().default(0),
  t2_pts: integer("t2_pts").notNull().default(0),
  t1_sets: integer("t1_sets").notNull().default(0),
  t2_sets: integer("t2_sets").notNull().default(0),
  myTeam: integer("myTeam").notNull(), // just easier than pathing thru players
  wonGame: integer("wonGame", { mode: "boolean" }).notNull(),

  validated: integer("validated", { mode: "boolean" }).notNull().default(false), // skips checking if already validated
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// A one-line table for keeping track of custom lobby data
export const customLobby = sqliteTable("customLobby", {
  id: integer("id").primaryKey(),
  lobbyName: text("lobbyName"),
  lobbyId: text("lobbyId"),
  private: integer("private", { mode: "boolean" }).notNull().default(false),
  serverIds: text("serverIds").$type<string[]>(),
  region: text("region"),
  appBlocked: integer("appBlocked", { mode: "boolean" }).notNull().default(false),
  maxMembers: integer("maxMembers").notNull().default(0),
  memberCount: integer("memberCount").notNull().default(0),

  lastUpdated: integer("lastUpdated", { mode: "timestamp" }),
});


// Keeps track of each playing session you have (4h one day, 2h the next, etc.)
export const gameSessions = sqliteTable("gameSessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startedAt: integer("startedAt", { mode: "timestamp" }),
  lastUpdated: integer("lastUpdated", { mode: "timestamp" }),
  active: integer("active", { mode: "boolean" }).notNull().default(true),

  endOfMatchLPs: text("endOfMatchLPs", { mode: "json" }).$type<number[]>().notNull().default([]),
  matchHistories: text("matchHistories", { mode: "json" }).$type<number[]>().notNull().default([]), // match history IDs for this session
});