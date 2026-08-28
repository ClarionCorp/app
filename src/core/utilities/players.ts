// Fetches player stats from selected datasource and saves it to db.
// Returns boolean for if it worked or not.

import { fetch } from "@tauri-apps/plugin-http";
import { getAppSettings } from "../database/queries";
import { AiMiAPI, ClarionAPI } from "../constants";
import { fetchOdyPlayerStats, fetchRankQuery } from "./odyssey";
import { Player } from "../../types/clarion";
import { PairedPlayersV1 } from "../../types/appAPI";

// An obj containing what we need in order to fill the database
type ReqPlayerStats = {
  rating: number, // if no rating, save as 0 so we don't recheck
  favChar?: ProminentChar[],
  bestChar?: ProminentChar[],
  normWR: number,
  rankedWR: number,
  normGames: number,
  rankedGames: number,
  tags: string[],
}

export type ProminentChar = {
  characterId: string,
  queue: 'Ranked' | 'Normal',
  role: 'Forward' | 'Goalie',
  games: number,
  winrate: number
}

export async function fetchPlayerStats(username: string, playerId?: string): Promise<ReqPlayerStats> {
  const appSettings = await getAppSettings();

  // defaults
  let requiredStats: ReqPlayerStats = {
    rating: 0,
    normWR: 0,
    normGames: 0,
    rankedGames: 0,
    rankedWR: 0,
    tags: [],
  };

  try {
    if (appSettings.prefDataSource == 'ClarionCorp') {
      const res = await fetch(`${AiMiAPI}/v1/player/${username}`, { method: 'GET' }); // IP-forwarded rate limiting
      if (!res.ok) { throw new Error(`Could not fetch data for player '${username}' from CC datasource!`) };

      const data = await res.json() as Player;
      const normStats = getNormStatsCC(data);

      requiredStats = {
        rating: data.ratings[0]?.rating ?? 0,
        favChar: getProminentCharsCC(data, 'Favorite'),
        bestChar: getProminentCharsCC(data, 'Best'),
        normWR: normStats.wins / normStats.games,
        normGames: normStats.games,
        rankedWR: data.ratings[0]?.games ? data.ratings[0].wins / data.ratings[0].games : 0, // display 0% if no ranked rating
        rankedGames: data.ratings[0]?.games ?? 0,
        tags: data.tags,
      }
    }

    // Should be 1:1 with the one above, but incase it ever isn't, they're separated here
    else if (appSettings.prefDataSource == 'Cached') {
      const res = await fetch(`${ClarionAPI}/v2/cached/players/${username}`, { method: 'GET' });
      if (!res.ok) { throw new Error(`Could not fetch data for player '${username}' from CC cached datasource!`) };

      const data = await res.json() as Player;
      const normStats = getNormStatsCC(data);

      requiredStats = {
        rating: data.ratings[0]?.rating ?? 0,
        favChar: getProminentCharsCC(data, 'Favorite'),
        bestChar: getProminentCharsCC(data, 'Best'),
        normWR: normStats.wins / normStats.games,
        normGames: normStats.games,
        rankedWR: data.ratings[0]?.games ? data.ratings[0].wins / data.ratings[0].games : 0, // display 0% if no ranked rating
        rankedGames: data.ratings[0]?.games ?? 0,
        tags: data.tags,
      }
    }

    else if (appSettings.prefDataSource == 'Odyssey' && playerId) {
      const rankQuery = await fetchRankQuery(playerId);
      const statsQuery = await fetchOdyPlayerStats(playerId);
      if (!statsQuery) { throw new Error(`Odyssey returned no player stats for ${username} (${playerId})`) };

      // Character Stats first
      const flatCharStats = statsQuery.characterStats
        .filter(e => e.ratingName !== 'None')
        .flatMap(e =>
          Object.entries(e.roleStats).map(([role, stats]) => ({
            characterId: e.characterId,
            ratingName: e.ratingName,
            role: role as 'Forward' | 'Goalie',
            ...stats,
          }))
        )
        .filter(e => e.games > 0); // skip zero-game role entries entirely

      const queues = ['Normal', 'Ranked'] as const;
      const inQueue = (ratingName: string, queue: typeof queues[number]) => (ratingName === 'RankedInitial' ? 'Ranked' : 'Normal') === queue;

      // Best winrate, per queue
      const bestChars: ProminentChar[] = queues.reduce<ProminentChar[]>((entries, queue) => {
        const candidates = flatCharStats.filter(e => inQueue(e.ratingName, queue));
        if (candidates.length === 0) return entries;

        const best = candidates
          .map(e => ({ ...e, winrate: e.wins / e.games }))
          .reduce((a, b) => (b.winrate > a.winrate ? b : a));

        entries.push({
          characterId: best.characterId,
          queue,
          role: best.role,
          games: best.games,
          winrate: best.winrate,
        });
        return entries;
      }, []);

      // Favorite (most games), per queue
      const favChars: ProminentChar[] = queues.reduce<ProminentChar[]>((entries, queue) => {
        const candidates = flatCharStats.filter(e => inQueue(e.ratingName, queue));
        if (candidates.length === 0) return entries;

        const favorite = candidates.reduce((a, b) => (b.games > a.games ? b : a));

        entries.push({
          characterId: favorite.characterId,
          queue,
          role: favorite.role,
          games: favorite.games,
          winrate: favorite.wins / favorite.games,
        });
        return entries;
      }, []);


      // Player Stats after
      const flatPlayerStats = statsQuery.playerStats
        .filter(e => e.ratingName !== 'None')
        .flatMap(e =>
          Object.entries(e.roleStats).map(([role, stats]) => ({
            ratingName: e.ratingName,
            role: role as 'Forward' | 'Goalie',
            ...stats,
          }))
        );

      // Combined totals per ratingName
      const normalInitial = flatPlayerStats.filter(e => e.ratingName === 'NormalInitial');
      const rankedInitial = flatPlayerStats.filter(e => e.ratingName === 'RankedInitial');

      const normalTotals = normalInitial.reduce(
        (acc, e) => ({
          games: acc.games + e.games,
          wins: acc.wins + e.wins,
          losses: acc.losses + e.losses,
        }),
        { games: 0, wins: 0, losses: 0 }
      );

      const rankedTotals = rankedInitial.reduce(
        (acc, e) => ({
          games: acc.games + e.games,
          wins: acc.wins + e.wins,
          losses: acc.losses + e.losses,
        }),
        { games: 0, wins: 0, losses: 0 }
      );

      requiredStats = {
        rating: rankQuery?.rating ?? 0,
        favChar: favChars,
        bestChar: bestChars,
        normWR: normalTotals.wins / normalTotals.games,
        normGames: normalTotals.games,
        rankedWR: rankedTotals.wins / rankedTotals.games,
        rankedGames: rankedTotals.games,
        tags: rankQuery?.tags ?? [],
      }
    }

    else { throw new Error(`Invalid datasource or usage`) };

    return requiredStats;
  } catch (e) {
    console.error(e);
    return requiredStats;
  }
}

// Prominent Character mapping (CC only) - one entry per queue (Normal, Ranked)
function getProminentCharsCC(data: Player, prominence: 'Favorite' | 'Best'): ProminentChar[] {
  const queues = ['Normal', 'Ranked'] as const;

  return queues.reduce<ProminentChar[]>((entries, queue) => {
    const inQueue = data.characterRatings.filter(entry =>
      (entry.gamemode === 'RankedInitial' ? 'Ranked' : 'Normal') === queue && entry.games > 0
    );
    if (inQueue.length === 0) return entries;

    if (prominence == 'Favorite') {
      const favorite = inQueue.reduce((a, b) => (b.games > a.games ? b : a));

      entries.push({
        characterId: favorite.character,
        queue,
        role: favorite.role,
        games: favorite.games,
        winrate: favorite.wins / favorite.games
      });

    } else {
      const best = inQueue
        .map(entry => ({ ...entry, winrate: entry.wins / entry.games }))
        .reduce((a, b) => (b.winrate > a.winrate ? b : a));

      entries.push({
        characterId: best.character,
        queue,
        role: best.role,
        games: best.games,
        winrate: best.winrate
      });
    }

    return entries;
  }, []);
}

// Merging and combining norms stats for each character (CC only)
function getNormStatsCC(data: Player): { games: number, wins: number, losses: number } {
  const normalInitial = data.characterRatings.filter(e => e.gamemode === 'NormalInitial');
  const { games, wins, losses } = normalInitial.reduce(
    (acc, e) => ({
      games: acc.games + e.games,
      wins: acc.wins + e.wins,
      losses: acc.losses + e.losses,
    }),
    { games: 0, wins: 0, losses: 0 }
  );
  return { games, wins, losses };
}

// AppAPI will infer duo/trio queues from recent matches
export async function getInferredQueueMates(username: string): Promise<PairedPlayersV1 | null> {
  try {
    const res = await fetch(`${AiMiAPI}/v1/player/${username}/teammates`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json() as PairedPlayersV1;
    if (!res.ok) { throw new Error(`${res.status}: ${res.statusText}`) };

    return data;

  } catch (e) {
    console.error(`Failed to fetch teammates for ${username}!`, e);
    return null;
  }
}