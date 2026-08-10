// I just don't want to clutter App.tsx with a billion imports and functions for events.
// This file doesn't actually listen to events, it just acts on them. Like an actor... oh well.
// Anyways, App.tsx is still the orchestrator, this just has functions to help it.

import { eq, sql } from "drizzle-orm";
import { db } from "../database/driver";
import { matchPlayers } from "../database/schema";
import { PlayersJSON } from "../../types/ue4ss-new";
import { calcAndSetPlayerStats, getUser, updatePlayerRating } from "../database/queries";
import { fetchPlayerPlayerstyle, fetchPlayerSmurfEstimate } from "./clarion";
import { fetchPlayerStats, fetchRankQuery } from "./odyssey";

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