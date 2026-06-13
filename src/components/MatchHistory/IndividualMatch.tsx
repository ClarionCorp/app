import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharName, getQueueName } from '../../core/objects/ody'
import { getRankFromLP } from '../../core/objects/ranks'
import clsx from 'clsx'
import { TeamListing } from './TeamListing'
import { getMapObjectFromID } from '../../core/objects/maps'
import { MatchHistoryTable } from '../../types/database'

function formatRelativeTime(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

export default function IndividualMatch({ row, myUsername }: { row: MatchHistoryTable; myUsername: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const myPlayer = row.players.find(p => p.name === myUsername)
  if (!myPlayer) return null

  const myTeamPlayers = row.players
    .filter(p => p.team === row.myTeam)
    .sort((a, b) => {
      if (a.role === 'Goalie' && b.role !== 'Goalie') return -1
      if (a.role !== 'Goalie' && b.role === 'Goalie') return 1
      if (a.name === myUsername) return -1
      if (b.name === myUsername) return 1
      return 0
    })

  const enemyTeamPlayers = row.players
    .filter(p => p.team !== row.myTeam)
    .sort((a, b) => {
      if (a.role === 'Goalie' && b.role !== 'Goalie') return -1
      if (a.role !== 'Goalie' && b.role === 'Goalie') return 1
      return 0
    })

  const minutes = Math.floor(row.duration / 60);
  const seconds = row.duration % 60;
  const durationDisplay = `${minutes}m ${seconds.toFixed(0)}s`;
  const mapObject = getMapObjectFromID(row.mapId);

  const ratings = row.players.map(p => p.rating).filter((r): r is number => r !== null && r !== 0);
  const avgRating = ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
  const avgRankData = avgRating != null ? getRankFromLP(avgRating) : null;
  const score = `${row.myTeam === 1 ? row.t1_sets : row.t2_sets} : ${row.myTeam === 1 ? row.t2_sets : row.t1_sets}`;

  return (
    <div
      className={clsx(
        'w-full rounded-lg border overflow-hidden relative min-w-0',
        row.wonGame
          ? 'bg-match-win/10 border-green-500/20'
          : 'bg-match-loss/10 border-red-500/20'
      )}
    >
      {/* Compact Summary */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-full px-4 py-3 cursor-pointer overflow-hidden shadow-lg">
        <img
          src={mapObject.image!}
          alt=""
          aria-hidden
          onError={(e) => console.error(`Failed to load map image at: ${mapObject.image}`, e)}
          className="absolute inset-0 w-full h-full object-cover opacity-10 brightness-65 pointer-events-none select-none"
        />
        <div className="flex items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Result + Queue badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={clsx(
                'px-3 py-1 rounded text-xs font-bold',
                row.wonGame ? 'bg-match-win/20 text-match-win' : 'bg-match-loss/20 text-match-loss'
              )}>
                {row.wonGame ? 'Victory' : 'Defeat'}
              </div>
            </div>

            {/* Character */}
            <img
              src={`/characters/portrait/${myPlayer.characterId}.webp`}
              alt={getCharName(myPlayer.characterId) ?? myPlayer.characterId}
              className="w-10 h-10 rounded object-cover shrink-0"
            />

            {/* Role */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-[10px] text-char-subtle">Role</span>
              <span className="text-xs font-semibold text-char">{myPlayer.role}</span>
            </div>

            {/* Key stats */}
            <div className="flex items-center gap-3 sm:gap-6 text-xs shrink-0">
              {myPlayer.role === 'Forward' ? (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-char-subtle">Goals</span>
                    <span className="font-semibold text-char">{myPlayer.goals}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-char-subtle">KOs</span>
                    <span className="font-semibold text-char">{myPlayer.kos}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-char-subtle">Saves</span>
                    <span className="font-semibold text-char">{myPlayer.saves}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-char-subtle">Assists</span>
                    <span className="font-semibold text-char">{myPlayer.assists}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs shrink-0">
            {/* Map */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-char-subtle">Map</span>
              <span className="font-semibold text-char">{mapObject.mapName}</span>
            </div>

            {/* Duration */}
            <div className="hidden sm:flex flex-col items-center gap-1">
              <span className="text-[10px] text-char-subtle">Duration</span>
              <span className="font-semibold text-char">{durationDisplay}</span>
            </div>

            {/* Avg Rank */}
            {avgRankData && (
              <div className="hidden sm:flex flex-col items-center gap-1">
                <span className="text-[10px] text-char-subtle">Avg Rank</span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 bg-contain bg-center bg-no-repeat shrink-0"
                    style={{ backgroundImage: `url('${avgRankData.image}')` }}
                  />
                  <span className="font-semibold text-char">{avgRankData.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-background-border overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-2 bg-surface-raised/20 grid grid-cols-3 items-center text-xs">
              <span className="flex items-baseline gap-2">
                <span className="text-char-subtle">{getQueueName(row.queue)} ({score})</span>
                {row.validated && (
                  <span className="text-[10px] text-match-win/70 font-medium">Validated with CC</span>
                )}
              </span>
              <div className="flex items-center justify-center gap-3 text-char-subtle">
                {row.bans.map(id => (
                  <div key={id} className="flex items-center gap-1.5">
                    <img
                      src={`/characters/portrait/${id}.webp`}
                      alt={getCharName(id) ?? id}
                      className="w-5 h-5 rounded object-cover grayscale opacity-75"
                    />
                    <span className="text-char-subtle/60">{getCharName(id) ?? id}</span>
                  </div>
                ))}
              </div>
              <span className="text-char-subtle text-right">Played {formatRelativeTime(row.createdAt)}</span>
            </div>

            {/* My team */}
            <div className="px-4 py-3 space-y-2">
              <div className="text-xs font-semibold text-char-subtle mb-2">Your Team</div>
              <div className="space-y-1">
                <TeamListing players={myTeamPlayers} myUsername={myUsername} />
              </div>
            </div>

            {/* Enemy team */}
            <div className="px-4 py-3 space-y-2 border-t border-background-border/50">
              <div className="text-xs font-semibold text-char-subtle mb-2">Enemy Team</div>
              <div className="space-y-1">
                <TeamListing players={enemyTeamPlayers} myUsername={myUsername} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
