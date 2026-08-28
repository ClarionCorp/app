// Mostly just where RankChecker resides lol

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { HouseIcon } from '@phosphor-icons/react';
import { Button } from '../components/UI/Button';
import { CurrentMatchTable, MatchPlayersTable } from '../types/database';
import { getCurrentMatch, getCustomLobby, getMatchPlayers } from '../core/database/queries';
import { PlayerCard } from '../components/LiveMatch/PlayerCard';
import { AvailableTrainings } from '../components/LiveMatch/AvailableTrainings';
import { OutOfGamePanel } from '../components/LiveMatch/OutOfGame/OutOfGamePanel';
import { AbilityCard } from '../components/LiveMatch/AbilityCard';
import { MatchInfo } from '../components/LiveMatch/MatchInfo';
import { Awakenings } from '../types/clarion';
import { getCurrentAwakeningRotation } from '../core/utilities/clarion';
import { characters } from '../core/objects/characters';
import { getGameStatus } from '../core/objects/gameStates';
import { checkBlocked } from '../core/utilities/events';
import { XPTimeline } from '../components/LiveMatch/XPTimeline';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};


export default function CurrentMatchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [match, setMatchData] = useState<CurrentMatchTable>();
  const [players, setPlayers] = useState<MatchPlayersTable[]>([]);
  const [allTrainings, setTrainings] = useState<Awakenings[]>([]);
  const [blocked, setBlocked] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const matchDb = await getCurrentMatch();
        setMatchData(matchDb);

        const playersDb = await getMatchPlayers();
        setPlayers(playersDb);

        setTrainings(await getCurrentAwakeningRotation());

        const lobby = await getCustomLobby();

        const decision = await checkBlocked(lobby, matchDb);
        setBlocked(decision);

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
      const lobby = await getCustomLobby();
      const decision = await checkBlocked(lobby, matchDb);
      setBlocked(decision);
    }, 2000);
    return () => clearInterval(id);
  }, [loading]);

  const [abilityForm, setAbilityForm] = useState<'Open' | 'Closed'>('Closed');

  const myPlayer = players.find(p => p.isMe);
  const myChar = characters.find(c => c.id === myPlayer?.charId);
  const myTeamNum = myPlayer?.teamNum ?? 1;
  const blueTeam = players
    .filter(p => p.teamNum === myTeamNum)
    .sort((a) => (a.role === 'Goalie' ? -1 : 1));
  const redTeam = players
    .filter(p => p.teamNum !== myTeamNum)
    .sort((a) => (a.role === 'Goalie' ? -1 : 1));

  const mvp = players.reduce<MatchPlayersTable | undefined>((best, p) => {
    if (p.gainedXp == null) return best;
    if (!best || (best.gainedXp ?? 0) < p.gainedXp) return p;
    return best;
  }, undefined);

  // always show maps (default state) unless in game
  const gameStatus = getGameStatus(match?.gameState);
  const showOutOfGame =
    match?.queueState == 'StartingGame' ||
    match?.queueState == 'FoundMatch' ||
    (gameStatus !== 'IN_GAME' && gameStatus !== 'SETUP' && gameStatus !== 'STARTING');

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-4">
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
          ) : blocked ? (
            <motion.div
              key="other"
              className="flex flex-col items-center justify-center h-full min-h-64 gap-2 px-6 text-center mt-24"
              exit={{ opacity: 0 }}
            >
              <img
                src={'/aimi/Cry.png'}
                className="w-40 aspect-square rounded-xl object-cover mb-3"
              />
              <p className="text-2xl font-bold text-error">App Blocked</p>
              <p className="text-sm text-char-secondary whitespace-pre-wrap mb-4">
                This custom lobby has prohibited the use of this page. Sorry!
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/home')}
                iconLeft={<HouseIcon size={15} />}
              >
                Go Home
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className="max-w mx-auto space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {!showOutOfGame && <>
                <MatchInfo match={match} myPlayer={myPlayer} />
                <AvailableTrainings allTrainings={allTrainings} match={match} players={players} />
              </>
              }

              <div className="flex flex-col lg:flex-row lg:gap-0 mt-4 mb-8">
                <div className="flex-1 min-w-0 space-y-3">
                  {showOutOfGame ? (
                    <OutOfGamePanel />
                  ) : (
                    <>
                      <div className="space-y-3">
                        {blueTeam.map((player, index) => (
                          <PlayerCard key={player.username} player={player} match={match} index={index} isBlue isMvp={player.username === mvp?.username} />
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-background-border" />
                        <span className="text-xs text-zinc-500">vs</span>
                        <div className="flex-1 h-px bg-background-border" />
                      </div>

                      <div className="space-y-3">
                        {redTeam.map((player, index) => (
                          <PlayerCard key={player.username} player={player} match={match} index={blueTeam.length + index} isMvp={player.username === mvp?.username} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {!showOutOfGame && <>
                  <div className="hidden lg:block w-px mx-2 self-stretch" />

                  <div className="hidden lg:block flex-1 min-w-0 space-y-3 overflow-y-auto pb-16">
                    <XPTimeline />
                    {myChar ? (
                      <>
                        {myChar.pagination && (
                          <div className="flex gap-1 p-1 bg-surface rounded-lg border border-surface-border">
                            {(['Closed', 'Open'] as const).map(form => (
                              <button
                                key={form}
                                onClick={() => setAbilityForm(form)}
                                className={`flex-1 py-1.5 text-sm font-semibold cursor-pointer rounded-md transition-colors ${
                                  abilityForm === form
                                    ? 'bg-surface-overlay text-char'
                                    : 'text-char-subtle hover:text-char'
                                }`}
                              >
                                {form}
                              </button>
                            ))}
                          </div>
                        )}
                        {(myChar.pagination
                          ? myChar.abilities.filter(a =>
                              abilityForm === 'Open'
                                ? !a.type.startsWith('Closed')
                                : !a.type.startsWith('Open')
                            )
                          : myChar.abilities
                        ).map((ability, index) => (
                          <AbilityCard key={`${ability.type}-${index}`} ability={ability} />
                        ))}
                      </>
                    ) : (
                      <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-48">
                        No character data
                      </div>
                    )}
                  </div>
                  </>
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}