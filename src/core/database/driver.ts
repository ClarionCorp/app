import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "../database/schema";
import { relaunch } from "@tauri-apps/plugin-process";
import { is, Table } from "drizzle-orm";

const conn = await Database.load("sqlite:hyperpop.db");

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

export async function resetDatabase() {
  const tables = Object.values(schema).filter((t) => is(t, Table));

  for (const table of tables) {
    await db.delete(table as Table);
  }

  await relaunch();
}