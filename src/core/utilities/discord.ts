import { start, setActivity, clearActivity, stop } from "tauri-plugin-drpc";
import { Activity, Assets, Timestamps, Button } from "tauri-plugin-drpc/activity";
import { getRankFromLP } from "../objects/ranks";
import { removeDevCharPrefix } from "../objects/ody";
import { getAppSettings, getCurrentMatch, getGameSession, getMatchPlayers } from "../database/queries";
import { refreshRating } from "./odyssey";
import { getMapObjectFromID } from "../objects/maps";
import { CurrentMatchTable, SessionTable } from "../../types/database";
import { getPartyLabel } from "../objects/sessions";

const APP_ID = "1483520798017982707";

export const PHASE_GROUPS = {
  out_of_game: [
    'Unknown',
    'None',
    'PostGameCelebration',
    'PostGameSummary'
  ],
  starting: [
    'PreGame',
    'ArenaOverview',
    'CharacterPreSelect',
    'BanSelect',
    'BanCelebration',
    'LoadoutSelect',
    'CharacterSelect',
    'VersusScreen',
  ],
  in_game: [
    'InGame',
    'FaceOffIntro',
    'FaceOffCountdown',
    'GoalScore',
    'GoalCelebration',
    'IntermissionMvp',
    'IntermissionIntro',
    'IntermissionOutro',
    'Intermission'
  ],
} as const;

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
  // buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
}

export let discordRpc: DiscordRpc | null = null;
let matchSetupTimestamps: { startTimestamp: number; endTimestamp: number } | null = null;

export async function startRpc() {
  // Add back some sort of disabling dRPC later
  const appSettings = await getAppSettings();
  if (appSettings.drpcEnabled == false) {
    console.warn(`Ignoring call to start dRPC since it is disabled.`);
    return;
  };
  try {
    console.log(`Starting new Discord RPC...`);
    await start(APP_ID);
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

export async function tryUpdateDiscordRPC(match?: CurrentMatchTable, sessionInfo?: SessionTable) { // less db reads
  const appSetts = await getAppSettings();
  if (appSetts.drpcEnabled == false) { return; }

  const currentMatch = match ?? (await getCurrentMatch());
  if (!discordRpc) {
    console.warn(`[DRPC] No DRPC found. Starting a new instance on-the-fly...`);
    await startRpc();
    return await tryUpdateDiscordRPC(currentMatch);
  }

  const session = sessionInfo ?? (await getGameSession());

  const players = await getMatchPlayers();
  const myPlayer = players.find(p => p.isMe);
  const mapObject = getMapObjectFromID(currentMatch.map);
  const partyLabel = getPartyLabel(session.partySize);

  // Not in a match, and not queuing
  if (
    session.queueState == 'Idle'
  ) {
    matchSetupTimestamps = null;
    await discordRpc.updateActivity({
      details: 'Idling on the Main Menu',
      state: `Playing ${partyLabel}`,
      largeImage: DRPC_LOGO_KEY
    });
  }

  // Queuing
  else if (session.queueState == 'Queued' || session.queueState == 'FoundMatch' || session.queueState == 'StartingGame') {
    await discordRpc.updateActivity({
      details: `Waiting in ${session.queueName} Queue`,
      state: `Playing ${partyLabel}`,
      largeImage: DRPC_LOGO_KEY
    });
  }

  // Match found and it's in setup phase
  else if (PHASE_GROUPS.starting.some(p => p === currentMatch.gameState)) {
    if (currentMatch.gameState === 'ArenaOverview') { // Only set on Pre-Game (after resetting match table), to use on other setup phases
      console.debug('New Match! Saving setup timestamp finish...');
      const now = Date.now();
      matchSetupTimestamps = { startTimestamp: now, endTimestamp: now + 95 * 1000 }; // technically done in 90s, but +5s for padding
    }
    await refreshRating();
    await discordRpc.updateActivity({
      details: `${currentMatch.queue} - ${mapObject.mapName}`,
      state: `Voting on Match Settings...`,
      ...matchSetupTimestamps,
    });
  }

  // In a Match
  else if (PHASE_GROUPS.in_game.some(p => p === currentMatch.gameState)) {
    console.debug(`Updating dRPC...`);
    const rankObject = getRankFromLP(myPlayer?.rating);

    let largeImg = DRPC_LOGO_KEY;
    if (myPlayer?.charId) { largeImg = removeDevCharPrefix(myPlayer?.charId as string).toLowerCase(); }
    await discordRpc.updateActivity({// cant be null here
      details: `${currentMatch.queue} - ${mapObject.mapName}`,
      state: formatScore(
        currentMatch.teamOnePts ?? 0,
        currentMatch.teamTwoPts ?? 0,
        currentMatch.teamOneSets ?? 0,
        currentMatch.teamTwoSets ?? 0,
        currentMatch.teamNum ?? 0,
      ),
      largeImage: largeImg,
      largeText: myPlayer?.charName ? `Playing ${myPlayer?.charName}` : 'Ai.Mi Companion App',
      smallImage: rankObject.key,
      smallText: rankObject.name,
      // buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
      startTimestamp: currentMatch.startedAt?.getTime(),
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
