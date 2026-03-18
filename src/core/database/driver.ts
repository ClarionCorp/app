import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";

const conn = await Database.load("sqlite:lapis.db");

await conn.execute(`CREATE TABLE IF NOT EXISTS \`user\` (
  \`id\` integer PRIMARY KEY NOT NULL,
  \`username\` text NOT NULL,
  \`player_id\` text NOT NULL,
  \`emoticon_id\` text NOT NULL,
  \`nameplate_id\` text NOT NULL,
  \`title_id\` text NOT NULL,
  \`tags\` text DEFAULT '[]' NOT NULL,
  \`mastery_level\` integer NOT NULL,
  \`player_status\` text NOT NULL,
  \`display_name_status\` text NOT NULL,
  \`last_display_name_change_timestamp\` integer,
  \`matchmaking_region\` text NOT NULL,
  \`gamelift_region_urls\` text DEFAULT '[]' NOT NULL,
  \`discord_id\` text,
  \`rating\` integer
)`);

await conn.execute(`CREATE TABLE IF NOT EXISTS \`auth\` (
  \`id\` integer PRIMARY KEY NOT NULL,
  \`odyJwt\` text NOT NULL,
  \`odyRft\` text NOT NULL,
  \`ccJwt\` text,
  \`created_at\` integer NOT NULL
)`);

await conn.execute(`CREATE TABLE IF NOT EXISTS \`currentMatch\` (
  \`id\` integer PRIMARY KEY NOT NULL,
  \`rawPhase\` text NOT NULL,
  \`level\` text,
  \`myCharacter\` text,
  \`myTeam\` text,
  \`teamOnePts\` integer,
  \`teamTwoPts\` integer,
  \`teamOneSets\` integer,
  \`teamTwoSets\` integer,
  \`playerNames\` text DEFAULT '[]' NOT NULL,
  \`startedAt\` integer NOT NULL
)`);

export const db = drizzle(async (sql, params, method) => {
  try {
    if (method === "run") {
      await conn.execute(sql, params);
      return { rows: [] };
    }

    const rows = await conn.select<Record<string, unknown>[]>(sql, params);
    return { rows: rows.map((row) => Object.values(row)) };
  } catch (err) {
    console.error("Drizzle SQL error:", err);
    throw err;
  }
});