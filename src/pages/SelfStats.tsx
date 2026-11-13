import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { CaretDownIcon, CheckIcon, UserSwitchIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { getAppSettings, getMatchHistory, getUsers } from '../core/database/queries'
import { MatchHistoryTable, UserTable } from '../types/database'
import { getRankFromLP } from '../core/objects/ranks'
import { getRegionObjectFromOdyRegion } from '../core/objects/regions'
import RankIcon from '../components/Rank'
import { Dropdown } from '../components/UI/Dropdown'
import { EmptyNote, Section, sectionVariants } from '../components/SelfStats/Cards'
import OverviewSection from '../components/SelfStats/Overview'
import RecentOutcomesSection from '../components/SelfStats/RecentOutcomes'
import RatingTrendSection from '../components/SelfStats/RatingTrend'
import RolesSection from '../components/SelfStats/Roles'
import TopCharactersSection from '../components/SelfStats/TopCharacters'
import MapsSection from '../components/SelfStats/Maps'
import TeammatesSection from '../components/SelfStats/Teammates'
import {
  computeSelfStats,
  fetchLeaderboardStanding,
  fetchRatingHistory,
  filterMatches,
  LeaderboardStanding,
  RatingPoint,
  StatsQueueFilter,
  StatsTimeFilter,
} from '../core/utilities/selfStats'

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

function Segmented<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-background-border p-0.5">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={clsx(
            'px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer',
            o === value ? 'bg-primary/15 text-char' : 'text-char-subtle hover:text-char'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function AccountPicker({ users, selected, onSelect }: { users: UserTable[]; selected: UserTable; onSelect: (u: UserTable) => void }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-bl-2xl bg-background text-sm font-semibold text-char-subtle hover:text-primary transition-colors cursor-pointer"
      >
        <UserSwitchIcon size={18} weight="bold" />
        Switch Account
        <CaretDownIcon size={14} weight="bold" className={clsx('transition-transform', open && 'rotate-180')} />
      </button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        items={users.map(u => ({
          label: u.username,
          icon: u.playerId === selected.playerId ? <CheckIcon size={12} /> : undefined,
          onClick: () => { onSelect(u); setOpen(false) },
        }))}
      />
    </div>
  )
}

export default function SelfStatsPage() {
  const [matches, setMatches] = useState<MatchHistoryTable[]>([])
  const [users, setUsers] = useState<UserTable[]>([])
  const [selectedUser, setSelectedUser] = useState<UserTable | null>(null)
  const [customImgs, setCustomImgs] = useState(true)
  const [loading, setLoading] = useState(true)

  const [queueFilter, setQueueFilter] = useState<StatsQueueFilter>('All')
  const [timeFilter, setTimeFilter] = useState<StatsTimeFilter>('All')

  // API-backed (placeholders until endpoints exist)
  const [ratingHistory, setRatingHistory] = useState<RatingPoint[] | null>(null)
  const [standing, setStanding] = useState<LeaderboardStanding | null>(null)

  useEffect(() => {
    async function load() {
      const [history, allUsers, settings] = await Promise.all([getMatchHistory(), getUsers(), getAppSettings()])
      setMatches([...history].reverse())
      setUsers(allUsers)
      setSelectedUser(allUsers.find(u => u.active) ?? allUsers[0] ?? null)
      if (settings) setCustomImgs(settings.useCustomCharArt)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedUser) return
    const id = selectedUser.playerId
    fetchRatingHistory(id).then(setRatingHistory)
    fetchLeaderboardStanding(id).then(setStanding)
  }, [selectedUser])

  const stats = useMemo(
    () => computeSelfStats(filterMatches(matches, selectedUser?.playerId ?? null, queueFilter, timeFilter)),
    [matches, selectedUser, queueFilter, timeFilter]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-[3px] border-surface-overlay border-t-primary animate-spin" />
      </div>
    )
  }

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 px-4 text-center">
        <p className="text-sm text-char-subtle">No account found.</p>
        <p className="text-xs text-char-subtle">Log in to the game with the app open to see your stats.</p>
      </div>
    )
  }

  const rank = getRankFromLP(selectedUser.rating)
  const region = getRegionObjectFromOdyRegion(selectedUser.matchmakingRegion)
  const hasGames = stats.games > 0

  return (
    <motion.div
      className="px-4 py-5 w-full space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Profile header */}
      <motion.section
        variants={sectionVariants}
        className="relative bg-surface-subtle rounded-xl overflow-hidden min-w-0"
      >
        <img
          src={`https://api.clarioncorp.net/assets/nameplate/${selectedUser.nameplateId}.webp`}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-20 brightness-50 pointer-events-none select-none"
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none select-none"
          style={{ background: 'linear-gradient(to bottom, transparent 10%, var(--color-surface-subtle) 100%)' }}
        />

        {users.length > 1 && (
          <div className="absolute top-0 right-0 z-10">
            <AccountPicker users={users} selected={selectedUser} onSelect={setSelectedUser} />
          </div>
        )}

        <div className="relative flex items-end gap-4 min-w-0 px-5 pb-5 pt-12">
          <RankIcon rating={selectedUser.rating ?? 0} size="2xl" />
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-3xl font-extrabold text-char truncate leading-tight">{selectedUser.username}</p>
            <p className="text-base text-char-subtle truncate">
              <span style={{ color: rank.color }} className="font-bold">{rank.name}</span>
              {selectedUser.rating != null && <> ({selectedUser.rating} LP)</>}
            </p>
            <p className="text-xs text-char-subtle truncate mt-0.5">
              Mastery {selectedUser.masteryLevel} · {region.name}
            </p>
          </div>
          <div className="shrink-0 text-right pb-1">
            {/* TODO: Remove the hardcoded fallback once fetchLeaderboardStanding is wired up */}
            <p className="text-4xl font-black text-char tabular-nums leading-none">#{standing?.rank ?? 56}</p>
            <p className="text-sm font-bold text-char-subtle uppercase tracking-wider mt-1">{standing?.region ?? 'Global'}</p>
          </div>
        </div>
      </motion.section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Segmented options={['All', 'Ranked', 'Normal', 'Customs'] as StatsQueueFilter[]} value={queueFilter} onChange={setQueueFilter} />
        <Segmented options={['All', '30d', '7d'] as StatsTimeFilter[]} value={timeFilter} onChange={setTimeFilter} />
      </div>

      {/* Overview + Outcomes */}
      {hasGames ? (
        <>
          <OverviewSection stats={stats} customImgs={customImgs} />
          <RecentOutcomesSection results={stats.recentForm} />
        </>
      ) : (
        <Section title="Overview">
          <EmptyNote>No recorded matches for these filters yet.</EmptyNote>
        </Section>
      )}

      {/* Rating Chart */}
      <RatingTrendSection points={ratingHistory} />

      {/* Top Characters + Maps + Roles + Teammates */}
      {hasGames && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <TopCharactersSection characters={stats.characters} customImgs={customImgs} />
            <MapsSection maps={stats.maps} />
          </div>
          <RolesSection roles={stats.roles} />
          <TeammatesSection teammates={stats.teammates} />
        </>
      )}
    </motion.div>
  )
}
