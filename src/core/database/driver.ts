import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "../database/schema";
import { relaunch } from "@tauri-apps/plugin-process";
import { is, Table } from "drizzle-orm";
import { migrate, createDrizzleProxy, Database } from "tauri-plugin-libsql-api";
import { appDataDir } from "@tauri-apps/api/path";
import { mkdir } from "@tauri-apps/plugin-fs";

const dataDir = await appDataDir();
await mkdir(dataDir, { recursive: true });

await Database.load("sqlite:cosmicexpanse.db");

// Vite inlines the SQL at build time
const migrations = import.meta.glob<string>("../../../drizzle/*.sql", {
  eager: true,
  query: "?raw",
  import: "default",
});

await migrate("sqlite:cosmicexpanse.db", migrations);

export const db = drizzle(createDrizzleProxy("sqlite:cosmicexpanse.db"), { schema });

export async function resetDatabase() {
  const tables = Object.values(schema).filter((t) => is(t, Table));

  for (const table of tables) {
    await db.delete(table as Table);
  }

  await relaunch();
}