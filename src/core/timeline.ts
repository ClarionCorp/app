import { eq } from "drizzle-orm";
import { CurrentMatchTable } from "../types/database";
import { GameStateJSON } from "../types/ue4ss";
import { appendTimelineEntry, getCurrentMatch, getMatchPlayers } from "./database/queries";
import { matchPlayers } from "./database/schema";
import { db } from "./database/driver";

export async function checkSaveTimelineEntries(oldState: CurrentMatchTable, newState: GameStateJSON) {
  if (!oldState || oldState.teamOnePts == null || oldState.teamTwoPts == null || oldState.teamOneSets == null || oldState.teamTwoSets == null) {
    console.error(`Tried saving timeline entry but something was null!`, oldState);
    return;
  };

  // Data Points
  const teamOneScored = oldState.teamOnePts < newState.t1_goals;
  const teamTwoScored = oldState.teamTwoPts < newState.t2_goals;
  const teamOneSetted = oldState.teamOneSets < newState.t1_sets;
  const teamTwoSetted = oldState.teamTwoSets < newState.t2_sets;

  // Goal Scored, log event + save player xps
  if (teamOneScored || teamTwoScored) {
    console.info(`Goal Scored! Saving to timeline & updating players...`);
    await appendTimelineEntry({
      when: new Date(),
      event: 'GOAL_SCORE',
      team: teamOneScored ? 1 : 2,
    })

    const players = await getMatchPlayers();
    for (const player of players) {
      await db.update(matchPlayers).set({ xpGoals: [...player.xpGoals, player.xp ?? 0] }).where(eq(matchPlayers.username, player.username));
    }
  };
  
  
  // Set Finalized, log event
  if (teamOneSetted || teamTwoSetted) {
    console.info(`Set Finalized! Saving to timeline...`);
    await appendTimelineEntry({
      when: new Date(),
      event: 'WON_SET',
      team: teamOneSetted ? 1 : 2,
    })
  };


  // Won Game is saved + determined while saving match history.
  // It's never saved to the currentMatch table.
}

export async function markMatchStartIfNone() {
  const currentMatch = await getCurrentMatch();
  const gameStart = currentMatch.timeline.find(e => e.event === 'GAME_START');
  if (gameStart) { return };
  
  console.log(`Marking Game Start in Timeline...`);
  await appendTimelineEntry({
    when: new Date(),
    event: 'GAME_START',
  })
}