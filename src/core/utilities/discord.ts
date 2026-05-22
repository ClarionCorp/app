import { start, setActivity, clearActivity, stop, isRunning } from "tauri-plugin-drpc";
import { Activity, Assets, Timestamps, Button } from "tauri-plugin-drpc/activity";
import { GameStateJSON } from "../../types/ue4ss";
import { PHASE_GROUPS } from "./match";
import { getRankFromLP } from "../objects/ranks";
import { getCharDevName, getMapName, getQueueName } from "../objects/ody";
import { getMatchPlayers } from "../database/queries";

const APP_ID = "1483520798017982707";

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

export const DEFAULT_ACTIVITY: RpcActivityOptions = {
  details: "Idling on Main Menu",
  state: "Powered by Ai.Mi App",
  largeImage: "aimiapp_logo_v2",
  // buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
}

export async function startRpc() {
  // Add back some sort of disabling dRPC later
  // const appSettings = await getTelemetrySettings();
  // if (appSettings.play_state == false) {
  //   console.warn(`Ignoring call to start dRPC since it is disabled.`);
  //   return;
  // };
  try {
    console.log(`Starting new Discord RPC...`);
    await start(APP_ID);
  } catch (err) {
    console.error("Discord RPC failed to start:", err);
    throw err;
  }
}

export async function stopRpc() {
  try {
    console.log(`Stopping current Discord RPC...`);
    await stop();
  } catch (err) {
    console.error("Discord RPC failed to stop:", err);
    throw err;
  }
}

export async function updateActivity(options: RpcActivityOptions) {
  if (!await isRunning()) { console.warn(`[DRPC] Not running, ignoring activity update.`); return; }
  console.info(`Received request to change rich presence...`);
  console.debug(`DRPC Options: ${JSON.stringify(options, null, 1)}`);

  try {
    const {
      details,
      state,
      largeImage = "aimiapp_logo_v2",
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

export async function clearRpc() {
  await clearActivity();
}

export async function tryUpdateDiscordRPC(currentMatch: GameStateJSON) {
  const players = await getMatchPlayers();
  const myPlayer = players.find(p => p.isMe);
  
  if (currentMatch.phase == 'null' || PHASE_GROUPS.out_of_game.some(p => p === currentMatch.phase)) {
    await updateActivity({ details: 'test' });
  }
  
  // else if (PHASE_GROUPS.starting.some(p => p === currentMatch.phase)) {
  //   await updateActivity({

  //   });
  // }
  
  else if (PHASE_GROUPS.in_game.some(p => p === currentMatch.phase)) {
    console.debug(`Updating dRPC...`);
    // console.debug(`Username: ${myPlayer?.username}`);
    // console.debug(`Queue: ${getQueueName(currentMatch.queue)}`);
    // console.debug(`Map: ${getMapName(currentMatch.map_id)}`);
    console.debug(`Character: ${myPlayer?.charId} -> ${myPlayer?.charName}`);
    const rankObject = getRankFromLP(myPlayer?.rating);
    // console.debug(`Current Rank: ${JSON.stringify(rankObject, null, 1)} (${myPlayer?.rating} rating)`);
    
    let largeImg = 'aimiapp_logo_v2';
    if (myPlayer?.charId) { largeImg = getCharDevName(myPlayer?.charId).toLowerCase(); }
    await updateActivity({
      details: `${getQueueName(currentMatch.queue)} - ${getMapName(currentMatch.map_id)}`,
      state: formatScore(
        currentMatch.t1_goals ?? 0,
        currentMatch.t2_goals ?? 0,
        currentMatch.t1_sets ?? 0,
        currentMatch.t2_sets ?? 0,
        currentMatch.my_team ?? 0,
      ),
      largeImage: largeImg,
      largeText: myPlayer?.charName ? `Playing ${myPlayer?.charName}` : 'Ai.Mi Companion App',
      smallImage: rankObject.key,
      smallText: rankObject.name,
      // buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
      startTimestamp: new Date().getTime(),
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