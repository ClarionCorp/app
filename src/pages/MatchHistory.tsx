import { useEffect, useRef, useState } from 'react'
import { getMatchHistory, getUser } from '../core/database/queries'
import { matchHistory } from '../core/database/schema'
import { MAPS } from '../core/objects/maps'
import { QUEUES } from '../core/objects/queues'
import { Dropdown, type DropdownItem } from '../components/UI/Dropdown'
import { CaretDownIcon, XIcon } from '@phosphor-icons/react'
import IndividualMatch from '../components/MatchHistory/IndividualMatch'

type MatchHistoryRow = typeof matchHistory.$inferSelect

function FilterButton({
  label,
  active,
  onClear,
  items,
}: {
  label: string
  active: boolean
  onClear: () => void
  items: DropdownItem[]
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
          active ? 'border-primary/40 bg-primary/10' : 'border-background-border'
        }`}
      >
        <span className={active ? 'text-char' : 'text-char-subtle'}>{label}</span>
        {active ? (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="text-char-subtle hover:text-char transition-colors"
          >
            <XIcon size={12} />
          </span>
        ) : (
          <CaretDownIcon size={12} className="text-char-subtle" />
        )}
      </button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        items={items}
      />
    </div>
  )
}

export default function MatchHistoryPage() {
  const [matches, setMatches] = useState<MatchHistoryRow[]>([])
  const [myUsername, setMyUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [queueFilter, setQueueFilter] = useState<string | null>(null)
  const [mapFilter, setMapFilter] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [history, user] = await Promise.all([getMatchHistory(), getUser()])
      setMatches([...history].reverse())
      setMyUsername(user?.username ?? null)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = matches.filter(m => {
    if (queueFilter && m.queue !== queueFilter) return false
    if (mapFilter && m.mapId !== mapFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-[3px] border-surface-overlay border-t-primary animate-spin" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-sm text-char-subtle">No matches recorded yet.</p>
        <p className="text-xs text-char-subtle">Play a game with the app open to start tracking.</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <FilterButton
          label={QUEUES.find(q => q.queueId === queueFilter)?.queueName ?? 'All Queues'}
          active={queueFilter !== null}
          onClear={() => setQueueFilter(null)}
          items={QUEUES.map(q => ({
            label: q.queueName,
            icon: <q.icon size={14} />,
            onClick: () => setQueueFilter(q.queueId === queueFilter ? null : q.queueId),
          }))}
        />

        <FilterButton
          label={MAPS.find(m => m.mapId === mapFilter)?.mapName ?? 'All Maps'}
          active={mapFilter !== null}
          onClear={() => setMapFilter(null)}
          items={MAPS.map(m => ({
            label: m.mapName,
            icon: <m.icon size={14} />,
            onClick: () => setMapFilter(m.mapId === mapFilter ? null : m.mapId),
          }))}
        />

        <span className="text-xs text-char-subtle ml-auto">
          {filtered.length} of {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <p className="text-sm text-char-subtle">No matches match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(match => (
            <IndividualMatch
              key={match.id}
              row={match}
              myUsername={myUsername ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}
