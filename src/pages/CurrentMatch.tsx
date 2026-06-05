// Mostly just where RankChecker resides lol

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { CurrentMatchTable, MatchPlayersTable, SessionTable } from '../types/database';
import { getCurrentMatch, getGameSession, getMatchPlayers } from '../core/database/queries';
import { PlayerCard } from '../components/LiveMatch/PlayerCard';
import { AvailableTrainings } from '../components/LiveMatch/AvailableTrainings';
import { MapRotation } from '../components/LiveMatch/MapRotation';
import { AbilityCard } from '../components/LiveMatch/AbilityCard';
import { Awakenings } from '../types/clarion';
import { getCurrentAwakeningRotation } from '../core/utilities/clarion';
import { characters } from '../core/objects/characters';
import { getGameStatus } from '../core/objects/gameStates';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};


export default function CurrentMatchPage() {
  const [loading, setLoading] = useState(true);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [match, setMatchData] = useState<CurrentMatchTable>();
  const [players, setPlayers] = useState<MatchPlayersTable[]>([]);
  const [allTrainings, setTrainings] = useState<Awakenings[]>([]);
  const [session, setSession] = useState<SessionTable>();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const matchDb = await getCurrentMatch();
        if (!matchDb) throw new Error('No active match found');
        setMatchData(matchDb);

        const playersDb = await getMatchPlayers();
        setPlayers(playersDb);

        setTrainings(await getCurrentAwakeningRotation());

        const sessionDb = await getGameSession();
        setSession(sessionDb);
        setRetryMessage(null);
        setLoading(false);
      } catch (e) {
        setRetryMessage(e instanceof Error ? e.message : String(e));
        setTimeout(load, 2000);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    const id = setInterval(async () => {
      const playersDb = await getMatchPlayers();
      setPlayers(playersDb);
      const matchDb = await getCurrentMatch();
      setMatchData(matchDb);
      const sessionDb = await getGameSession();
      setSession(sessionDb);
    }, 5000);
    return () => clearInterval(id);
  }, [loading]);

  const myPlayer = players.find(p => p.isMe);
  const myChar = characters.find(c => c.id === myPlayer?.charId);
  const myTeamNum = myPlayer?.teamNum ?? 1;
  const blueTeam = players
    .filter(p => p.teamNum === myTeamNum)
    .sort((a) => (a.role === 'Goalie' ? -1 : 1));
  const redTeam = players
    .filter(p => p.teamNum !== myTeamNum)
    .sort((a) => (a.role === 'Goalie' ? -1 : 1));

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center h-full min-h-64 gap-3"
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 rounded-full border-[3px] border-surface-overlay border-t-primary animate-spin" />
              <p className="text-xs text-white">
                {retryMessage ?? 'Loading data...'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className="max-w mx-auto space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AvailableTrainings allTrainings={allTrainings} match={match} players={players} />

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-background-border" />
              </div>

              <div className="flex flex-col lg:flex-row lg:gap-0">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* always show maps (default state) unless in game */}
                  {
                    session?.queueState == 'StartingGame' ||
                    session?.queueState == 'FoundMatch' ||
                    (getGameStatus(match?.gameState) !== 'IN_GAME' && getGameStatus(match?.gameState) !== 'SETUP' && getGameStatus(match?.gameState) !== 'STARTING')  ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <MapRotation />
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {blueTeam.map((player, index) => (
                          <PlayerCard key={player.username} player={player} match={match} index={index} isBlue />
                        ))}
                      </div>

                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-background-border" />
                        <span className="text-xs text-zinc-500">vs</span>
                        <div className="flex-1 h-px bg-background-border" />
                      </div>

                      <div className="space-y-3">
                        {redTeam.map((player, index) => (
                          <PlayerCard key={player.username} player={player} match={match} index={blueTeam.length + index} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden lg:block w-px mx-4 self-stretch" />

                <div className="hidden lg:block flex-1 min-w-0 space-y-3 overflow-y-auto pb-16">
                  {myChar ? (
                    myChar.abilities.map(ability => (
                      <AbilityCard key={ability.type} ability={ability} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-48">
                      No character data
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}