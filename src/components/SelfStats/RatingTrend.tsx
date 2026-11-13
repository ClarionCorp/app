import { EmptyNote, Section } from './Cards'
import { RatingLine } from '../LiveMatch/OutOfGame/RatingChart'
import { RatingPoint } from '../../core/utilities/selfStats'

export default function RatingTrendSection({ points }: { points: RatingPoint[] | null }) {
  return (
    <Section title="Rating Trend">
      {points && points.length > 1 ? (
        <RatingLine
          values={points.map(p => p.rating)}
          labels={points.map(p => p.at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))}
        />
      ) : (
        <EmptyNote>Not enough ranked matches this season yet.</EmptyNote>
      )}
    </Section>
  )
}
