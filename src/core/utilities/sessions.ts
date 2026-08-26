// Keeps track of each playing session you have (4h one day, 2h the next, etc.)

import { eq } from "drizzle-orm";
import { db } from "../database/driver";
import { getCurrentSession, getLatestMatchHistory } from "../database/queries";
import { gameSessions } from "../database/schema";
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

export async function updateSession(username: string) {
  try {
    const newStats = await fetchPlayerStats(username);
    const session = await getCurrentSession();

    // for whatever fuckin reason drizzle is returning this id as an array like [5]... so I have to do this bs to get it working
    const latestEntry = await getLatestMatchHistory();


    await db.update(gameSessions).set({
      lastUpdated: new Date(),
      endOfMatchLPs: [...session.endOfMatchLPs, newStats.rating],
      matchHistories: latestEntry ? [...session.matchHistories, latestEntry.id] : session.matchHistories,
    }).where(eq(gameSessions.id, session.id));

    console.log(`Updated session! (#${session.id})`)
  } catch (e) {
    console.error(`Failed to update session with populus data!`, e);
    return;
  }
}

export async function sessionHeartbeat() {
  const session = await getCurrentSession();
  await db.update(gameSessions).set({ lastUpdated: new Date() }).where(eq(gameSessions.id, session.id));
  console.debug(`Kept session #${session.id} alive.`);
}