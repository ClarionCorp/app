import { defineConfig } from "drizzle-kit";
import path from "node:path";
import os from "node:os";

const APP_ID = "com.blals.aimiapp";

function getAppDataDir() {
  switch (process.platform) {
    case "win32":
      return path.join(process.env.APPDATA!, APP_ID);
    default:
      return path.join(
        process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"),
        APP_ID,
      );
  }
}

export default defineConfig({
  schema: "./src/core/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // dbCredentials only used by drizzle-kit for local tooling,
  // not at runtime in Tauri
  dbCredentials: {
    url: path.join(getAppDataDir(), "cosmicexpanse.db"),
  },
});