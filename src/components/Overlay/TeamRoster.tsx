import { LiveMatchPlayer } from '../../core/overlay'
import PlayerRow from './PlayerRow'

export default function TeamRoster({
  players,
  showRanks,
  showTrainings,
  reverse = false,
}: {
  players: LiveMatchPlayer[]
  showRanks: boolean
  showTrainings: boolean
  reverse?: boolean
}) {
  if (!showRanks && !showTrainings) return null;

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-black/80 border-white/10 px-4 py-2 w-fit shadow-xl ${
        reverse ? 'items-end' : 'items-start'
      }`}
    >
      {players.map((player) => (
        <PlayerRow
          key={player.playerId}
          player={player}
          showRank={showRanks}
          showTrainings={showTrainings}
          reverse={reverse}
        />
      ))}
    </div>
  )
}
