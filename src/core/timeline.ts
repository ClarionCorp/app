import { eq } from "drizzle-orm";
import { appendTimelineEntry, getCurrentMatch, getMatchPlayers } from "./database/queries";
import { matchPlayers } from "./database/schema";
import { db } from "./database/driver";
import { MatchJSON } from "../types/ue4ss";

export async function checkSaveTimelineEntries(matchJSON: MatchJSON) {
  const matchTable = await getCurrentMatch();
  
  if (
    !matchJSON || matchJSON.team1.goals == null || matchJSON.team1.sets == null || matchJSON.team2.goals == null || matchJSON.team2.sets == null ||
    !matchTable || matchTable.teamOnePts == null || matchTable.teamTwoPts == null || matchTable.teamOneSets == null || matchTable.teamTwoSets == null
  ) {
    console.error(`Tried saving timeline entry but something was null!`, matchJSON);
    return;
  };

  // Data Points
  const teamOneScored = matchTable.teamOnePts < matchJSON.team1.goals;
  const teamTwoScored = matchTable.teamTwoPts < matchJSON.team2.goals;
  const teamOneSetted = matchTable.teamOneSets < matchJSON.team1.sets;
  const teamTwoSetted = matchTable.teamTwoSets < matchJSON.team2.sets;

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