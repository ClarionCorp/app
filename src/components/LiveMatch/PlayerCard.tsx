import { motion } from 'framer-motion';
import { getRankFromLP } from '../../core/objects/ranks';
import RankIcon from '../Rank';
import { ShieldIcon, SwordIcon, WarningIcon } from '@phosphor-icons/react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { CurrentMatchTable, MatchPlayersTable } from '../../types/database';
import { getGameStatus } from '../../core/objects/gameStates';
import { TRAININGS } from '../../core/objects/trainings';
import { getPlayerChar } from '../../core/database/queries';
import { PlaystyleType } from '../../types/clarion';
import clsx from 'clsx';
import BasicPopover from '../UI/BasicPopover';
import { getQueueObjectFromID } from '../../core/objects/queues';

const PLAYSTYLE_CLASSES: Record<Exclude<PlaystyleType, 'Generic Forward' | 'Generic Goalie'>, string> = {
  'Brawler': 'text-match-brawler',
  'Midfielder': 'text-match-midfielder',
  'Hard Forward': 'text-match-hardfwd',
  'Offensive Goalie': 'text-match-offgoalie',
  'Defensive Goalie': 'text-match-defgoalie',
};


export function PlayerCard({ player, match, index, isBlue = false }: { player: MatchPlayersTable, match: CurrentMatchTable | undefined, index: number, isBlue?: boolean }) {
  const rankInfo = getRankFromLP(player.rating);
  // const winRate = player.games > 0
  //   ? ((player.wins / player.games) * 100).toFixed(1)
  //   : '0.0';

  const borderClass = player.isMe
    ? 'border-blue-500/30 hover:border-blue-500/50'
    : isBlue
      ? 'border-background-border hover:border-blue-500/50'
      : 'border-background-border hover:border-primary/20';

  const queue = getQueueObjectFromID(match?.queue).queueName;
  const charQueue: 'Normal' | 'Ranked' = queue === 'Ranked' || queue === 'Customs' ? 'Ranked' : 'Normal';
  const games = charQueue === 'Normal' ? player.normGames : player.rankedGames;
  const winrate = charQueue === 'Normal' ? player.normWR : player.rankedWR;
  const bestChar = getPlayerChar(player.bestChar, player.role, charQueue);
  const favChar = getPlayerChar(player.favChar, player.role, charQueue);
  const roleKey = (player.role?.toLowerCase() ?? null) as 'forward' | 'goalie' | null;
  const playstyleType = roleKey ? player.playstyle?.[roleKey]?.type : undefined;
  const playstyleClass = playstyleType && playstyleType in PLAYSTYLE_CLASSES
    ? PLAYSTYLE_CLASSES[playstyleType as keyof typeof PLAYSTYLE_CLASSES]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
    >
      <button
        onClick={() => openUrl(`https://clarioncorp.net/pilot/${player.username}`)}
        title='Click to open profile on ClarionCorp'
        className={`relative w-full text-left bg-surface border rounded-xl px-4 py-4 short:py-2 transition-colors cursor-pointer group shadow-xl overflow-hidden ${borderClass}`}
      >
        {/* Background character watermark */}
        {/* We need to make sure the game isn't in the setup phase */}
        {player.charId && match && getGameStatus(match.gameState) !== 'SETUP' && (
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
          <div className="flex-1 min-w-0 space-y-1.5 short:space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-char truncate">
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
                className={clsx(
                  'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md shrink-0 border border-current/20 bg-current/5',
                  playstyleClass ?? 'text-char-secondary'
                )}
              >
                {player.role === 'Forward'
                  ? <SwordIcon size={12} weight="duotone" />
                  : <ShieldIcon size={12} weight="duotone" />}
                {(playstyleType ?? player.role)?.replace('Generic ', '')}
              </span>
              {player.charId && (
                bestChar?.characterId === player.charId
                  ? <span className="text-xs font-medium text-purple-400">Playing Best Striker</span>
                  : favChar?.characterId === player.charId
                    ? <span className="text-xs font-medium text-blue-400">Playing Main Striker</span>
                    : null
              )}
              {player.smurfProbability !== 'none' && (
                <BasicPopover displayText={`Possible Smurf Detected! (${player.smurfProbability.toLocaleUpperCase()})`}>
                  <WarningIcon
                    size={14}
                    weight="duotone"
                    className={
                      player.smurfProbability === 'high' ? 'text-red-500'
                      : player.smurfProbability === 'medium' ? 'text-orange-400'
                      : 'text-yellow-400'
                    }
                  />
                </BasicPopover>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-char-secondary">
              <span>
                Rating: <span className="text-char-subtle font-medium">{player.rating}</span>
              </span>
              <span>
                Games: <span className="text-char-subtle font-medium">{games == null ? '—' : games}</span>
              </span>
              <span>
                Winrate: <span className={
                  `font-medium
                  ${winrate == null ? 'text-char-subtle'
                    : winrate >= 0.6 ? 'text-match-win'
                    : winrate <= 0.4 ? 'text-match-loss'
                    : 'text-match-mid'}
                  `}>
                  {winrate == null ? '—' : `${(winrate * 100).toFixed(0)}%`
                  }</span>
              </span>
              <span>
                Current KOs: <span className="text-char/80 font-medium">{player.knockouts == null ? '—' : player.knockouts}</span>
              </span>
            </div>

            {/* Training icons */}
            {player.trainings.length > 0 && (
              <div className="flex items-center gap-1 pl-0.5">
                {player.trainings.slice(0, 5).map(id => {
                  const training = TRAININGS[id];
                  if (!training) return null;
                  return (
                    <img
                      key={id}
                      src={training.image}
                      alt={training.name}
                      title={training.name}
                      className="w-7 h-7 rounded"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}