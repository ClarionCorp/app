// This refers to the Ai.Mi App API at https://api.aimis.app.

import { OnlineHistoryV1, OnlinePlayersV1, VersionCheck } from "../../types/appAPI";
import { AiMiAPI, version } from "../constants";

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

export async function fetchOnlineCount(username: string, gameState: string, region: string | null): Promise<number> {
  console.debug(`Fetching online player count...`);
  const res = await fetch(`${AiMiAPI}/v1/online`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
    body: JSON.stringify({ username, gameState, region }),
  });
  if (!res.ok) { console.warn(`Failed to send online status!`, JSON.stringify({ username, gameState }, null, 0)) };
  const data = await res.json() as OnlinePlayersV1;
  console.debug(`Receieved online players: ${JSON.stringify(data, null, 1)}`);
  return data.total;
}

export async function fetchOnlineGraphs(): Promise<OnlineHistoryV1> {
  console.debug(`Fetching detailed online player count...`);
  const res = await fetch(`${AiMiAPI}/v1/online/detailed`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
  });
  if (!res.ok) { console.warn(`Failed to fetch detailed online history! (${res.status})`) };
  return await res.json() as OnlineHistoryV1;
}