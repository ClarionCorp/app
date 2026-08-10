import { start, setActivity, clearActivity, stop } from "tauri-plugin-drpc";
import { Activity, Assets, Timestamps, Button } from "tauri-plugin-drpc/activity";
import { getRankFromLP } from "../objects/ranks";
import { removeDevCharPrefix } from "../objects/ody";
import { getAppSettings, getCurrentMatch, getMatchPlayers } from "../database/queries";
import { refreshRating } from "./odyssey";
import { getMapObjectFromID } from "../objects/maps";
import { getPartyLabel } from "../objects/sessions";
import { getGameStatus } from "../objects/gameStates";
import { getQueueObjectFromID } from "../objects/queues";

export interface RpcActivityOptions {
  details?: string;
  state?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  buttons?: { label: string; url: string }[];
}

export interface DiscordRpc {
  updateActivity: (options: RpcActivityOptions) => Promise<void>;
  clear: () => Promise<void>;
  stop: () => Promise<void>;
}

export const DRPC_LOGO_KEY = 'aimiapp_logo_v2';

export const DEFAULT_ACTIVITY: RpcActivityOptions = {
  details: "Using the Ai.Mi App",
  state: "without the game open", // lmao update this later
  largeImage: DRPC_LOGO_KEY,
  buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
}

export let discordRpc: DiscordRpc | null = null;
let remainingSetupTimestamp: number = Date.now() + 70_000; // default

export async function startRpc() {
  // Add back some sort of disabling dRPC later
  const appSettings = await getAppSettings();
  if (appSettings.drpcEnabled == false) {
    console.warn(`Ignoring call to start dRPC since it is disabled.`);
    return;
  };
  try {
    console.log(`Starting new Discord RPC...`);
    await start("1483520798017982707");
    discordRpc = {
      updateActivity: _updateActivity,
      clear: _clearActivity,
      stop: stopRpc,
    };
  } catch (err) {
    console.error("Discord RPC failed to start:", err);
    throw err;
  }
}

export async function stopRpc() {
  try {
    console.log(`Stopping current Discord RPC...`);
    await stop();
    discordRpc = null;
  } catch (err) {
    console.error("Discord RPC failed to stop:", err);
    throw err;
  }
}

async function _updateActivity(options: RpcActivityOptions) {
  console.log(`Received request to change rich presence...`);
  console.debug(`DRPC Options: ${JSON.stringify(options, null, 1)}`);

  try {
    const {
      details,
      state,
      largeImage = DRPC_LOGO_KEY,
      largeText = "Ai.Mi App",
      smallImage,
      smallText,
      startTimestamp,
      endTimestamp,
      buttons,
    } = options;

    let activity = new Activity();

    if (details) activity = activity.setDetails(details);
    if (state) activity = activity.setState(state);

    const assets = new Assets()
      .setLargeImage(largeImage)
      .setLargeText(largeText);
    if (smallImage) assets.setSmallImage(smallImage);
    if (smallText) assets.setSmallText(smallText);
    activity = activity.setAssets(assets);

    if (startTimestamp !== undefined) {
      activity = activity.setTimestamps(
        new Timestamps(startTimestamp ?? Date.now(), endTimestamp)
      );
    }

    if (buttons?.length) {
      activity = activity.setButton(
        buttons.map((b) => new Button(b.label, b.url))
      );
    }

    console.debug(activity);
    await setActivity(activity);
  } catch (e) {
    console.error(`[DRPC] Failed to update activity!`, e);
  }
}

async function _clearActivity() {
  await clearActivity();
}

export async function tryUpdateDiscordRPC(clear?: boolean) {
  const appSetts = await getAppSettings();
  if (appSetts.drpcEnabled == false) { return; }

  if (!discordRpc) {
    console.warn(`[DRPC] No DRPC found. Starting a new instance on-the-fly...`);
    await startRpc();
    return await tryUpdateDiscordRPC();
  }

  if (clear) { await discordRpc.updateActivity(DEFAULT_ACTIVITY); };

  const matchTable = await getCurrentMatch();
  const gameStatus = getGameStatus(matchTable.gameState);

  const players = await getMatchPlayers();
  const myPlayer = players.find(p => p.isMe);
  const mapObject = getMapObjectFromID(matchTable.map);
  const queueName = getQueueObjectFromID(matchTable.queue).queueName;
  const partyLabel = getPartyLabel(matchTable.partySize);
  const isQueued = matchTable.queueState == 'Queued' || matchTable.queueState == 'FoundMatch';
  
  // Not in a match, and not queuing
  if (matchTable.queue == null && !isQueued && matchTable.queueState !== 'StartingGame') {
    await discordRpc.updateActivity({
      details: 'Idling on the Main Menu',
      state: `Playing ${partyLabel}`,
      largeImage: DRPC_LOGO_KEY,
      buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
    });
  }

  // Queuing
  else if (isQueued) {
    await discordRpc.updateActivity({
      details: `Waiting in ${queueName} Queue`,
      state: `Playing ${partyLabel}`,
      largeImage: DRPC_LOGO_KEY,
      buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
    });
  }

  // Match is found, but it's not in the setup phase yet.
  // else if (matchTable.queueState == 'StartingGame' && gameStatus !== 'SETUP') {
  //   await discordRpc.updateActivity({
  //     details: `Match Found!`,
  //     state: `Waiting on Server...`,
  //     largeImage: DRPC_LOGO_KEY,
  //     buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
  //   });
  // }

  // Match found and it's in setup phase.
  else if (gameStatus == 'SETUP') {
    if (matchTable.gameState == 'ArenaOverview') { remainingSetupTimestamp = Date.now() + 70_000 };
    if (matchTable.gameState == 'CharacterPreSelect') { remainingSetupTimestamp = Date.now() + 65_000 };
    if (matchTable.gameState == 'CharacterSelect') { remainingSetupTimestamp = Date.now() + 60_000 };
    if (matchTable.gameState == 'LoadoutSelect') { remainingSetupTimestamp = Date.now() + 20_000 };
    if (matchTable.gameState == 'VersusScreen') { remainingSetupTimestamp = Date.now() + 15_000 };

    await refreshRating();
    await discordRpc.updateActivity({
      details: `${queueName} - ${mapObject.mapName}`,
      state: `Voting on Match Settings...`,
      startTimestamp: Date.now(),
      endTimestamp: remainingSetupTimestamp,
      buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
    });
  }

  // maybe we could add one for intermission like "Picking 1st" /shrug

  // In a Match
  else if (gameStatus == 'IN_GAME') {
    const rankObject = getRankFromLP(myPlayer?.rating);

    let largeImg = DRPC_LOGO_KEY;
    if (myPlayer?.charId) { largeImg = removeDevCharPrefix(myPlayer?.charId as string).toLowerCase(); }

    await discordRpc.updateActivity({// cant be null here
      details: `${queueName} - ${mapObject.mapName}`,
      state: formatScore(
        matchTable.teamOnePts ?? 0,
        matchTable.teamTwoPts ?? 0,
        matchTable.teamOneSets ?? 0,
        matchTable.teamTwoSets ?? 0,
        matchTable.teamNum ?? 0,
      ),
      largeImage: largeImg,
      largeText: myPlayer?.charName ? `Playing ${myPlayer?.charName}` : 'Ai.Mi Companion App',
      smallImage: rankObject.key,
      smallText: rankObject.name,
      startTimestamp: matchTable.startedAt?.getTime(),
      buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
    });
  }
}

function formatScore(
  teamOnePoints: number,
  teamTwoPoints: number,
  teamOneSets: number,
  teamTwoSets: number,
  myTeam: number,
): string {
  const myPoints = myTeam === 2 ? teamTwoPoints : teamOnePoints;
  const theirPoints = myTeam === 2 ? teamOnePoints : teamTwoPoints;
  const mySets = myTeam === 2 ? teamTwoSets : teamOneSets;
  const theirSets = myTeam === 2 ? teamOneSets : teamTwoSets;

  const myBar = `${'⬛'.repeat(3 - mySets)}${'🟦'.repeat(mySets)}`;
  const theirBar = `${'🟥'.repeat(theirSets)}${'⬛'.repeat(3 - theirSets)}`;

  return `${myBar} (${myPoints} | ${theirPoints}) ${theirBar}`;
}
