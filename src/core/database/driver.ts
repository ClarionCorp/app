import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "../database/schema";

const conn = await Database.load("sqlite:lapis.db");

export const db = drizzle(async (sql, params, method) => {
  try {
    if (method === "run") {
      await conn.execute(sql, params);
      return { rows: [] };
    }

    const rows = await conn.select<Record<string, unknown>[]>(sql, params);
    if (rows.length === 0) return { rows: [] };
    const keys = Object.keys(rows[0]);
    return { rows: rows.map((row) => keys.map((k) => row[k])) };
  } catch (err) {
    console.error("Drizzle SQL error:", err);
    throw err;
  }
}, { schema });