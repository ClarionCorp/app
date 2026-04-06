import { AppContextType } from '../App';
import { db } from './database/driver';
import { getCurrentMatch, getTelemetrySettings, getUser, updateCurrentMatch } from './database/queries';
import { currentMatch } from './database/schema';
import { DEFAULT_ACTIVITY } from './discord';
import { getPhaseGroup, startLogMonitor } from './logMonitor';
import { getCharDevName, getMapName, getQueueName } from './objects/ody';
import { refreshRating } from './utilities/odyssey';
import { getRankFromLP } from './utilities/ranks';

type MonitorContext = Pick<AppContextType,
  | 'updateActivity'
  | 'setMatchPhase'
> & {
  sessionOffset: number;
};

function formatScore(
  teamOnePoints: number,
  teamTwoPoints: number,
  teamOneSets: number,
  teamTwoSets: number,
  myTeam: string | null,
): string {
  const myPoints = myTeam === 'TeamTwo' ? teamTwoPoints : teamOnePoints;
  const theirPoints = myTeam === 'TeamTwo' ? teamOnePoints : teamTwoPoints;
  const mySets = myTeam === 'TeamTwo' ? teamTwoSets : teamOneSets;
  const theirSets = myTeam === 'TeamTwo' ? teamOneSets : teamTwoSets;

  const myBar = `${'⬛'.repeat(3 - mySets)}${'🟦'.repeat(mySets)}`;
  const theirBar = `${'🟥'.repeat(theirSets)}${'⬛'.repeat(3 - theirSets)}`;

  return `${myBar} (${myPoints} | ${theirPoints}) ${theirBar}`;
}

export async function initMonitorCallbacks(ctx: MonitorContext) {
  const {
    updateActivity,
    setMatchPhase,
    sessionOffset,
  } = ctx;

  // track last phase group outside of React
  let lastPhaseGroup: string | null = null;

  // in-memory player set (avoids DB-read race when all 6 players register in the same log batch)
  const activePlayers = new Set<string>();

  // Clear current match database table
  await db.insert(currentMatch).values({
    id: 1,
    rawPhase: 'EMatchPhase::None',
    startedAt: new Date(),
    playerNames: [],
  }).onConflictDoUpdate({
    target: currentMatch.id,
    set: {
      rawPhase: 'EMatchPhase::None',
      level: null,
      myCharacter: null,
      myTeam: null,
      teamOnePts: null,
      teamTwoPts: null,
      teamOneSets: null,
      teamTwoSets: null,
      playerNames: [],
      startedAt: new Date(),
    },
  }).run();

  return startLogMonitor(sessionOffset, {
    onMatchPhase: async (phase) => {
      setMatchPhase(phase);

      if (phase === 'EMatchPhase::None') {
        activePlayers.clear();
        await db.update(currentMatch).set({
          rawPhase: phase,
          level: null,
          myCharacter: null,
          myTeam: null,
          teamOnePts: 0,
          teamTwoPts: 0,
          teamOneSets: 0,
          teamTwoSets: 0,
          playerNames: [],
        }).run();
      } else {
        await db.update(currentMatch).set({ rawPhase: phase }).run();
      }

      const phaseGroup = getPhaseGroup(phase);
      console.debug(`Changing Phase Group: ${phaseGroup}`);

      // fires once after setup, right before start game starts
      if (phase == 'EMatchPhase::VersusScreen') {
        console.log('Game Starting!');
        const startingTs = new Date();
        await db.update(currentMatch).set({ startedAt: startingTs }).run();
      }

      // Discord RPC
      const appSettings = await getTelemetrySettings();
      if (appSettings.play_state) { // only run this block to update drpc if allowed to
        if (lastPhaseGroup !== phaseGroup) {
          lastPhaseGroup = phaseGroup;
          console.log(`Sending Discord a new Game State! (${phaseGroup})`);

          const match = await getCurrentMatch();
          const user = await getUser();
          let largeImg = 'aimiapp_logo';
          if (match?.myCharacter) { largeImg = getCharDevName(match.myCharacter).toLowerCase(); }

          // Current problem is that the score -> set calc is hardcoded to 3, so custom games sort of break currently.

          switch (phaseGroup) {
            case 'in_game': // fires when a game has started and after scores/intermissions
              const rankObject = getRankFromLP(user?.rating);
              console.debug(`Current Rank: ${JSON.stringify(rankObject, null, 1)} (${user?.rating} rating)`);
              await updateActivity({
                details: `${match?.queue ? getQueueName(match.queue) : match?.queue} - ${match?.level ? getMapName(match.level) : match?.level}`,
                state: formatScore(
                  match?.teamOnePts ?? 0,
                  match?.teamTwoPts ?? 0,
                  match?.teamOneSets ?? 0,
                  match?.teamTwoSets ?? 0,
                  match?.myTeam ?? null,
                ),
                largeImage: largeImg,
                largeText: match?.myCharacter ? `Playing ${match.myCharacter}` : 'Ai.Mi Companion App',
                smallImage: rankObject.key,
                smallText: rankObject.name,
                // buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
                startTimestamp: match.startedAt.getTime(),
              });
              break;
            case 'waiting': // fires after scoring/intermission to update in_game
              break;
            case 'starting': // fires once after the queue pops
              await refreshRating();
              await updateActivity({
                details: `Ranked - ${match?.level ? getMapName(match.level) : match?.level}`,
                state: `Voting on Game Settings...`,
                startTimestamp: new Date().getTime(),
                endTimestamp: new Date().getTime() + 70 * 1000,
              });
              break;
            default: // fires when the user returns to the lobby
              await updateActivity(DEFAULT_ACTIVITY);
              break;
          }
        }
      }
    },

    onPlayerRegistered: async (username) => {
      if (activePlayers.has(username) || activePlayers.size >= 6) return;
      activePlayers.add(username);
      await updateCurrentMatch({ playerNames: [...activePlayers] });
    },

    onLevel: async (level) => {
      await updateCurrentMatch({ level });
    },

    onMyCharacter: async (char) => {
      await updateCurrentMatch({ myCharacter: char });
    },

    onScore: async ({ team, from, to }) => {
      const match = await getCurrentMatch();
      if (team === 'TeamOne') {
        const newSets = (from === 3 && to === 0) ? (match?.teamOneSets ?? 0) + 1 : (match?.teamOneSets ?? 0);
      await updateCurrentMatch({ teamOnePts: to, teamOneSets: newSets });
      } else {
        const newSets = (from === 3 && to === 0) ? (match?.teamTwoSets ?? 0) + 1 : (match?.teamTwoSets ?? 0);
      await updateCurrentMatch({ teamTwoPts: to, teamTwoSets: newSets });
      }
    },

    onMyTeam: async (team) => {
      await updateCurrentMatch({ myTeam: team });
    },

    onQueue: async (queue) => {
      await updateCurrentMatch({ queue: queue });
    },
  });
}