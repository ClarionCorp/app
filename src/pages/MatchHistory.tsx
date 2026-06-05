import { useEffect, useRef, useState } from 'react'
import { getMatchHistory, getUser, updateMatchHistoryUsername } from '../core/database/queries'
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
  const pageSize = 25;

  const [queueFilter, setQueueFilter] = useState<string | null>(null)
  const [mapFilter, setMapFilter] = useState<string | null>(null)
  const [usernameFilter, setUsernameFilter] = useState<string | null>(null)
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([])

  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const [history, user] = await Promise.all([getMatchHistory(), getUser()])
      const reversed = [...history].reverse()

      if (user) {
        const updates: Promise<unknown>[] = []
        for (const m of reversed) {
          if (m.username === null && m.players.some(p => p.name === user.username)) {
            m.username = user.username
            updates.push(updateMatchHistoryUsername(m.id, user.username))
          }
        }
        if (updates.length > 0) await Promise.all(updates)
      }

      setMatches(reversed)
      setMyUsername(user?.username ?? null)

      const counts = new Map<string, number>()
      for (const m of reversed) {
        if (m.username !== null) counts.set(m.username, (counts.get(m.username) ?? 0) + 1)
      }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u)
      setUniqueUsernames(sorted)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [queueFilter, mapFilter, usernameFilter])

  const filtered = matches.filter(m => {
    if (queueFilter && m.queue !== queueFilter) return false
    if (mapFilter && m.mapId !== mapFilter) return false
    if (usernameFilter !== null && m.username !== null && m.username !== usernameFilter) return false
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

  const showUsernameFilter = uniqueUsernames.length > 1

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

        {showUsernameFilter && (
          <FilterButton
            label={usernameFilter ?? 'Select Account'}
            active={usernameFilter !== null}
            onClear={() => setUsernameFilter(null)}
            items={uniqueUsernames.map(u => ({
              label: u,
              onClick: () => setUsernameFilter(u === usernameFilter ? null : u),
            }))}
          />
        )}

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
        <>
          <div className="space-y-3">
            {visible.map(match => (
              <IndividualMatch
                key={match.id}
                row={match}
                myUsername={match.username ?? myUsername ?? ''}
              />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} className="h-8" />}
        </>
      )}
    </div>
  )
}
