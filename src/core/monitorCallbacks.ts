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
  | 'teamOneSets'
  | 'teamTwoSets'
  | 'setMyTeam'
> & {
  currentLevelRef: RefObject<string | null>;
  myCharacterRef: RefObject<string | null>;
  lastPhaseGroupRef: RefObject<string | null>;
  updateActivityRef: RefObject<(options: RpcActivityOptions) => Promise<void>>;
  sessionOffset: number;
};

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
    teamOneSets,
    teamTwoSets,
    currentLevelRef,
    myCharacterRef,
    lastPhaseGroupRef,
    updateActivityRef,
    sessionOffset,
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

      if (lastPhaseGroupRef.current !== phaseGroup) {
        lastPhaseGroupRef.current = phaseGroup;
        console.log(`Sending Discord a new Game State! (${phaseGroup})`);

        switch (phaseGroup) {
          case 'in_game':
            await updateActivityRef.current({
              details: `Ranked - ${currentLevelRef.current ? getMapName(currentLevelRef.current) : currentLevelRef.current}`, // prob a better way to do this lol
              state: `⬛⬛🟦 2 | 2 🟥🟥⬛`, // test placeholder (idk how to format this shit properly to make sense lol)
              largeImage: getCharDevName(myCharacterRef.current ?? 'aimiapp_logo').toLowerCase(),
              largeText: `${myCharacterRef.current ? `Playing ${myCharacterRef.current}` : 'AiMi App'}`,
              smallImage: 'platinum_high', // placeholder
              smallText: 'High Platinum', // placeholder
              buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/download" }],
            })
            break;
          case 'starting':
            // await updateActivity({
            //   details: `Ranked - ${currentLevelRef.current ? getMapName(currentLevelRef.current) : currentLevelRef.current}`, // prob a better way to do this lol
            //   state: `Voting on Game Settings...`,
            //   startTimestamp: new Date().getTime(),
            // })
            break;
          default: // includes out_of_game
            // await updateActivity(DEFAULT_ACTIVITY)
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
        if (from === 3 && to === 0) setTeamOneSets(teamOneSets + 1);
        setTeamOnePoints(to);
      } else {
        if (from === 3 && to === 0) setTeamTwoSets(teamTwoSets + 1);
        setTeamTwoPoints(to);
      }
    },

    onMyTeam: (team) => setMyTeam(team),
  });
}