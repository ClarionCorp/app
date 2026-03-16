import { motion } from 'framer-motion';
import { RankedQuery } from '../types/odyssey';
import { getRankFromLP } from '../core/utilities/ranks';
import RankIcon from './Rank';
import { ShieldIcon, SwordIcon } from '@phosphor-icons/react';
import { openUrl } from '@tauri-apps/plugin-opener';

interface PlayerCardProps {
  player: RankedQuery;
  index: number;
}

export function PlayerCard({ player, index }: PlayerCardProps) {
  const nearbyRanks = getRankFromLP(player.rating);
  const rankInfo = nearbyRanks.rankObject;
  const winRate = player.games > 0
    ? ((player.wins / player.games) * 100).toFixed(1)
    : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
    >
      <button
        onClick={() => openUrl(`https://clarioncorp.net/pilot/${player.username}`)}
        className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          {/* Rank icon */}
          <div className="shrink-0">
            <RankIcon rating={player.rating} size="lg" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
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
                title={`${player.topRole} Main`}
              >
                {player.topRole === 'Forward'
                  ? <SwordIcon size={16} weight="duotone" />
                  : <ShieldIcon size={16} weight="duotone" />}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>
                <span className="text-zinc-300 font-medium">{player.rating}</span> LP
              </span>
              <span>
                Rank <span className="text-zinc-300 font-medium">#{player.rank.toLocaleString()}</span>
              </span>
              <span>
                <span className="text-zinc-300 font-medium">{winRate}%</span> WR
              </span>
              <span>
                <span className="text-zinc-300 font-medium">{player.games}</span> games
              </span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
