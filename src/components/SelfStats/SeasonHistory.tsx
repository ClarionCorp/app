import { CrownIcon } from '@phosphor-icons/react'
import { ApiPlaceholder, Section } from './Cards'
import RankIcon from '../Rank'
import { getRankFromLP } from '../../core/objects/ranks'
import { PlayerSeason } from '../../types/clarion'

export default function SeasonHistorySection({ seasons }: { seasons: PlayerSeason[] | null }) {
  return (
    <Section title="Season History" action={<CrownIcon size={14} className="text-char-subtle" />}>
      {seasons && seasons.length > 0 ? (
        <div className="divide-y divide-surface-border/50">
          {seasons.map(s => (
            <div key={s.season} className="flex items-center gap-2 py-1.5 text-xs min-w-0">
              <span className="text-char-subtle w-16 shrink-0">Season {s.season}</span>
              <RankIcon rating={s.peakRating} size="xs" />
              <span className="text-char truncate flex-1">{getRankFromLP(s.peakRating).name}</span>
              <span className="text-char-subtle tabular-nums shrink-0">Peak {s.peakRating} · Final {s.finalRating}</span>
            </div>
          ))}
        </div>
      ) : (
        <ApiPlaceholder label="Season history coming soon" />
      )}
    </Section>
  )
}
