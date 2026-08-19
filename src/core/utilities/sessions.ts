// Keeps track of each playing session you have (4h one day, 2h the next, etc.)

import { eq } from "drizzle-orm";
import { db } from "../database/driver";
import { getCurrentSession } from "../database/queries";
import { gameSessions } from "../database/schema";
import { MatchHistoryTable } from "../../types/database";
import { fetchPlayerStats } from "./players";

export async function checkStartNewSession() {
  const active = await getCurrentSession();
  let start_new_session = false;

  if (!active || !active.lastUpdated) { start_new_session = true }
  else if (Date.now() - active.lastUpdated.getTime() > (3 * 3600000)) { start_new_session = true } // 3 hours
  // else { start_new_session = false };

  if (start_new_session == true) {
    await db.insert(gameSessions).values({
      startedAt: new Date(),
      lastUpdated: new Date(),
      active: true,
      endOfMatchLPs: [],
      matchHistories: [],
    });
    console.log('Starting a new session...');
    return;
  } else {
    await db.update(gameSessions).set({ lastUpdated: new Date() }).where(eq(gameSessions.id, active.id));
    console.log('Picking up with the last session...');
  }
}

export async function updateSession(username: string, matchHistoryEntry?: MatchHistoryTable) {
  const newStats = await fetchPlayerStats(username);
  const session = await getCurrentSession();

  await db.update(gameSessions).set({
    lastUpdated: new Date(),
    endOfMatchLPs: [...session.endOfMatchLPs, newStats.rating],
    matchHistories: matchHistoryEntry ? [...session.matchHistories, matchHistoryEntry.id] : session.matchHistories,
  }).where(eq(gameSessions.id, session.id));

  console.log(`Updated session! (#${session.id})`)
}

export async function sessionHeartbeat() {
  const session = await getCurrentSession();
  await db.update(gameSessions).set({ lastUpdated: new Date() }).where(eq(gameSessions.id, session.id));
  console.debug(`Kept session #${session.id} alive.`);
}