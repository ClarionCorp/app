import { AuthTable, UserTable } from "../../types/database";
import { SelfQuery } from "../../types/odyssey";
import { db } from "./driver";
import { appSettings, auth, currentMatch, user, matchPlayers, matchHistory } from "./schema";
import { eq } from "drizzle-orm";

// Just using a basic translation file since I am still new to Drizzle

//
// Fetchers
//

export async function getAppSettings() {
  const rows = await db.select().from(appSettings).limit(1);
  return rows[0] ?? null;
}

export async function upsertAppSettings(data: Partial<Pick<typeof appSettings.$inferInsert, 'gameDirectory'>>) {
  return db.insert(appSettings).values({ id: 1, createdAt: new Date(), ...data }).onConflictDoUpdate({
    target: appSettings.id,
    set: data,
  }).run();
}

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

export async function upsertCurrentMatch(data: Omit<typeof currentMatch.$inferInsert, "id">) {
  return db.insert(currentMatch).values({ id: 1, ...data }).onConflictDoUpdate({
    target: currentMatch.id,
    set: data,
  }).run();
}

export async function getMatchPlayers() {
  return db.select().from(matchPlayers);
}

export async function setMatchPlayers(players: typeof matchPlayers.$inferInsert[]) {
  await db.delete(matchPlayers).run();
  if (players.length > 0) {
    await db.insert(matchPlayers).values(players).run();
  }
}

export async function getMyMatchPlayer() {
  return db.select().from(matchPlayers).where(eq(matchPlayers.isMe, true)).limit(1).then(r => r[0] ?? null);
}

export async function insertMatchHistory(data: Omit<typeof matchHistory.$inferInsert, "id">) {
  return db.insert(matchHistory).values(data).run();
}