import { useEffect, useRef, useState } from 'react'
import { getMatchHistory, getUsers } from '../core/database/queries'
import { matchHistory } from '../core/database/schema'
import { UserTable } from '../types/database'
import { MAPS } from '../core/objects/maps'
import { QUEUES } from '../core/objects/queues'
import { characters } from '../core/objects/characters'
import { Dropdown, type DropdownItem } from '../components/UI/Dropdown'
import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
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
  const [users, setUsers] = useState<UserTable[]>([])
  const [loading, setLoading] = useState(true)
  const pageSize = 25;

  const [queueFilter, setQueueFilter] = useState<string | null>(null)
  const [mapFilter, setMapFilter] = useState<string | null>(null)
  const [accountFilter, setAccountFilter] = useState<string | null>(null)
  const [characterFilter, setCharacterFilter] = useState<string | null>(null)

  const [playerSearch, setPlayerSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const [history, allUsers] = await Promise.all([getMatchHistory(), getUsers()])
      setMatches([...history].reverse())
      setUsers([...allUsers].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1)))
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [queueFilter, mapFilter, accountFilter, characterFilter, playerSearch])

  const filtered = matches.filter(m => {
    if (queueFilter && m.queue !== queueFilter) return false
    if (mapFilter && m.mapId !== mapFilter) return false
    if (accountFilter !== null && m.playerId !== accountFilter) return false
    if (characterFilter && m.players.find(p => p.playerId === m.playerId)?.characterId !== characterFilter) return false
    if (playerSearch && !m.players.some(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))) return false
    return true
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount(c => c + pageSize) },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore])

  const showAccountFilter = users.length > 1
  const selectedUser = users.find(u => u.playerId === accountFilter)

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
          label={QUEUES.find(q => q.queueName === queueFilter)?.queueName ?? 'All Queues'}
          active={queueFilter !== null}
          onClear={() => setQueueFilter(null)}
          items={QUEUES.map(q => ({
            label: q.queueName,
            icon: <q.icon size={14} />,
            onClick: () => setQueueFilter(q.queueName === queueFilter ? null : q.queueName),
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

        <FilterButton
          label={characters.find(c => c.id === characterFilter)?.name ?? 'All Characters'}
          active={characterFilter !== null}
          onClear={() => setCharacterFilter(null)}
          items={characters.map(c => ({
            label: c.name,
            icon: <img src={`/characters/portrait/${c.id}.webp`} alt="" className="w-6 aspect-square rounded-full object-cover" />,
            onClick: () => setCharacterFilter(c.id === characterFilter ? null : c.id),
          }))}
        />

        {showAccountFilter && (
          <FilterButton
            label={selectedUser?.username ?? 'All Accounts'}
            active={accountFilter !== null}
            onClear={() => setAccountFilter(null)}
            items={users.map(u => ({
              label: u.username,
              onClick: () => setAccountFilter(u.playerId === accountFilter ? null : u.playerId),
            }))}
          />
        )}

        <span className="ml-auto text-xs text-char-subtle whitespace-nowrap">
          {filtered.length} match{matches.length !== 1 ? 'es' : ''}
        </span>

        <div className="relative">
          <MagnifyingGlassIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-char-subtle pointer-events-none" />
          <input
            type="text"
            value={playerSearch}
            onChange={e => setPlayerSearch(e.target.value)}
            placeholder="Search players..."
            className="pl-7 pr-7 py-1.5 text-xs rounded-lg border border-background-border bg-transparent text-char placeholder:text-char-subtle focus:outline-none focus:border-primary/40 w-44"
          />
          {playerSearch && (
            <button
              onClick={() => setPlayerSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-char-subtle hover:text-char transition-colors cursor-pointer"
            >
              <XIcon size={12} />
            </button>
          )}
        </div>
      </div>
      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <p className="text-sm text-char-subtle">No matches match the current filters.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map(match => (
              <IndividualMatch
                key={match.id}
                row={match}
                myPlayerId={match.playerId}
              />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-8" />}
        </>
      )}
    </div>
  )
}
