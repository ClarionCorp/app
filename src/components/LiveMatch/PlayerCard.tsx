import { motion } from 'framer-motion';
import { getRankFromLP } from '../../core/objects/ranks';
import RankIcon from '../Rank';
import { ShieldIcon, SwordIcon } from '@phosphor-icons/react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { CurrentMatchTable, MatchPlayersTable } from '../../types/database';
import { getGameStatus } from '../../core/objects/gameStates';


export function PlayerCard({ player, match, index, isBlue = false }: { player: MatchPlayersTable, match: CurrentMatchTable | undefined, index: number, isBlue?: boolean }) {
  const rankInfo = getRankFromLP(player.rating);
  // const winRate = player.games > 0
  //   ? ((player.wins / player.games) * 100).toFixed(1)
  //   : '0.0';

  // We need to make sure the game has either started or isn't going
  const charName = match && getGameStatus(match.gameState) !== 'STARTING' ? (player.charName ?? '—') : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
    >
      <button
        onClick={() => openUrl(`https://clarioncorp.net/pilot/${player.username}`)}
        title='Click to open profile on ClarionCorp'
        className={`relative w-full text-left bg-surface border rounded-xl p-4 transition-colors cursor-pointer group shadow-xl overflow-hidden ${
          isBlue
            ? 'border-blue-500/30 hover:border-blue-500/50'
            : 'border-background-border hover:border-primary/20'
        }`}
      >
        {/* Background character watermark */}
        {/* We need to make sure the game has either started or isn't going */}
        {player.charId && match && getGameStatus(match.gameState) !== 'STARTING' && (
          <>
            <img
              src={`/characters/goalscore/${player.charId}.webp`}
              alt=""
              aria-hidden
              className="absolute right-0 top-[-20%] h-[200%] aspect-square object-cover opacity-20 pointer-events-none select-none"
            />
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-full pointer-events-none select-none"
              style={{ background: 'linear-gradient(to right, var(--color-surface) 70%, transparent 90%)' }}
            />
          </>
        )}

        <div className="relative flex items-center gap-4">
          {/* Rank icon */}
          <div className="shrink-0">
            <RankIcon rating={player.rating ?? 0} size="lg" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white truncate">
                {player.username}
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-md shrink-0"
                style={{
                  color: rankInfo.color,
                  backgroundColor: `${rankInfo.color}1A`,
                  border: `1px solid ${rankInfo.color}30`,
                }}
              >
                {rankInfo.name}
              </span>
              <span
                className="text-zinc-500 shrink-0"
                title={`${player.role}`}
              >
                {player.role === 'Forward'
                  ? <SwordIcon size={16} weight="duotone" />
                  : <ShieldIcon size={16} weight="duotone" />}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>
                Playing: <span className="text-zinc-300 font-medium">{charName}</span>
              </span>
              <span>
                Rating: <span className="text-zinc-300 font-medium">{player.rating}</span>
              </span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}