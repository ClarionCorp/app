import { EmptyNote, Section } from './Cards'
import { TeammateTotals, winRate } from '../../core/utilities/selfStats'

export default function TeammatesSection({ teammates }: { teammates: TeammateTotals[] }) {
  return (
    <Section title="Frequent Teammates">
      {teammates.length === 0 ? (
        <EmptyNote>Play a few more games with the same people to see them here.</EmptyNote>
      ) : (
        <div className="divide-y divide-surface-border/50">
          {teammates.map(t => {
            const wr = winRate(t.wins, t.games)
            return (
              <div key={t.key} className="flex items-center justify-between gap-2 py-1.5 text-xs">
                <span className="text-char truncate">{t.name}</span>
                <span className="text-char-subtle tabular-nums shrink-0">
                  {t.games} games · <span className={wr >= 50 ? 'text-match-win' : 'text-match-loss'}>{wr}%</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}
