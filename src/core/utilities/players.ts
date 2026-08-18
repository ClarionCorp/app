// Fetches player stats from selected datasource and saves it to db.
// Returns boolean for if it worked or not.

import { fetch } from "@tauri-apps/plugin-http";
import { getAppSettings } from "../database/queries";
import { AiMiAPI, ClarionAPI } from "../constants";
import { fetchOdyPlayerStats, fetchRankQuery } from "./odyssey";
import { Player } from "../../types/clarion";

// An obj containing what we need in order to fill the database
type ReqPlayerStats = {
  rating: number, // if no rating, save as 0 so we don't recheck
  favChar?: ProminentChar,
  bestChar?: ProminentChar,
  normWR: number,
  rankedWR: number,
  normGames: number,
  rankedGames: number,
}

type ProminentChar = {
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
    rankedWR: 0
  };

  try {
    if (appSettings.prefDataSource == 'ClarionCorp') {
      const res = await fetch(`${AiMiAPI}/v1/player/${username}`, { method: 'GET' }); // IP-forwarded rate limiting
      if (!res.ok) { throw new Error(`Could not fetch data for player '${username}' from CC datasource!`) };

      const data = await res.json() as Player;
      const normStats = getNormStatsCC(data);

      requiredStats = {
        rating: data.ratings[0]?.rating ?? 0,
        favChar: getProminentCharCC(data, 'Favorite'),
        bestChar: getProminentCharCC(data, 'Best'),
        normWR: normStats.wins / normStats.games,
        normGames: normStats.games,
        rankedWR: data.ratings[0]?.games ? data.ratings[0].wins / data.ratings[0].games : 0, // display 0% if no ranked rating
        rankedGames: data.ratings[0]?.games ?? 0,
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
        favChar: getProminentCharCC(data, 'Favorite'),
        bestChar: getProminentCharCC(data, 'Best'),
        normWR: normStats.wins / normStats.games,
        normGames: normStats.games,
        rankedWR: data.ratings[0]?.games ? data.ratings[0].wins / data.ratings[0].games : 0, // display 0% if no ranked rating
        rankedGames: data.ratings[0]?.games ?? 0,
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

      // Best winrate
      const bestChar = flatCharStats
        .map(e => ({ ...e, winrate: e.wins / e.games }))
        .reduce((a, b) => (b.winrate > a.winrate ? b : a));

      // Favorite (most games)
      const favChar = flatCharStats.reduce((a, b) => (b.games > a.games ? b : a));

      
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
        favChar: {
          characterId: favChar.characterId,
          queue: favChar.ratingName == 'RankedInitial' ? 'Ranked' : 'Normal',
          role: favChar.role,
          games: favChar.games,
          winrate: favChar.wins / favChar.games,
        },
        bestChar: {
          characterId: bestChar.characterId,
          queue: bestChar.ratingName == 'RankedInitial' ? 'Ranked' : 'Normal',
          role: bestChar.role,
          games: bestChar.games,
          winrate: bestChar.wins / bestChar.games,
        },
        normWR: normalTotals.wins / normalTotals.games,
        normGames: normalTotals.games,
        rankedWR: rankedTotals.wins / rankedTotals.games,
        rankedGames: rankedTotals.games,
      }
    }

    else { throw new Error(`Invalid datasource or usage`) };

    return requiredStats;
  } catch (e) {
    console.error(e);
    return requiredStats;
  }
}

// Prominent Character mapping (CC only)
function getProminentCharCC(data: Player, prominence: 'Favorite' | 'Best'): ProminentChar {
  if (prominence == 'Favorite') {
    const favorite = data.characterRatings.reduce((a, b) => (b.games > a.games ? b : a));

    return {
      characterId: favorite.character,
      queue: favorite.gamemode === 'RankedInitial' ? 'Ranked' : 'Normal',
      role: favorite.role,
      games: favorite.games,
      winrate: favorite.wins / favorite.games
    }

  } else {
    const best = data.characterRatings
      .map(entry => ({ ...entry, winrate: entry.games > 0 ? entry.wins / entry.games : 0 }))
      .reduce((a, b) => (b.winrate > a.winrate ? b : a));

    return {
      characterId: best.character,
      queue: best.gamemode === 'RankedInitial' ? 'Ranked' : 'Normal',
      role: best.role,
      games: best.games,
      winrate: best.winrate
    }
  }
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