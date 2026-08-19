// I just don't want to clutter App.tsx with a billion imports and functions for events.
// This file doesn't actually listen to events, it just acts on them. Like an actor... oh well.
// Anyways, App.tsx is still the orchestrator, this just has functions to help it.

import { eq, sql } from "drizzle-orm";
import { db } from "../database/driver";
import { currentMatch, customLobby, matchPlayers } from "../database/schema";
import { MatchJSON, MetaJSON, PlayersJSON, PostGameJSON } from "../../types/ue4ss";
import { appendTimelineEntry, deleteCustomLobby, getCurrentMatch, getCustomLobby, getMatchPlayers, getUser, insertMatchHistory, updatePlayerRating } from "../database/queries";
import { fetchPlayerPlayerstyle, fetchPlayerSmurfEstimate } from "./clarion";
import { MatchPlayer } from "../../types/ue4ss";
import { getLevelFromXP } from "../objects/levels";
import { CurrentMatchTable, CustomLobbyTable, MatchPlayersTable } from "../../types/database";
import { getRegionObjectFromID } from "../objects/regions";
import { checkSaveTimelineEntries } from "../timeline";
import { getQueueObjectFromID } from "../objects/queues";
import { fetchPlayerStats } from "./players";

const diffSeconds = (a: Date, b: Date) => Math.abs(b.getTime() - a.getTime()) / 1000;
const flags =  ['blockapp', 'eusl', 'bub', 'osas', 'euos'];

export async function updatePlayers(data: PlayersJSON) {
  const currentUser = await getUser();

  // Map data from Mod to fit our local database
  const incoming = data.players.filter(p => p.name !== 'Player').map(p => ({
    username: p.name,
    playerId: p.player_id,
    teamNum: p.team as 1 | 2,
    role: p.role,
    charName: p.character_name,
    charId: p.character_id,
    isMe: p.name === currentUser?.username,
    xp: p.xp,
    gainedXp: p.intermission_xp,
    ping: p.ping_ms,
    trainings: p.trainings,
    knockouts: p.knockouts,
  }));
  if (incoming.length === 0) return;

  // Upsert mapped data into our matchPlayers table
  const players = await db.insert(matchPlayers).values(incoming).onConflictDoUpdate({
    target: matchPlayers.username,
    set: {
      charName: sql`excluded.charName`,
      charId: sql`excluded.charId`,
      xp: sql`excluded.xp`,
      gainedXp: sql`excluded.gainedXp`,
      ping: sql`excluded.ping`,
      trainings: sql`excluded.trainings`,
      knockouts: sql`excluded.knockouts`,
    },
  }).returning();

  // For any players who have no rating, run a bunch of one-time stuff.
  // Here, we grab their rating, playstyle, smurf rating, and basic stats.
  for (const player of players.filter(p => p.rating === null)) {
    // fetch and set ratings and other stats (if empty)
    console.log(`Fetching statistical data for ${player.username}...`)
    try {
      const playerStats = await fetchPlayerStats(player.username, player.playerId);
      const playstyle = await fetchPlayerPlayerstyle(player.username);
      const smurf = await fetchPlayerSmurfEstimate(player.username);
      await db.update(matchPlayers).set({
        rating: playerStats.rating, // will be 0 if not found
        favChar: playerStats.favChar ?? undefined,
        bestChar: playerStats.bestChar ?? undefined,
        normGames: playerStats.normGames,
        normWR: playerStats.normWR,
        rankedGames: playerStats.rankedGames,
        rankedWR: playerStats.rankedWR,
        playstyle,
        smurfProbability: smurf?.confidence
      }).where(eq(matchPlayers.username, player.username));
    } catch (e) {
      console.warn(`No rank data could be found for ${player.username}.`);
      updatePlayerRating(player.username, 0); // set to 0 to prevent refetching (and failing again)
      continue;
    }
  }
}

export async function updateGameState(data: MetaJSON): Promise<CurrentMatchTable> {
  const table = {
    id: 1,
    gameState: data.game_state.new_phase,
    queue: data.queue.id,
    queueState: data.queue.state,
    partySize: data.party_size,
  }

  const [row] = await db.insert(currentMatch).values(table).onConflictDoUpdate({
    target: currentMatch.id,
    set: table,
  }).returning();

  return row;
}

export async function updateScore(data: MatchJSON) {
  await checkSaveTimelineEntries(data);
  
  const table = {
    id: 1,
    map: data.map.id,
    bans: data.banned_characters,
    trainings: data.trainings,
    teamOnePts: data.team1.goals,
    teamTwoPts: data.team2.goals,
    teamOneSets: data.team1.sets,
    teamTwoSets: data.team2.sets,
    startedAt: new Date(data.start_time * 1000)
  }

  await db.insert(currentMatch).values(table).onConflictDoUpdate({
    target: currentMatch.id,
    set: table,
  }).returning()
}

export async function updateQueueState(data: MetaJSON) {
  const table = {
    id: 1,
    gameState: data.game_state.new_phase,
    partySize: data.party_size,
    queue: data.queue.id,
    queueState: data.queue.state
  }

  // also update currentMatch's queue cache
  await db.insert(currentMatch).values(table).onConflictDoUpdate({
    target: currentMatch.id,
    set: table,
  })
}

export async function saveMatchToHistory(data: PostGameJSON) {
  console.debug(`Saving completed match to history...`);
  try {
    const [match, currentUser, matchPlayers] = await Promise.all([
      getCurrentMatch(),
      getUser(),
      getMatchPlayers(),
    ]);
    if (!match || !currentUser) return;

    const players = mergeMatchPlayers(matchPlayers, data);
    const myPlayer = players.find(p => p.name === currentUser.username);
    if (!myPlayer) return;

    const myTeam = myPlayer.team ?? 1;
    const myScore = myTeam === 1 ? (match.teamOneSets ?? 0) : (match.teamTwoSets ?? 0);
    const enemyScore = myTeam === 1 ? (match.teamTwoSets ?? 0) : (match.teamOneSets ?? 0);
    await appendTimelineEntry({
      when: new Date(),
      event: 'WON_GAME',
      team: (match.teamOneSets ?? 0) > (match.teamTwoSets ?? 0) ? 1 : 2,
    })

    await insertMatchHistory({
      players,
      mapId: match.map ?? '',
      duration: diffSeconds(match.startedAt!, new Date()),
      queue: getQueueObjectFromID(match.queue).queueName ?? 'Unknown',
      playerId: myPlayer.playerId,
      myTeam,
      bans: match.bans,
      t1_pts: match.teamOnePts ?? 0,
      t2_pts: match.teamTwoPts ?? 0,
      t1_sets: match.teamOneSets ?? 0,
      t2_sets: match.teamTwoSets ?? 0,
      wonGame: myScore > enemyScore,
      timeline: match.timeline,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error('Something went wrong while saving the match!', e);
  }
}

export function mergeMatchPlayers(
  players: MatchPlayersTable[],
  postGameStats: PostGameJSON,
): MatchPlayer[] {
  return players.map(player => {
    const stats = postGameStats.players.find(s => s.name === player.username);

    return {
      name: player.username,
      playerId: player.playerId,
      rating: player.rating,
      characterId: player.charId ?? '',
      level: getLevelFromXP(player.xp ?? 0),
      xpGoals: player.xpGoals,
      role: player.role ?? 'Forward',
      team: player.teamNum ?? 1,
      trainings: player.trainings,
      goals: stats?.goals ?? 0,
      redirects: stats?.redirects ?? 0,
      kos: stats?.knockouts ?? 0,
      damage: stats?.damage ?? 0,
      shots: stats?.shots ?? 0,
      orbs: stats?.orbs ?? 0,
      assists: stats?.assists ?? 0,
      saves: stats?.saves ?? 0,
      mvp: stats?.mvp ?? false,
    };
  });
}

export async function updateCustomLobby(data: MetaJSON) {
  const lobbyData = {
    id: 1,
    lobbyName: data.custom_lobby?.lobby_name,
    lobbyId: data.custom_lobby?.lobby_id,
    private: data.custom_lobby?.is_private,
    serverIds: data.custom_lobby?.regions,
    region: getRegionObjectFromID(data.custom_lobby?.regions[0]).region,
    appBlocked: flags.some(item => data.custom_lobby?.lobby_name.toLocaleLowerCase().includes(item)),
    maxMembers: data.custom_lobby?.lobby_size,
    memberCount: data.custom_lobby?.member_count,
    lastUpdated: new Date(),
  };

  await db.insert(customLobby).values(lobbyData).onConflictDoUpdate({ target: customLobby.id, set: lobbyData });
  if (lobbyData.appBlocked == true) { console.warn(`Lobby owner has blocked AiMi App. The Current Match page has been disabled.`) };
}

export async function checkBlocked(lobbyCache?: CustomLobbyTable, matchCache?: CurrentMatchTable): Promise<boolean> {
  let lobby: CustomLobbyTable;
  if (lobbyCache) { lobby = lobbyCache }
  else { lobby = await getCustomLobby() };

  let match: CurrentMatchTable;
  if (matchCache) { match = matchCache }
  else { match = await getCurrentMatch() };

  let decision = false;
  if (!lobby) { return decision };

  if (lobby.appBlocked === true) {
    decision = true;
    if (!match.queue || match.queue == 'queue:custom:NvM') { decision = true }
    else { // no longer in a custom lobby
      decision = false;
      await deleteCustomLobby();
    };
  };

  return decision;
}