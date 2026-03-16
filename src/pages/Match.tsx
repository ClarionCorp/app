import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { PlayerCard } from '../components/PlayerCard';
import { openUrl } from '@tauri-apps/plugin-opener';
import { AppContextType } from '../App';
import { getLogPath, readNewLines, parseMatchPhase } from '../core/utilities/logMonitor';
import { version } from '../core/constants';

export function MatchPage() {
  const { playerData, navigate } = useOutletContext<AppContextType>();
  const navigatedRef = useRef(false);

  // Watch for game end and auto-return to monitor
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function init() {
      const path = await getLogPath();

      intervalId = setInterval(async () => {
        if (navigatedRef.current) return;

        const lines = await readNewLines(path);
        for (const line of lines) {
          const phase = parseMatchPhase(line);
          if (phase === 'EMatchPhase::PostGameCelebration') {
            navigatedRef.current = true;
            clearInterval(intervalId);
            navigate('/monitor');
            return;
          }
        }
      }, 500);
    }

    init();
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-45 bg-violet-700/8 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center px-6 py-5 border-b border-zinc-900">
        <h1 className="text-sm font-semibold text-white">Match Players</h1>
        <p className="text-xs text-zinc-600">{playerData.length} players found</p>
      </div>

      {/* Player list */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-2xl mx-auto space-y-3">
          {playerData.map((player, index) => (
            <PlayerCard key={player.playerId} player={player} index={index} />
          ))}

          {playerData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-zinc-600 text-sm"
            >
              No player data available.
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 grid grid-cols-3 items-center px-6 py-4 border-t border-zinc-900 text-xs text-zinc-600"
      >
        <button
          onClick={() => openUrl('https://github.com/WWYDF/Rankchecker')}
          className="hover:text-zinc-400 transition-colors cursor-pointer justify-self-start"
        >
          v{version}
        </button>
        <span className="text-zinc-700 text-center">Waiting for game to end...</span>
        <div />
      </motion.div>
    </div>
  );
}
