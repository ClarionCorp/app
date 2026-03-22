import { eq } from "drizzle-orm";
import { getModDownloadFile, getModThumbnail, type GBMod } from "./gamebanana";
import { downloadMod, toggleMod, deleteMod, validateGameDir, scanModsFolder } from "./mods";
import { db } from "../database/driver";
import { appSettings, installedMods } from "../database/schema";

async function getGameDir(): Promise<string> {
  const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, 1));
  if (!settings) throw new Error("No settings found");
  if (!settings.gameDir) throw new Error("No gameDir found");
  return settings.gameDir;
}

export async function checkGameDir(): Promise<boolean> {
  const gameDir = await getGameDir();
  return validateGameDir(gameDir);
}

export async function installMod(gbMod: GBMod): Promise<void> {
  const file = getModDownloadFile(gbMod);
  if (!file) throw new Error("No downloadable file found for this mod");

  const gameDir = await getGameDir();
  const downloadFileName = `${gbMod._idRow}.zip`;
  const extractedPaks = await downloadMod(gameDir, file._sDownloadUrl, downloadFileName);

  db.insert(installedMods).values({
    gbId: gbMod._idRow,
    name: gbMod._sName,
    version: gbMod._sVersion ?? null,
    thumbUrl: getModThumbnail(gbMod, "220"),
    enabled: true,
    fileNames: extractedPaks,
    installedAt: new Date(),
  }).run();
}

export async function enableMod(modId: number): Promise<void> {
  const mod = await db.select().from(installedMods).where(eq(installedMods.id, modId)).get();
  if (!mod) throw new Error("Mod not found");

  const gameDir = await getGameDir();
  await toggleMod(gameDir, mod.fileNames, true);
  db.update(installedMods).set({ enabled: true }).where(eq(installedMods.id, modId)).run();
}

export async function disableMod(modId: number): Promise<void> {
  const mod = await db.select().from(installedMods).where(eq(installedMods.id, modId)).get();
  if (!mod) throw new Error("Mod not found");

  const gameDir = await getGameDir();
  await toggleMod(gameDir, mod.fileNames, false);
  db.update(installedMods).set({ enabled: false }).where(eq(installedMods.id, modId)).run();
}

export async function uninstallMod(modId: number): Promise<void> {
  const mod = await db.select().from(installedMods).where(eq(installedMods.id, modId)).get();
  if (!mod) throw new Error("Mod not found");

  const gameDir = await getGameDir();
  await deleteMod(gameDir, mod.fileNames, mod.enabled);
  db.delete(installedMods).where(eq(installedMods.id, modId)).run();
}

export function getInstalledMods() {
  return db.select().from(installedMods).orderBy(installedMods.installedAt).all();
}

export function isModInstalled(gbId: number): boolean {
  const mod = db.select().from(installedMods).where(eq(installedMods.gbId, gbId)).get();
  return !!mod;
}

export async function scanAndSyncMods(): Promise<number> {
  const gameDir = await getGameDir();
  const found = await scanModsFolder(gameDir);

  // Clear existing table
  await db.delete(installedMods).run();

  // Re-insert one row per pak, grouped as individual mods since we have no GB metadata
  for (const result of found) {
    await db.insert(installedMods).values({
      gbId: null,
      name: result.file_name.replace(".pak", ""),
      version: null,
      thumbUrl: null,
      enabled: result.enabled,
      fileNames: [result.file_name],
      installedAt: new Date(),
    }).run();
  }

  return found.length;
}