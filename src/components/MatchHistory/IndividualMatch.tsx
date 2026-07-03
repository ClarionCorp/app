import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharName, getQueueName } from '../../core/objects/ody'
import { CheckIcon } from '@phosphor-icons/react'
import { getRankFromLP } from '../../core/objects/ranks'
import clsx from 'clsx'
import { TeamListing } from './TeamListing'
import BasicPopover from '../UI/BasicPopover'
import { getMapObjectFromID } from '../../core/objects/maps'
import { MatchHistoryTable } from '../../types/database'
import { Button } from '../UI/Button'
import { TimelineModal } from './TimelineModal'

function formatRelativeTime(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

export default function IndividualMatch({ row, myPlayerId }: { row: MatchHistoryTable; myPlayerId: string | null }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)

  const myPlayer = row.players.find(p => p.playerId === myPlayerId)
  if (!myPlayer) return null

  const myUsername = myPlayer.name
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
  const hasTimelineData = (row.timeline ?? []).length > 0 || myTeamPlayers.some(p => (p.xpGoals ?? []).length > 0)

  const myPts = row.myTeam === 1 ? row.t1_pts : row.t2_pts;
  const enemyPts = row.myTeam === 1 ? row.t2_pts : row.t1_pts;
  const mySets = row.myTeam === 1 ? row.t1_sets : row.t2_sets;
  const enemySets = row.myTeam === 1 ? row.t2_sets : row.t1_sets;

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
            <div className="px-4 py-2 bg-surface-raised/10 grid grid-cols-3 items-center text-xs">
              {/* Bans */}
              <div className="flex items-center gap-2">
                {row.bans.map(id => (
                  <BasicPopover key={id} displayText={`Banned ${getCharName(id) ?? id}`}>
                    <img
                      src={`/characters/portrait/${id}.webp`}
                      alt={getCharName(id) ?? id}
                      className="w-8 h-8 rounded object-cover grayscale opacity-75"
                    />
                  </BasicPopover>
                ))}
              </div>

              {/* Score */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2">
                  {/* My team set ticks (blue) */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-3.5 rounded-sm -skew-x-8 ${i >= 3 - mySets ? 'bg-match-ally' : 'bg-match-ally/20'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-match-ally leading-none">{myPts}</span>
                    <span className="text-char-subtle/60 text-sm leading-none">|</span>
                    <span className="text-lg font-bold text-match-enemy leading-none">{enemyPts}</span>
                  </div>
                  {/* Enemy set ticks (red) */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-3.5 rounded-sm skew-x-8 ${i < enemySets ? 'bg-match-enemy' : 'bg-match-enemy/20'}`} />
                    ))}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-char-subtle">
                  {getQueueName(row.queue)}
                  {row.validated && (
                    <BasicPopover displayText="Validated with CC">
                      <CheckIcon size={10} weight="bold" className="text-match-win/70" />
                    </BasicPopover>
                  )}
                </span>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-char-subtle">Played {formatRelativeTime(row.createdAt)}</span>
                <span className="text-char-subtle/75 text-[10px]">
                  {row.createdAt.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {' @ '}
                  {row.createdAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* My team */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-char-subtle">Your Team</div>
                {hasTimelineData && <Button variant="secondary-ghost" size="sm" onClick={() => setTimelineModalOpen(true)}>View Timeline</Button>}
              </div>
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
      <TimelineModal open={timelineModalOpen} onClose={() => setTimelineModalOpen(false)} players={row.players} timeline={row.timeline ?? []} myTeam={row.myTeam} myPlayerId={myPlayerId} />
    </div>
  )
}
