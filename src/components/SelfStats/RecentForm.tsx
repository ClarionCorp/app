import clsx from 'clsx'
import { Section } from './Cards'

export default function RecentFormSection({ results }: { results: boolean[] }) {
  return (
    <Section title="Recent Form" action={<span className="text-[10px] text-char-subtle">Newest →</span>}>
      <div className="grid grid-cols-10 gap-1">
        {results.map((won, i) => (
          <div
            key={i}
            title={won ? 'Win' : 'Loss'}
            className={clsx(
              'h-6 rounded flex items-center justify-center text-[10px] font-bold',
              won ? 'bg-match-win/20 text-match-win' : 'bg-match-loss/20 text-match-loss'
            )}
          >
            {won ? 'W' : 'L'}
          </div>
        ))}
      </div>
    </Section>
  )
}
