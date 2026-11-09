// This refers to the Ai.Mi App API at https://api.aimis.app.

import { eq } from "drizzle-orm";
import { GETOnlinePlayersV3, OnlineHistoryV3, OnlineObjectV3, VersionCheck } from "../../types/appAPI";
import { AiMiAPI, version } from "../constants";
import { db } from "../database/driver";
import { getAppSettings, getAuthTokens, getUser } from "../database/queries";
import { auth } from "../database/schema";
import { readIdentity } from "../init";
import { getRegionObjectFromOdyRegion, OdyRegion } from "../objects/regions";

export async function checkForUpdates(): Promise<VersionCheck> {
  const appSettings = await getAppSettings();
  try {
    const res = await fetch(`${AiMiAPI}/v1/update/check?currentVer=${version}&channel=${appSettings.releaseChannel.toLowerCase()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json() as VersionCheck;
    if (!data.release) { throw new Error(`Couldn't find any releases for branch ${appSettings.releaseChannel.toUpperCase()}!`) };
    if (data.release?.author.id !== 89052946) { throw new Error("Release author ID doesn't match blals!") }; // I'll remove later but I'm paranoid rn lol
    if (data.updateAvailable) { console.log(`Update Available! (${version} ->${data.latest})`) }
    else { console.log(`App is up-to-date!`) };

    return data;

  } catch (e) {
    console.error(`Failed to fetch new updates!`, e);
    return { updateAvailable: false, latest: version }
  }
}

// Fetches total online for your region + updates AppAPI with our queueState & ID.
export async function fetchOnlineCount(username: string | null, region: OdyRegion | null, version: string, queueId: string | null, queueState: string, rating?: number | null): Promise<OnlineObjectV3 | null> {
  console.debug(`Fetching online player count...`);
  const auth = await getAuthTokens();
  if (!auth || !auth.pat || !auth.playerId) { console.error('Failed to fetch online player count! No valid PAT!'); return null; };

  if (!username || !region) {
    const res = await fetch(`${AiMiAPI}/v3/online`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app', 'x-pat': auth.pat, 'x-playerid': auth.playerId },
    });
    if (!res.ok) { console.warn(`Failed to send online status!`) };
    const data = await res.json() as GETOnlinePlayersV3;
    const localRegionData = data.regions.Global

    console.debug(`Receieved online players: ${JSON.stringify(localRegionData, null, 0)}`);
    return localRegionData;
  }
  
  else {
    const res = await fetch(`${AiMiAPI}/v3/online`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
      body: JSON.stringify({ username, region, version, queueId, queueState, ...(rating != null && { rating }) }),
    });
    if (!res.ok) { console.warn(`Failed to send online status!`, JSON.stringify({ username, region, version, rating, queueId, queueState }, null, 0)) };
    const data = await res.json() as GETOnlinePlayersV3;

    const localRegionObj = getRegionObjectFromOdyRegion(region).apiRegion;
    const localRegionData = data.regions[localRegionObj]

    console.debug(`Receieved online players: ${JSON.stringify(localRegionData, null, 0)}`);
    return localRegionData;
  }
}

export async function fetchOnlineGraphs(): Promise<OnlineHistoryV3> {
  console.debug(`Fetching online player history...`);
  const auth = await getAuthTokens();
  const res = await fetch(`${AiMiAPI}/v3/online/history`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app', 'x-pat': auth?.pat ?? 'none', 'x-playerid': auth?.playerId ?? 'none' }, // not as important, since public GET
  });
  if (!res.ok) { console.warn(`Failed to fetch online history! (${res.status})`) };
  return await res.json() as OnlineHistoryV3;
}

export async function requestPAT(): Promise<boolean> {
  try {
    const { jwt, rft } = await readIdentity();
    const user = await getUser();

    const req = await fetch(`${AiMiAPI}/v3/pat/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
      body: JSON.stringify({
        jwt,
        rft,
        playerId: user?.playerId, // should be 100% set and valid by here but nullcheck regardless
      })
    });

    const data = await req.json();
    if (!req.ok || !data?.success) { console.error(`Failed to authenticate with upstream API! Try restarting the App!`, data.error); return false; }

    console.log(`Successfully received valid PAT!`);
    await db.update(auth).set({ pat: data.token, playerId: user?.playerId }).where(eq(auth.id, 1)).run();
    return true;
  } catch (e) {
    console.error(`Something went fatally wrong while requesting a PAT!`, e);
    return false;
  }
}