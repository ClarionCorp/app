import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";

const conn = await Database.load("sqlite:lapis.db");

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