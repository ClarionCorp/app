import { AuthTable, PlayerCharJSON, UserTable } from "../../types/database";
import { SelfQuery, StatsQuery } from "../../types/odyssey";
import { db } from "./driver";
import { appSettings, auth, currentMatch, user, matchPlayers, matchHistory, sessionInfo } from "./schema";
import { eq, sql } from "drizzle-orm";

// Just using a basic translation file since I am still new to Drizzle

//
// Fetchers
//

export async function getAppSettings() {
  const rows = await db.select().from(appSettings).limit(1);
  return rows[0] ?? null;
}

export async function upsertAppSettings(data: Partial<Pick<typeof appSettings.$inferInsert, 'gameDirectory' | 'drpcEnabled' | 'notifyQueuePop' | 'queuePopVol' | 'queuePopType'>>) {
  return db.insert(appSettings).values({ id: 1, createdAt: new Date(), ...data }).onConflictDoUpdate({
    target: appSettings.id,
    set: data,
  }).run();
}

export async function getUsers() {
  return db.select().from(user);
}

export async function getUser(): Promise<UserTable | null> {
  const rows = await db.select().from(user).where(eq(user.active, true)).limit(1);
  return rows[0] ?? null;
}

export async function getAuthTokens(): Promise<AuthTable | null> {
  const rows = await db.select().from(auth).limit(1);
  return rows[0] ?? null;
}

export async function getCurrentMatch() {
  return db.select().from(currentMatch).limit(1).then(r => r[0] ?? null);
}

export async function getMatchPlayers() {
  return db.select().from(matchPlayers);
}

export async function getMyMatchPlayer() {
  return db.select().from(matchPlayers).where(eq(matchPlayers.isMe, true)).limit(1).then(r => r[0] ?? null);
}

export async function getMatchHistory() {
  return db.select().from(matchHistory);
}

export async function getGameSession() {
  const rows = await db.select().from(sessionInfo).limit(1);
  return rows[0] ?? null;
}


//
// Setters
//

export async function upsertUser(data: SelfQuery) {
  const lastDisplayNameChangeTimestamp = data.lastDisplayNameChangeTimestamp
    ? new Date(data.lastDisplayNameChangeTimestamp)
    : null;

  return db.transaction(async (tx) => {
    await tx.update(user).set({ active: false }).run();

    const existing = await tx
      .select({ id: user.id, username: user.username, nameHistory: user.nameHistory })
      .from(user)
      .where(eq(user.playerId, data.playerId))
      .limit(1);

    if (existing.length > 0) {
      const entry = existing[0];
      const nameHistory = entry.username !== data.username
        ? [...entry.nameHistory, entry.username]
        : entry.nameHistory;
      return tx.update(user).set({
        ...data,
        discordId: data.discordConnection?.discordId ?? null,
        lastDisplayNameChangeTimestamp,
        nameHistory,
        active: true,
      }).where(eq(user.id, entry.id)).run();
    }

    return tx.insert(user).values({
      ...data,
      tags: data.tags,
      gameLiftRegionUrls: data.gameLiftRegionUrls,
      discordId: data.discordConnection?.discordId ?? null,
      lastDisplayNameChangeTimestamp,
      rating: null,
      active: true,
    }).run();
  });
}

export async function updateRating(rating: number) {
  return db.update(user).set({ rating }).run();
}

export async function updateRegion(region: string) {
  return db.update(user).set({ region }).run();
}

export async function upsertAuth(data: Omit<typeof auth.$inferInsert, "id">) {
  return db.insert(auth).values({ id: 1, ...data }).onConflictDoUpdate({
    target: auth.id,
    set: data,
  }).run();
}

export async function upsertCurrentMatch(data: Omit<typeof currentMatch.$inferInsert, "id">) {
  const rows = await db.insert(currentMatch).values({ id: 1, ...data }).onConflictDoUpdate({
    target: currentMatch.id,
    set: data,
  }).returning();
  return rows[0];
}

export async function updateSessionInfo(data: Omit<typeof sessionInfo.$inferInsert, "id">) {
  const rows = await db.insert(sessionInfo).values({ id: 1, ...data }).onConflictDoUpdate({
    target: sessionInfo.id,
    set: data,
  }).returning();
  return rows[0];
}

export async function setMatchPlayers(players: typeof matchPlayers.$inferInsert[]) {
  if (players.length === 0) return [];
  return db.insert(matchPlayers).values(players).onConflictDoUpdate({
    target: matchPlayers.username,
    set: {
      charName: sql`excluded.charName`,
      charId: sql`excluded.charId`,
      xp: sql`excluded.xp`,
      ping: sql`excluded.ping`,
      trainings: sql`excluded.trainings`,
    },
  }).returning();
}

export async function updatePlayerRating(username: string, rating: number) {
  return db.update(matchPlayers)
    .set({ rating })
    .where(eq(matchPlayers.username, username))
    .returning();
}

export async function insertMatchHistory(data: Omit<typeof matchHistory.$inferInsert, "id">) {
  return db.insert(matchHistory).values(data).run();
}

// Moved here in case we need to add more
export async function resetLocalTables() {
  console.log('Clearing local tables for next match...');
  await db.delete(matchPlayers).run();
  await db.update(currentMatch).set({ trainings: [] });
}

// Only runs once upon loading players, so it should be fine to run this heavy function lol
export async function calcAndSetPlayerStats(username: string, stats: StatsQuery | null, playerId: string | undefined) {
  if (!stats) {
    return db.update(matchPlayers)
      .set({ favChar: [], bestChar: [], normWR: 0, rankedWR: 0, normGames: 0, rankedGames: 0 })
      .where(eq(matchPlayers.username, username))
      .returning();
  }

  const slots = [
    { role: 'Forward', queue: 'Normal' },
    { role: 'Forward', queue: 'Ranked' },
    { role: 'Goalie', queue: 'Normal' },
    { role: 'Goalie', queue: 'Ranked' },
  ] as const;

  const favChar: PlayerCharJSON[] = [];
  const bestChar: PlayerCharJSON[] = [];

  for (const { role, queue } of slots) {
    const candidates = stats.characterStats
      .filter(c => c.ratingName !== 'None' && (c.ratingName === 'RankedInitial' ? 'Ranked' : 'Normal') === queue)
      .map(c => ({
        characterId: c.characterId,
        queue,
        role,
        games: c.roleStats[role].games,
        winrate: c.roleStats[role].games > 0
          ? c.roleStats[role].wins / c.roleStats[role].games
          : 0,
      }))
      .filter(c => c.games > 0);

    const byGames = candidates.reduce((best, c) => c.games > best.games ? c : best, candidates[0]);
    const byWinrate = candidates.reduce((best, c) => c.winrate > best.winrate ? c : best, candidates[0]);

    if (byGames) favChar.push(byGames);
    if (byWinrate) bestChar.push(byWinrate);
  }

  const ranked = stats.playerStats.find(ps => ps.ratingName === 'RankedInitial');
  const norm = stats.playerStats.find(ps => ps.ratingName === 'NormalInitial');

  const rankedGames = ranked ? ranked.roleStats.Forward.games + ranked.roleStats.Goalie.games : 0;
  const rankedWins = ranked ? ranked.roleStats.Forward.wins + ranked.roleStats.Goalie.wins : 0;
  const normGames = norm ? norm.roleStats.Forward.games + norm.roleStats.Goalie.games : 0;
  const normWins = norm ? norm.roleStats.Forward.wins + norm.roleStats.Goalie.wins : 0;

  return db.update(matchPlayers)
    .set({
      playerId,
      favChar,
      bestChar,
      normWR: normGames > 0 ? normWins / normGames : 0,
      rankedWR: rankedGames > 0 ? rankedWins / rankedGames : 0,
      normGames,
      rankedGames,
    })
    .where(eq(matchPlayers.username, username))
    .returning();
}

export async function resetSessionTable() {
  await db.delete(sessionInfo);
  await db.insert(sessionInfo).values({ id: 1 });
}

export async function updateGameState(state: string) {
  await db.update(currentMatch).set({ gameState: state});
}

// 
// Helpers
// 

export function getPlayerChar(
  chars: PlayerCharJSON[],
  role: PlayerCharJSON['role'] | null | undefined,
  queue: PlayerCharJSON['queue'] | null | undefined,
): PlayerCharJSON | undefined {
  if (!role || !queue) return undefined;
  return chars.find(c => c.queue === queue && c.role === role);
}

export async function usernameToPlayerId(username: string): Promise<string | null> {
  const byUsername = await db
    .select({ playerId: user.playerId })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (byUsername.length > 0) return byUsername[0].playerId;

  const byHistory = await db
    .select({ playerId: user.playerId })
    .from(user)
    .where(sql`EXISTS (SELECT 1 FROM json_each(${user.nameHistory}) WHERE value = ${username})`)
    .limit(1);

  return byHistory[0]?.playerId ?? null;
}