import { AuthTable, UserTable } from "../../types/database";
import { SelfQuery } from "../../types/odyssey";
import { db } from "./driver";
import { appSettings, auth, currentMatch, user } from "./schema";

// Just using a basic translation file since I am still new to Drizzle

//
// Fetchers
//

export async function getUser(): Promise<UserTable | null> {
  const rows = await db.select().from(user).limit(1);
  return rows[0] ?? null;
}

export async function getAuthTokens(): Promise<AuthTable | null> {
  const rows = await db.select().from(auth).limit(1);
  return rows[0] ?? null;
}

export async function getCurrentMatch() {
  return db.select().from(currentMatch).limit(1).then(r => r[0] ?? null);
}




//
// Setters
//

export async function upsertUser(data: SelfQuery) {
  const lastDisplayNameChangeTimestamp = data.lastDisplayNameChangeTimestamp
    ? new Date(data.lastDisplayNameChangeTimestamp)
    : null;

  return db.insert(user).values({
    id: 1,
    ...data,
    tags: data.tags,
    gameLiftRegionUrls: data.gameLiftRegionUrls,
    discordId: data.discordConnection?.discordId ?? null,
    lastDisplayNameChangeTimestamp,
    rating: null,
  }).onConflictDoUpdate({
    target: user.id,
    set: {
      ...data,
      discordId: data.discordConnection?.discordId ?? null,
      lastDisplayNameChangeTimestamp,
    },
  }).run();
}

export async function updateRating(rating: number) {
  return db.update(user).set({ rating }).run();
}

export async function upsertAuth(data: Omit<typeof auth.$inferInsert, "id">) {
  return db.insert(auth).values({ id: 1, ...data }).onConflictDoUpdate({
    target: auth.id,
    set: data,
  }).run();
}

export async function upsertSettings(data: Omit<typeof appSettings.$inferInsert, "id" | "createdAt">) {
  return db.insert(appSettings).values({ id: 1, ...data, createdAt: new Date() }).onConflictDoUpdate({
    target: appSettings.id,
    set: data,
  }).run();
}

export async function updateCurrentMatch(data: Partial<typeof currentMatch.$inferInsert>) {
  await db.update(currentMatch).set(data).run();
  window.dispatchEvent(new Event("currentMatch:changed"));
}