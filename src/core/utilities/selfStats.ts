import { MatchHistoryTable } from "../../types/database";
import { MatchPlayer } from "../../types/ue4ss";
import { PlayerSeason, Playstyle } from "../../types/clarion";
import { QUEUES } from "../objects/queues";

export type StatsQueueFilter = 'All' | 'Ranked' | 'Normal';
export type StatsTimeFilter = 'All' | '30d' | '7d';

export type RoleTotals = {
  games: number,
  wins: number,
  mvps: number,
  goals: number,
  assists: number,
  saves: number,
  kos: number,
  damage: number,
  shots: number,
  orbs: number,
  redirects: number,
}

export type CharacterTotals = {
  characterId: string,
  games: number,
  wins: number,
  forwardGames: number,
  goalieGames: number,
}

export type MapTotals = {
  mapId: string,
  games: number,
  wins: number,
}

export type TeammateTotals = {
  key: string,
  name: string,
  games: number,
  wins: number,
}

export type SelfStats = {
  games: number,
  wins: number,
  mvps: number,
  totalSeconds: number,
  currentStreak: { won: boolean, count: number } | null,
  bestWinStreak: number,
  recentForm: boolean[], // newest first
  roles: Record<MatchPlayer['role'], RoleTotals>,
  characters: CharacterTotals[],
  maps: MapTotals[],
  teammates: TeammateTotals[],
}

const TIME_WINDOWS: Record<StatsTimeFilter, number | null> = {
  'All': null,
  '30d': 30 * 86400_000,
  '7d': 7 * 86400_000,
};

function emptyRole(): RoleTotals {
  return { games: 0, wins: 0, mvps: 0, goals: 0, assists: 0, saves: 0, kos: 0, damage: 0, shots: 0, orbs: 0, redirects: 0 };
}

function queueClass(queue: string) {
  return QUEUES.find(q => q.queueId === queue || q.queueName === queue)?.class ?? null;
}

export function filterMatches(
  matches: MatchHistoryTable[],
  playerId: string | null,
  queue: StatsQueueFilter,
  time: StatsTimeFilter,
) {
  const window = TIME_WINDOWS[time];
  const cutoff = window ? Date.now() - window : null;

  return matches.filter(m => {
    if (playerId && m.playerId !== playerId) return false;
    if (queue !== 'All' && queueClass(m.queue) !== queue) return false;
    if (cutoff && m.createdAt.getTime() < cutoff) return false;
    return true;
  });
}

// Expects matches sorted newest first
export function computeSelfStats(matches: MatchHistoryTable[]): SelfStats {
  const roles = { Forward: emptyRole(), Goalie: emptyRole() };
  const characters = new Map<string, CharacterTotals>();
  const maps = new Map<string, MapTotals>();
  const teammates = new Map<string, TeammateTotals>();

  let games = 0;
  let wins = 0;
  let mvps = 0;
  let totalSeconds = 0;
  const results: boolean[] = [];

  for (const m of matches) {
    const me = m.players.find(p => p.playerId === m.playerId);
    if (!me) continue;

    games++;
    totalSeconds += m.duration;
    results.push(m.wonGame);
    if (m.wonGame) wins++;
    if (me.mvp) mvps++;

    const role = roles[me.role];
    role.games++;
    if (m.wonGame) role.wins++;
    if (me.mvp) role.mvps++;
    role.goals += me.goals;
    role.assists += me.assists;
    role.saves += me.saves;
    role.kos += me.kos;
    role.damage += me.damage;
    role.shots += me.shots;
    role.orbs += me.orbs;
    role.redirects += me.redirects;

    const char = characters.get(me.characterId) ?? { characterId: me.characterId, games: 0, wins: 0, forwardGames: 0, goalieGames: 0 };
    char.games++;
    if (m.wonGame) char.wins++;
    if (me.role === 'Forward') char.forwardGames++;
    else char.goalieGames++;
    characters.set(me.characterId, char);

    const map = maps.get(m.mapId) ?? { mapId: m.mapId, games: 0, wins: 0 };
    map.games++;
    if (m.wonGame) map.wins++;
    maps.set(m.mapId, map);

    for (const p of m.players) {
      if (p.team !== m.myTeam || p === me) continue;
      const key = p.playerId ?? p.name;
      const mate = teammates.get(key) ?? { key, name: p.name, games: 0, wins: 0 }; // newest-first, so this is their latest name
      mate.games++;
      if (m.wonGame) mate.wins++;
      teammates.set(key, mate);
    }
  }

  let currentStreak: SelfStats['currentStreak'] = null;
  if (results.length > 0) {
    let count = 0;
    while (count < results.length && results[count] === results[0]) count++;
    currentStreak = { won: results[0], count };
  }

  let bestWinStreak = 0;
  let run = 0;
  for (const won of results) {
    run = won ? run + 1 : 0;
    bestWinStreak = Math.max(bestWinStreak, run);
  }

  const byGames = <T extends { games: number }>(a: T, b: T) => b.games - a.games;

  return {
    games,
    wins,
    mvps,
    totalSeconds,
    currentStreak,
    bestWinStreak,
    recentForm: results.slice(0, 20),
    roles,
    characters: [...characters.values()].sort(byGames),
    maps: [...maps.values()].sort(byGames),
    teammates: [...teammates.values()].filter(t => t.games >= 2).sort(byGames).slice(0, 5),
  };
}

export function winRate(wins: number, games: number) {
  return games > 0 ? Math.round((wins / games) * 100) : 0;
}

export function perGame(total: number, games: number, digits = 1) {
  return games > 0 ? (total / games).toFixed(digits) : '—';
}

export function formatPlaytime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

//
// API placeholders
// TODO: Wire these up to ClarionAPI once the endpoints exist. Returning null renders the placeholder state.
//

export type RatingPoint = {
  at: Date,
  rating: number,
}

export type LeaderboardStanding = {
  rank: number,
  percentile: number,
  region: string,
}

export async function fetchRatingHistory(_playerId: string): Promise<RatingPoint[] | null> {
  return null;
}

export async function fetchSeasonHistory(_playerId: string): Promise<PlayerSeason[] | null> {
  return null;
}

export async function fetchPlaystyle(_playerId: string): Promise<Playstyle | null> {
  return null;
}

export async function fetchLeaderboardStanding(_playerId: string): Promise<LeaderboardStanding | null> {
  return null;
}
