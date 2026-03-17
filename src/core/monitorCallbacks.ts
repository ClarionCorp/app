import { AppContextType } from '../App';
import { DEFAULT_ACTIVITY, useDiscordRpc } from './discord';
import { getPhaseGroup, startLogMonitor } from './logMonitor';
import { getCharDevName } from './objects';

type MonitorContext = Pick<AppContextType,
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
  | 'currentLevel'
  | 'myCharacter'
>;

export async function initMonitorCallbacks(ctx: MonitorContext) {
  const { updateActivity } = useDiscordRpc();
  const {
    setMatchPhase,
    setRegisteredPlayers,
    setCurrentLevel,
    setMyCharacter,
    setTeamOnePoints,
    setTeamTwoPoints,
    setTeamOneSets,
    setTeamTwoSets,
    teamOneSets,
    teamTwoSets,
    currentLevel,
    myCharacter
  } = ctx;

  return startLogMonitor(0, {
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
      }

      // Discord RPC updates
      const phaseGroup = getPhaseGroup(phase);

      switch (phaseGroup) {
        case 'starting':
          await updateActivity({
            details: `Ranked - ${currentLevel}`,
            startTimestamp: new Date().getTime(),
          })
          break;
        case 'in_game':
          await updateActivity({
            details: `Ranked - ${currentLevel}`,
            state: `__I - 2pts | 2pts - II_`, // test placeholder (idk how to format this shit properly to make sense lol)
            largeImage: getCharDevName(myCharacter ?? 'aimiapp_logo').toLowerCase(),
            largeText: myCharacter ?? 'AiMi App',
            smallImage: 'platinum_high', // placeholder
            smallText: 'High Platinum', // placeholder
          })
          break;
        default: // includes out_of_game
          await updateActivity(DEFAULT_ACTIVITY)
          break;
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
  });
}