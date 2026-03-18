import { RefObject } from 'react';
import { AppContextType } from '../App';
import { DEFAULT_ACTIVITY, RpcActivityOptions } from './discord';
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
  | 'teamOnePointsRef'
  | 'teamTwoPointsRef'
  | 'teamOneSetsRef'
  | 'teamTwoSetsRef'
  | 'setMyTeam'
  | 'myTeamRef'
  | 'currentLevelRef'
  | 'myCharacterRef'
  | 'myCurrentRating'
  | 'setCurrentRating'
  | 'myCurrentRatingRef'
> & {
  lastPhaseGroupRef: RefObject<string | null>;
  updateActivityRef: RefObject<(options: RpcActivityOptions) => Promise<void>>;
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
    teamOneSetsRef,
    teamTwoSetsRef,
    teamOnePointsRef,
    teamTwoPointsRef,
    currentLevelRef,
    myCharacterRef,
    lastPhaseGroupRef,
    updateActivityRef,
    sessionOffset,
    myTeamRef,
    myCurrentRating,
    myCurrentRatingRef,
  } = ctx;

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
      }

      // Discord RPC updates
      const phaseGroup = getPhaseGroup(phase);
      console.debug(`Changing Phase Group: ${phaseGroup}`);
      console.debug(`T1: ${teamOnePointsRef.current} T2: ${teamTwoPointsRef.current}`);

      if (lastPhaseGroupRef.current !== phaseGroup) {
        lastPhaseGroupRef.current = phaseGroup;
        console.log(`Sending Discord a new Game State! (${phaseGroup})`);
        let largeImg = 'aimiapp_logo';
        if (myCharacterRef.current) { largeImg = getCharDevName(myCharacterRef.current).toLowerCase(); }

        // Current issue, startTimestamp gets reset whenever the activity changes no matter what.
        // We should keep track of it, so it can always set to "start" from now minus x seconds since actual start.
        // Also the score to set calc is hardcoded to 3, so custom games break currently.
        // Then, need to tackle actually using the user's rank (probably fetch once in /me on app launch?)
        // Finally, we need to hook up the actual game mode instead of just using 'Ranked'. ['Ranked', 'Custom', 'TTT', 'Normal', 'Quick Play', 'Practice']

        switch (phaseGroup) {
          case 'in_game': // fires when a game has started and after scores/intermissions
            await updateActivityRef.current({
              details: `Ranked - ${currentLevelRef.current ? getMapName(currentLevelRef.current) : currentLevelRef.current}`, // prob a better way to do this lol
              state: formatScore(teamOnePointsRef.current, teamTwoPointsRef.current, teamOneSetsRef.current, teamTwoSetsRef.current, myTeamRef.current),
              largeImage: largeImg,
              largeText: `${myCharacterRef.current ? `Playing ${myCharacterRef.current}` : 'AiMi Companion App'}`,
              smallImage: 'platinum_high', // placeholder
              smallText: 'High Platinum', // placeholder
              buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
            })
            break;
          case 'waiting': // fires after scoring/intermission to update in_game
            break;
          case 'starting': // fires once after the queue pops
            // Refresh user's rating
            
            setCurrentRating(2);


            await updateActivityRef.current({
              details: `Ranked - ${currentLevelRef.current ? getMapName(currentLevelRef.current) : currentLevelRef.current}`, // prob a better way to do this lol
              state: `Voting on Game Settings...`,
              startTimestamp: new Date().getTime(),
            })
            break;
          default: // fires when the user returns to the lobby
            await updateActivityRef.current(DEFAULT_ACTIVITY)
            break;
        }
      }
    },

    onPlayerRegistered: (username) => {
      setRegisteredPlayers(prev =>
        prev.includes(username) ? prev : [...prev, username]
      );
    },

    onLevel: (level) => setCurrentLevel(level),

    onMyCharacter: (char) => setMyCharacter(char),

    onScore: ({ team, from, to }) => {
      if (team === 'TeamOne') {
        if (from === 3 && to === 0) setTeamOneSets(teamOneSetsRef.current + 1);
        setTeamOnePoints(to);
      } else {
        if (from === 3 && to === 0) setTeamTwoSets(teamTwoSetsRef.current + 1);
        setTeamTwoPoints(to);
      }
    },

    onMyTeam: (team) => setMyTeam(team),
  });
}