// This refers to the Ai.Mi App API at https://api.aimis.app.

import { eq } from "drizzle-orm";
import { POSTMatchHistoryPlayerV1, POSTMatchHistoryV1, VersionCheck } from "../../types/appAPI";
import { MatchHistoryTable } from "../../types/database";
import { AiMiAPI, version } from "../constants";
import { db } from "../database/driver";
import { getUsers } from "../database/queries";
import { matchHistory } from "../database/schema";

// Here we parse the data we have locally before shipping it off to the AppAPI
export async function saveMatchHistoryEntry(match: MatchHistoryTable) {
  const avgRating = 0;

  let playerId: string | null = match.playerId ?? null;
  let ownerName: string | null = null;
  if (playerId) {
    const users = await getUsers();
    const matchedUser = users.find(u => u.playerId === playerId);
    if (matchedUser) {
      const allNames = [matchedUser.username, ...matchedUser.nameHistory];
      const matchedPlayer = match.players.find(p => allNames.includes(p.name));
      if (matchedPlayer) ownerName = matchedPlayer.name;
    }
  }
  if (!playerId) { console.warn('PlayerID could not be resolved. Skipping entry...'); return; };

  const players: POSTMatchHistoryPlayerV1[] = await Promise.all(
    match.players.map(async (p) => ({
      playerId: p.playerId ?? (p.name === ownerName ? playerId : null),
      username: p.name,
      teamNum: p.team,
      characterId: p.characterId,
      role: p.role,
      trainings: p.trainings,
      level: p.level,
      assists: Number(p.assists),
      scores: Number(p.goals),
      saves: Number(p.saves),
      knockouts: Number(p.kos),
      damage: Number(p.damage),
      shots: Number(p.shots),
      redirects: Number(p.redirects),
      orbs: Number(p.orbs),
      mvp: false,
    }))
  );

  const body: POSTMatchHistoryV1 = {
    mapId: match.mapId,
    queue: match.queue,
    result: match.wonGame ? 'VICTORY' : 'DEFEAT',
    duration: match.duration,
    bans: [],
    avgRating,
    playerId,
    players,
    t1_sets: match.t1_sets,
    t2_sets: match.t2_sets,
    myTeam: match.myTeam,
    playedAt: Math.floor(match.createdAt.getTime() / 1000),
    username: ownerName,
  }

  const res = await fetch(`${AiMiAPI}/v1/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
    body: JSON.stringify(body)
  });
  if (!res.ok) { return `Failed to send! (${res.status})` };
  const data = await res.json();

  await db.update(matchHistory).set({ validated: data.validated as boolean }).where(eq(matchHistory.id, match.id)).run();
  return data;
}

type UploadProgressCallback = (stage: 'preparing' | 'individual' | 'done', percent: number | null, message: string) => void;
export async function uploadAllMatches(onProgress?: UploadProgressCallback) {
  try {
    onProgress?.('preparing', null, 'Fetching match history...');

    const entries = await db.select().from(matchHistory).all();
    const pending = entries.filter(e => !e.validated);

    if (pending.length === 0) {
      onProgress?.('done', 100, 'All matches already uploaded.');
      return;
    }

    let completed = 0;
    for (const entry of pending) {
      onProgress?.('individual', Math.round(10 + (completed / pending.length) * 80), `Uploading match ${completed + 1} of ${pending.length}...`);

      try {
        await saveMatchHistoryEntry(entry);
      } catch (e) {
        console.error(`[Sync] Failed to upload match id: ${entry.id}`, e);
      }

      completed++;
    }

    onProgress?.('done', 100, `Uploaded ${completed} of ${pending.length} matches.`);
  } catch (e) {
    console.error(`[Sync] Failed to upload matches!`, e);
    throw e;
  }
}

export async function checkForUpdates(): Promise<VersionCheck> {
  try {
    const res = await fetch(`${AiMiAPI}/v1/update/check?currentVer=${version}&channel=beta`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json() as VersionCheck;
    if (data.release?.author.id !== 89052946) { throw new Error("Release author ID doesn't match blals!") }; // I'll remove later but I'm paranoid rn lol
    if (data.updateAvailable) { console.log(`Update Available! (${version} ->${data.latest})`) }
    else { console.log(`App is up-to-date!`) };

    return data;

  } catch (e) {
    console.error(`Failed to fetch new updates!`, e);
    return { updateAvailable: false, latest: version }
  }
}