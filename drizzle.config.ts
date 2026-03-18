import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/core/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // dbCredentials only used by drizzle-kit for local tooling,
  // not at runtime in Tauri
  dbCredentials: {
    url: process.env.APPDATA + "\\com.blals.aimiapp\\lapis.db",
  },
});