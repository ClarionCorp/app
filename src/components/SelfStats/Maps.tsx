import { Section, WinRateBar } from './Cards'
import { getMapObjectFromID } from '../../core/objects/maps'
import { MapTotals, winRate } from '../../core/utilities/selfStats'

export default function MapsSection({ maps }: { maps: MapTotals[] }) {
  return (
    <Section title="Maps">
      <div className="space-y-2.5">
        {maps.map(m => {
          const map = getMapObjectFromID(m.mapId)
          const wr = winRate(m.wins, m.games)
          return (
            <div key={m.mapId} className="min-w-0">
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <span className="flex items-center gap-1.5 text-char truncate">
                  <map.icon size={13} className="text-char-subtle shrink-0" />
                  <span className="truncate">{map.mapName}</span>
                </span>
                <span className="text-char-subtle tabular-nums shrink-0">{m.games} · {wr}%</span>
              </div>
              <WinRateBar percent={wr} />
            </div>
          )
        })}
      </div>
    </Section>
  )
}
