import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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
  finishedSetup: integer("finishedSetup", { mode: "boolean" }).notNull().default(false),

  // Consents
  sendStats: integer("sendStats", { mode: "boolean" }).notNull().default(true),           // Match History, etc.
  sendPlayState: integer("sendPlayState", { mode: "boolean" }).notNull().default(true),   // Discord RPC, CC "queuing" pilot status
  sendPlayCount: integer("sendPlayCount", { mode: "boolean" }).notNull().default(true),   // Simply +1 to the player counter (anonymous)
  appTerms: integer("appTerms", { mode: "boolean" }).notNull().default(false),             // App ToS
  gbTerms: integer("gbTerms", { mode: "boolean" }).notNull().default(false),              // GameBanana ToS for downloading mods

  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});