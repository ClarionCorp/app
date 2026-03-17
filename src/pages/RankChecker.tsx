import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../App';
import { PlayerCard } from '../components/PlayerCard';
import { OdyAuth, RankedQuery } from '../types/odyssey';
import { getPhaseGroup } from '../core/logMonitor';
import { rankQuery, usernameQuery } from '../core/utilities/odyssey';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

async function fetchPlayerData(usernames: string[], auth: OdyAuth): Promise<RankedQuery[]> {
  console.debug(`Fetching ${usernames.length} users...`);
  const results = await Promise.allSettled(
    usernames.map(async (username) => {
      const user = await usernameQuery(username, auth);
      if (!user) return;
      const ranked = await rankQuery(user.playerId, auth);
      if (!ranked) return;
      return ranked;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<RankedQuery> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export default function RankCheckerPage() {
  const { matchPhase, registeredPlayers, odyAuth } = useOutletContext<AppContextType>();
  const [players, setPlayers] = useState<RankedQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.info(`Pre-Registered Players:`, registeredPlayers.join(', '))

  const inLobby = matchPhase
    ? ['starting', 'in_game'].includes(getPhaseGroup(matchPhase))
    : false;

  useEffect(() => {
    if (!inLobby || registeredPlayers.length === 0) return;
    console.info(`Registered Players:`, registeredPlayers.join(', '))

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlayerData(registeredPlayers, odyAuth);
        if (!cancelled) setPlayers(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [inLobby, registeredPlayers]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!inLobby ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full min-h-64 gap-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm font-semibold text-char">Not in a game</p>
            <p className="text-xs text-char-subtle">
              Waiting for you to join a lobby...
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
            {players.map((player, index) => (
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