// Mostly just where RankChecker resides lol

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { CurrentMatchTable, MatchPlayersTable } from '../types/database';
import { getCurrentMatch, getMatchPlayers } from '../core/database/queries';
import { PlayerCard } from '../components/LiveMatch/PlayerCard';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};


export default function CurrentMatchPage() {
  const [loading, setLoading] = useState(true);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [match, setMatchData] = useState<CurrentMatchTable>();
  const [players, setPlayers] = useState<MatchPlayersTable[]>();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const matchDb = await getCurrentMatch();
        if (!matchDb) throw new Error('No active match found');
        setMatchData(matchDb);

        const playersDb = await getMatchPlayers();
        setPlayers(playersDb);
        setRetryMessage(null);
        setLoading(false);
      } catch (e) {
        setRetryMessage(e instanceof Error ? e.message : String(e));
        setTimeout(load, 2000);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center h-full min-h-64 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 rounded-full border-[3px] border-surface-overlay border-t-primary animate-spin" />
              <p className="text-xs text-white">
                {retryMessage ?? 'Fetching player data...'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className="max-w-2xl mx-auto space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {players && players.length > 0 ? (
                players.map((player, index) => (
                  <PlayerCard key={player.username} player={player} index={index} />
                ))
              ) : (
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
        </AnimatePresence>
      </div>
    </div>
  );
}
