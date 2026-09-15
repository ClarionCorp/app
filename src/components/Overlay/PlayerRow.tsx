import { LiveMatchPlayer } from '../../core/overlay'
import RankIcon from '../Rank'
import { TRAININGS } from '../../core/objects/trainings'

// Fixed width (in characters) for the username cell.
// Capping this instead of sizing to the longest name keeps the training icons aligned
// across rows without needing to measure every username on the roster.
const USERNAME_WIDTH_CH = 10

export default function PlayerRow({
  player,
  showRank,
  showTrainings,
  reverse = false,
}: {
  player: LiveMatchPlayer
  showRank: boolean
  showTrainings: boolean
  reverse?: boolean
}) {
  const resolvedTrainings = player.trainings
    .map((id) => ({ id, info: TRAININGS[id] }))
    .filter((t): t is { id: string; info: NonNullable<typeof t.info> } => Boolean(t.info))

  const gear = resolvedTrainings.filter((t) => t.info.gear)
  const regular = resolvedTrainings.filter((t) => !t.info.gear)

  return (
    <div className={`flex items-center gap-2 ${reverse ? 'flex-row-reverse' : ''}`}>
      {showRank && <RankIcon rating={player.rating} size="sm" />}
      <span
        className={`text-white font-semibold truncate ${reverse ? 'text-right' : 'text-left'}`}
        style={{ width: `${USERNAME_WIDTH_CH}ch` }}
        title={player.username}
      >
        {player.username}
      </span>
      {showTrainings && (gear.length > 0 || regular.length > 0) && (
        <div className={`flex gap-0 ${reverse ? 'flex-row-reverse' : ''}`}>
          {gear.length > 0 && (
            <div className="flex">
              {gear.map((t) => (
                <img key={t.id} src={t.info.image} alt={t.info.name} title={t.info.name} className="w-7 h-7 rounded" />
              ))}
            </div>
          )}
          {regular.length > 0 && (
            <div className="flex">
              {regular.map((t) => (
                <img key={t.id} src={t.info.image} alt={t.info.name} title={t.info.name} className="w-7 h-7 rounded" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
