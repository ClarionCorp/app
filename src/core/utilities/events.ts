// I just don't want to clutter App.tsx with a billion imports and functions for events.
// This file doesn't actually listen to events, it just acts on them. Like an actor... oh well.
// Anyways, App.tsx is still the orchestrator, this just has functions to help it.

import { eq, sql } from "drizzle-orm";
import { db } from "../database/driver";
import { currentMatch, matchPlayers, sessionInfo } from "../database/schema";
import { MatchJSON, MetaJSON, PlayersJSON, PostGameJSON } from "../../types/ue4ss";
import { appendTimelineEntry, calcAndSetPlayerStats, getCurrentMatch, getMatchPlayers, getUser, insertMatchHistory, updatePlayerRating } from "../database/queries";
import { fetchPlayerPlayerstyle, fetchPlayerSmurfEstimate } from "./clarion";
import { fetchPlayerStats, fetchRankQuery } from "./odyssey";
import { MatchPlayer } from "../../types/ue4ss";
import { getLevelFromXP } from "../objects/levels";
import { CurrentMatchTable, MatchPlayersTable } from "../../types/database";

const diffSeconds = (a: Date, b: Date) => Math.abs(b.getTime() - a.getTime()) / 1000;

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
      // I'll come back to this block later, prob just gonna switch to CC by default (more reliable)
      const ranked = await fetchRankQuery(player.playerId);
      const stats = await fetchPlayerStats(player.playerId);
      const playstyle = await fetchPlayerPlayerstyle(player.username);
      const smurf = await fetchPlayerSmurfEstimate(player.username);
      await calcAndSetPlayerStats(player.username, stats, player.playerId); // run first since it really shouldn't fail as much as rating
      await updatePlayerRating(player.username, ranked!.rating);
      await db.update(matchPlayers).set({ playstyle, smurfProbability: smurf?.confidence }).where(eq(matchPlayers.username, player.username));
    } catch (e) {
      console.warn(`No rank data could be found for ${player.username}.`);
      updatePlayerRating(player.username, 0); // set to 0 to prevent refetching (and failing again)
      continue;
    }
  }
}

export async function updateGameState(gameState: string, queue?: string | null): Promise<CurrentMatchTable> {
  const table = {
    gameState,
    queue,
  }

  const [row] = await db.insert(currentMatch).values(table).onConflictDoUpdate({
    target: currentMatch.id,
    set: table,
  }).returning();

  return row;
}

export async function updateScore(data: MatchJSON) {
  const table = {
    map: data.map.id,
    bans: data.banned_characters,
    // teamNum: data.
    teamOnePts: data.team1.goals,
    teamTwoPts: data.team2.goals,
    teamOneSets: data.team1.sets,
    teamTwoSets: data.team2.sets,
  }

  await db.insert(currentMatch).values(table).onConflictDoUpdate({
    target: currentMatch.id,
    set: table,
  }).returning()
}

export async function updateSession(data: MetaJSON) {
  const table = {
    partySize: data.party_size,
    maxPartySize: data.max_party_size,
    queueName: data.queue.name,
    queueState: data.queue.state
  }

  await db.insert(sessionInfo).values(table).onConflictDoUpdate({
    target: sessionInfo.id,
    set: table,
  })

  // also update currentMatch's queue cache
  await db.insert(currentMatch).values({ queue: data.queue.name }).onConflictDoUpdate({
    target: sessionInfo.id,
    set: { queue: data.queue.name },
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

    const myTeam = match.teamNum ?? 1;
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
      queue: match.queue ?? 'queue:none',
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
    };
  });
}