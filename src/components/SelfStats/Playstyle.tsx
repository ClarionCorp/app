import { ApiPlaceholder, Section, StatTile } from './Cards'
import { Playstyle } from '../../types/clarion'

export default function PlaystyleSection({ playstyle }: { playstyle: Playstyle | null }) {
  return (
    <Section title="Playstyle">
      {playstyle ? (
        <div className="grid grid-cols-2 gap-2">
          {/* TODO: Render playstyle breakdown once the API shape is final */}
          <StatTile label="Forward" value="—" />
          <StatTile label="Goalie" value="—" />
        </div>
      ) : (
        <ApiPlaceholder label="Playstyle analysis coming soon" />
      )}
    </Section>
  )
}
