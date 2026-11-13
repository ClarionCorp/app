import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { CaretDownIcon, CheckIcon, CrownIcon, FireIcon, SnowflakeIcon, UserSwitchIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { getAppSettings, getMatchHistory, getUsers } from '../core/database/queries'
import { MatchHistoryTable, UserTable } from '../types/database'
import { PlayerSeason, Playstyle } from '../types/clarion'
import { getRankFromLP } from '../core/objects/ranks'
import { getRegionObjectFromOdyRegion } from '../core/objects/regions'
import { getMapObjectFromID } from '../core/objects/maps'
import { getCharacterFromId } from '../core/objects/characters'
import { getCharName } from '../core/objects/ody'
import RankIcon from '../components/Rank'
import { Dropdown } from '../components/UI/Dropdown'
import { ApiPlaceholder, EmptyNote, Section, sectionVariants, StatTile, WinRateBar } from '../components/SelfStats/Cards'
import {
  computeSelfStats,
  fetchLeaderboardStanding,
  fetchPlaystyle,
  fetchRatingHistory,
  fetchSeasonHistory,
  filterMatches,
  formatPlaytime,
  LeaderboardStanding,
  perGame,
  RatingPoint,
  RoleTotals,
  StatsQueueFilter,
  StatsTimeFilter,
  winRate,
} from '../core/utilities/selfStats'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

function themeColor(cssVar: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return value || fallback
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

function RoleColumn({ role, totals }: { role: string; totals: RoleTotals }) {
  const isForward = role === 'Forward'
  const rows: [string, number][] = isForward
    ? [['Goals', totals.goals], ['Assists', totals.assists], ['KOs', totals.kos], ['Shots', totals.shots], ['Damage', totals.damage], ['Orbs', totals.orbs]]
    : [['Saves', totals.saves], ['Assists', totals.assists], ['Redirects', totals.redirects], ['KOs', totals.kos], ['Damage', totals.damage], ['Orbs', totals.orbs]]

  return (
    <div className="flex-1 min-w-0 rounded-lg border border-surface-border bg-surface-raised/10 p-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-char">{role}</span>
        <span className="text-[10px] text-char-subtle">{totals.games} games</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-char-subtle mb-1">
          <span>Win rate</span>
          <span className="tabular-nums">{winRate(totals.wins, totals.games)}%</span>
        </div>
        <WinRateBar percent={winRate(totals.wins, totals.games)} />
      </div>
      <div className="text-[10px] text-char-subtle mb-1">Per game</div>
      <div className="space-y-1">
        {rows.map(([label, total]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-char-subtle">{label}</span>
            <span className="font-semibold text-char tabular-nums">{perGame(total, totals.games, label === 'Damage' ? 0 : 1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RatingChart({ points }: { points: RatingPoint[] }) {
  const color = themeColor('--theme-primary', '#7c5cff')
  return (
    <div className="h-36">
      <Line
        data={{
          labels: points.map(p => p.at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
          datasets: [{
            data: points.map(p => p.rating),
            borderColor: color,
            backgroundColor: `${color}22`,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 20,
            cubicInterpolationMode: 'monotone',
            fill: true,
          }],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { ticks: { maxTicksLimit: 4 } } },
        }}
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
  const [seasons, setSeasons] = useState<PlayerSeason[] | null>(null)
  const [playstyle, setPlaystyle] = useState<Playstyle | null>(null)
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
    fetchSeasonHistory(id).then(setSeasons)
    fetchPlaystyle(id).then(setPlaystyle)
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
        <Segmented options={['All', 'Ranked', 'Normal'] as StatsQueueFilter[]} value={queueFilter} onChange={setQueueFilter} />
        <Segmented options={['All', '30d', '7d'] as StatsTimeFilter[]} value={timeFilter} onChange={setTimeFilter} />
        <span className="ml-auto text-[10px] text-char-subtle">From local match history</span>
      </div>

      {!hasGames ? (
        <Section title="Overview">
          <EmptyNote>No recorded matches for these filters yet.</EmptyNote>
        </Section>
      ) : (
        <>
          {/* Overview */}
          <Section title="Overview">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <StatTile label="Matches" value={stats.games} sub={`${stats.wins}W · ${stats.games - stats.wins}L`} />
              <StatTile
                label="Win Rate"
                value={`${winRate(stats.wins, stats.games)}%`}
                accent={winRate(stats.wins, stats.games) >= 50 ? 'text-match-win' : 'text-match-loss'}
              />
              <StatTile label="MVP Rate" value={`${winRate(stats.mvps, stats.games)}%`} sub={`${stats.mvps} MVPs`} />
              <StatTile label="Time Played" value={formatPlaytime(stats.totalSeconds)} />
              <StatTile label="Avg Match" value={formatPlaytime(stats.totalSeconds / stats.games)} />
              <StatTile
                label="Streak"
                value={
                  <span className="flex items-center gap-1">
                    {stats.currentStreak?.won
                      ? <FireIcon size={16} weight="fill" className="text-match-win" />
                      : <SnowflakeIcon size={16} weight="fill" className="text-match-loss" />}
                    {stats.currentStreak?.count}{stats.currentStreak?.won ? 'W' : 'L'}
                  </span>
                }
                sub={`Best: ${stats.bestWinStreak}W`}
              />
            </div>
          </Section>

          {/* Recent form */}
          <Section title="Recent Form" action={<span className="text-[10px] text-char-subtle">Newest →</span>}>
            <div className="grid grid-cols-10 gap-1">
              {stats.recentForm.map((won, i) => (
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
        </>
      )}

      {/* Rating trend */}
      <Section title="Rating Trend">
        {ratingHistory && ratingHistory.length > 1
          ? <RatingChart points={ratingHistory} />
          : <ApiPlaceholder label="Rating history coming soon" rows={4} />}
      </Section>

      {hasGames && (
        <>
          {/* Roles */}
          <Section title="Roles">
            <div className="flex flex-col sm:flex-row gap-2">
              <RoleColumn role="Forward" totals={stats.roles.Forward} />
              <RoleColumn role="Goalie" totals={stats.roles.Goalie} />
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Characters */}
          <Section title="Top Characters">
            <div className="space-y-2">
              {stats.characters.slice(0, 5).map(c => {
                const character = getCharacterFromId(c.characterId)
                const art = customImgs ? character?.images.custom_portrait : character?.images.portrait
                const wr = winRate(c.wins, c.games)
                return (
                  <div key={c.characterId} className="flex items-center gap-3 min-w-0">
                    <img src={art} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                        <span className="font-semibold text-char truncate">{character?.name ?? getCharName(c.characterId) ?? c.characterId}</span>
                        <span className="text-char-subtle tabular-nums shrink-0">{c.games} games · {wr}%</span>
                      </div>
                      <WinRateBar percent={wr} />
                      <p className="text-[10px] text-char-subtle mt-0.5">
                        {c.forwardGames} Forward · {c.goalieGames} Goalie
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Maps */}
          <Section title="Maps">
            <div className="space-y-2.5">
              {stats.maps.map(m => {
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
          </div>

          {/* Teammates */}
          <Section title="Frequent Teammates">
            {stats.teammates.length === 0 ? (
              <EmptyNote>Play a few more games with the same people to see them here.</EmptyNote>
            ) : (
              <div className="divide-y divide-surface-border/50">
                {stats.teammates.map(t => (
                  <div key={t.key} className="flex items-center justify-between gap-2 py-1.5 text-xs">
                    <span className="text-char truncate">{t.name}</span>
                    <span className="text-char-subtle tabular-nums shrink-0">
                      {t.games} games · <span className={winRate(t.wins, t.games) >= 50 ? 'text-match-win' : 'text-match-loss'}>{winRate(t.wins, t.games)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Playstyle */}
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

      {/* Season history */}
      <Section title="Season History" action={<CrownIcon size={14} className="text-char-subtle" />}>
        {seasons && seasons.length > 0 ? (
          <div className="divide-y divide-surface-border/50">
            {seasons.map(s => (
              <div key={s.season} className="flex items-center gap-2 py-1.5 text-xs min-w-0">
                <span className="text-char-subtle w-16 shrink-0">Season {s.season}</span>
                <RankIcon rating={s.peakRating} size="xs" />
                <span className="text-char truncate flex-1">{getRankFromLP(s.peakRating).name}</span>
                <span className="text-char-subtle tabular-nums shrink-0">Peak {s.peakRating} · Final {s.finalRating}</span>
              </div>
            ))}
          </div>
        ) : (
          <ApiPlaceholder label="Season history coming soon" />
        )}
      </Section>
    </motion.div>
  )
}
