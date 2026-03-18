import { AppContextType } from '../App';
import { db } from './database/driver';
import { currentMatch } from './database/schema';
import { DEFAULT_ACTIVITY } from './discord';
import { getPhaseGroup, startLogMonitor } from './logMonitor';
import { getCharDevName, getMapName } from './objects';

type MonitorContext = Pick<AppContextType,
  | 'updateActivity'
  | 'setMatchPhase'
  | 'setRegisteredPlayers'
  | 'setCurrentLevel'
  | 'setMyCharacter'
  | 'setTeamOnePoints'
  | 'setTeamTwoPoints'
  | 'setTeamOneSets'
  | 'setTeamTwoSets'
  | 'setMyTeam'
  | 'setCurrentRating'
> & {
  sessionOffset: number;
};

async function getMatch() {
  return db.select().from(currentMatch).limit(1).then(r => r[0] ?? null);
}

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
    setRegisteredPlayers,
    setCurrentLevel,
    setMyCharacter,
    setTeamOnePoints,
    setTeamTwoPoints,
    setTeamOneSets,
    setTeamTwoSets,
    setMyTeam,
    setCurrentRating,
    sessionOffset,
  } = ctx;

  // track last phase group outside of React
  let lastPhaseGroup: string | null = null;

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
        setRegisteredPlayers([]);
        setCurrentLevel(null);
        setMyCharacter(null);
        setTeamOnePoints(0);
        setTeamTwoPoints(0);
        setTeamOneSets(0);
        setTeamTwoSets(0);
        setMyTeam(null);
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

      if (lastPhaseGroup !== phaseGroup) {
        lastPhaseGroup = phaseGroup;
        console.log(`Sending Discord a new Game State! (${phaseGroup})`);

        const match = await getMatch();
        let largeImg = 'aimiapp_logo';
        if (match?.myCharacter) { largeImg = getCharDevName(match.myCharacter).toLowerCase(); }

        // Current issue, startTimestamp gets reset whenever the activity changes no matter what.
        // We should keep track of it, so it can always set to "start" from now minus x seconds since actual start.
        // Also the score to set calc is hardcoded to 3, so custom games break currently.
        // Then, need to tackle actually using the user's rank (probably fetch once in /me on app launch?)
        // Finally, we need to hook up the actual game mode instead of just using 'Ranked'. ['Ranked', 'Custom', 'TTT', 'Normal', 'Quick Play', 'Practice']

        switch (phaseGroup) {
          case 'in_game': // fires when a game has started and after scores/intermissions
            await updateActivity({
              details: `Ranked - ${match?.level ? getMapName(match.level) : match?.level}`,
              state: formatScore(
                match?.teamOnePts ?? 0,
                match?.teamTwoPts ?? 0,
                match?.teamOneSets ?? 0,
                match?.teamTwoSets ?? 0,
                match?.myTeam ?? null,
              ),
              largeImage: largeImg,
              largeText: match?.myCharacter ? `Playing ${match.myCharacter}` : 'AiMi Companion App',
              smallImage: 'platinum_high', // placeholder
              smallText: 'High Platinum', // placeholder
              buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
              startTimestamp: match.startedAt.getTime(),
            });
            break;
          case 'waiting': // fires after scoring/intermission to update in_game
            break;
          case 'starting': // fires once after the queue pops
            setCurrentRating(2);
            const startingTs = new Date();
            await db.update(currentMatch).set({ startedAt: startingTs }).run();
            await updateActivity({
              details: `Ranked - ${match?.level ? getMapName(match.level) : match?.level}`,
              state: `Voting on Game Settings...`,
              startTimestamp: startingTs.getTime(),
            });
            break;
          default: // fires when the user returns to the lobby
            await updateActivity(DEFAULT_ACTIVITY);
            break;
        }
      }
    },

    onPlayerRegistered: async (username) => {
      const match = await getMatch();
      const prev = match?.playerNames ?? [];
      if (prev.includes(username)) return;
      const next = [...prev, username];
      setRegisteredPlayers(next);
      await db.update(currentMatch).set({ playerNames: next }).run();
    },

    onLevel: async (level) => {
      setCurrentLevel(level);
      await db.update(currentMatch).set({ level }).run();
    },

    onMyCharacter: async (char) => {
      setMyCharacter(char);
      await db.update(currentMatch).set({ myCharacter: char }).run();
    },

    onScore: async ({ team, from, to }) => {
      const match = await getMatch();
      if (team === 'TeamOne') {
        const newSets = (from === 3 && to === 0) ? (match?.teamOneSets ?? 0) + 1 : (match?.teamOneSets ?? 0);
        setTeamOnePoints(to);
        setTeamOneSets(newSets);
        await db.update(currentMatch).set({ teamOnePts: to, teamOneSets: newSets }).run();
      } else {
        const newSets = (from === 3 && to === 0) ? (match?.teamTwoSets ?? 0) + 1 : (match?.teamTwoSets ?? 0);
        setTeamTwoPoints(to);
        setTeamTwoSets(newSets);
        await db.update(currentMatch).set({ teamTwoPts: to, teamTwoSets: newSets }).run();
      }
    },

    onMyTeam: async (team) => {
      setMyTeam(team);
      await db.update(currentMatch).set({ myTeam: team }).run();
    },
  });
}