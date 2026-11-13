import { Section, WinRateBar } from './Cards'
import { getMapObjectFromID } from '../../core/objects/maps'
import { MapTotals, winRate } from '../../core/utilities/selfStats'

export default function MapsSection({ maps }: { maps: MapTotals[] }) {
  return (
    <Section title="Top Maps">
      <div className="space-y-3">
        {maps.filter(m => getMapObjectFromID(m.mapId).category === 'Normal').map(m => {
          const map = getMapObjectFromID(m.mapId)
          const wr = winRate(m.wins, m.games)
          return (
            <div key={m.mapId} className="flex items-center gap-3 min-w-0">
              {map.iconImg
                ? <img src={map.iconImg} alt="" className="w-9 h-9 object-contain shrink-0" />
                : <map.icon size={28} className="w-9 text-char-subtle shrink-0" />}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-char truncate">{map.mapName}</span>
                  <span className="text-xs text-char-subtle tabular-nums shrink-0">{wr}% WR</span>
                </div>
                <WinRateBar percent={wr} />
              </div>

              <div className="w-12 shrink-0 text-right">
                <p className="text-xl font-bold text-char tabular-nums leading-none">{m.games}</p>
                <p className="text-[10px] uppercase tracking-wider text-char-subtle">games</p>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
