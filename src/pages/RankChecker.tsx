import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../App';
import { PlayerCard } from '../components/PlayerCard';
import { RankedQuery } from '../types/odyssey';
import { getPhaseGroup } from '../core/logMonitor';
import { fetchRankQuery, fetchUsernameQuery } from '../core/utilities/odyssey';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

async function fetchPlayerData(usernames: string[]): Promise<RankedQuery[]> {
  console.log(`Fetching ${usernames.length} users...`);
  console.debug(`Fetching ranks for ${usernames.join(', ')}...`)
  const results = await Promise.allSettled(
    usernames.map(async (username) => {
      const user = await fetchUsernameQuery(username);
      if (!user) return;
      const ranked = await fetchRankQuery(user.playerId);
      if (!ranked) return;
      return ranked;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<RankedQuery> => r.status === 'fulfilled' && r.value != null)
    .map((r) => r.value);
}

export default function RankCheckerPage() {
  const { currentMatch } = useOutletContext<AppContextType>();
  const [players, setPlayers] = useState<RankedQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedUsernames = useRef(new Set<string>());

  const phaseGroup = currentMatch?.rawPhase ? getPhaseGroup(currentMatch.rawPhase) : 'out_of_game';
  const inGame = phaseGroup === 'starting' || phaseGroup === 'in_game' || phaseGroup === 'waiting';
  const registeredPlayers = currentMatch?.playerNames ?? [];

  useEffect(() => {
    if (!inGame) {
      setPlayers([]);
      fetchedUsernames.current.clear();
      return;
    }

    const unfetched = registeredPlayers.filter(u => !fetchedUsernames.current.has(u));
    if (unfetched.length === 0) return;

    // Mark synchronously so concurrent effect runs dont double-fetch
    unfetched.forEach(u => fetchedUsernames.current.add(u));

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlayerData(unfetched);
        if (!data) { console.warn(`Failed to fetch rank data for ${unfetched.join(', ')}!`) };
        setPlayers(prev => [...prev, ...data]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [inGame, registeredPlayers]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!inGame ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full min-h-64 gap-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm font-semibold text-char">Not in a match</p>
            <p className="text-xs text-char-subtle">
              Waiting for you to queue into a game...
            </p>
          </motion.div>
        ) : loading ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full min-h-64 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 rounded-full border-[3px] border-surface-overlay border-t-primary animate-spin" />
            <p className="text-xs text-char-subtle">Fetching player data...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full min-h-64 gap-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm font-semibold text-error">Failed to load players</p>
            <p className="text-xs text-char-secondary">{error}</p>
          </motion.div>
        ) : (
          <motion.div
            className="max-w-2xl mx-auto space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {players
              .filter((player) => player?.playerId !== null)
              .map((player, index) => (
                <PlayerCard key={player.playerId} player={player} index={index} />
              ))}

            {players.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-char-subtle text-sm"
              >
                No player data available.
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}