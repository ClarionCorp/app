// Fetches player stats from selected datasource and saves it to db.
// Returns boolean for if it worked or not.

import { fetch } from "@tauri-apps/plugin-http";
import { getAppSettings } from "../database/queries";
import { AiMiAPI, ClarionAPI } from "../constants";
import { fetchOdyPlayerStats, fetchRankQuery } from "./odyssey";
import { Player, PlayerSeason, Playstyle, SmurfConfidence } from "../../types/clarion";
import { PairedPlayersV1 } from "../../types/appAPI";
import { RankedQuery } from "../../types/odyssey";
import { Nameplate } from "../../types/database";

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
  nameplate: Nameplate | null,
  peakRating?: PlayerSeason,
  smurfProbability?: SmurfConfidence,
  playstyle?: Playstyle,
}

export type ProminentChar = {
  characterId: string,
  queue: 'Ranked' | 'Normal',
  role: 'Forward' | 'Goalie',
  games: number,
  winrate: number
}

type CombinedPlayerStats = {
  ranked: {
    games: number
    wins: number
    losses: number
    scores: number
    assists: number
    saves: number
    knockouts: number
    mvp: number
  },
  normal: {
    games: number
    wins: number
    losses: number
    scores: number
    assists: number
    saves: number
    knockouts: number
    mvp: number
  }
}

function getNameplate(ccp?: Player, odyp?: RankedQuery | null): Nameplate | null {
  if (ccp && ccp.info.nameplateId && ccp.assets?.nameplate) {
    return {
      nameplateId: ccp.info.nameplateId,
      nameplateUrl: ccp.assets?.nameplate
    }
  } else if (odyp && odyp.nameplateId) {
    return {
      nameplateId: odyp.nameplateId,
      nameplateUrl: `https://api.clarioncorp.net/assets/nameplate/${odyp.nameplateId}.webp` // might work
    }
  } else {
    return null;
  }
}

export async function fetchPlayerStats(username: string, playerId?: string, gamemode?: 'Normal' | 'Ranked'): Promise<ReqPlayerStats> {
  const appSettings = await getAppSettings();
  const mode = gamemode ?? 'Ranked';

  // defaults
  let requiredStats: ReqPlayerStats = {
    rating: 0,
    normWR: 0,
    normGames: 0,
    rankedGames: 0,
    rankedWR: 0,
    tags: [],
    nameplate: null,
  };

  try {
    if (appSettings.prefDataSource == 'ClarionCorp') {
      const res = await fetch(`${AiMiAPI}/v2/player/${username}?mode=${mode}`, { method: 'GET' }); // IP-forwarded rate limiting
      if (!res.ok) { throw new Error(`Could not fetch data for player '${username}' from CC datasource!`) };

      const data = await res.json() as Player;
      const totalStats = combineCharacterStats(data);

      requiredStats = {
        rating: data.latestRatings[0].rating ?? 0,
        favChar: formatProminentChars(data, 'Favorite'),
        bestChar: formatProminentChars(data, 'Best'),
        tags: data.info.tags,
        nameplate: getNameplate(data),
        peakRating: data.seasons.reduce((max, s) => s.peakRating > max.peakRating ? s : max),
        normWR: totalStats.normal.wins / totalStats.normal.games,
        normGames: totalStats.normal.games,
        rankedWR: totalStats.ranked.games ? totalStats.ranked.wins / totalStats.ranked.games : 0,
        rankedGames: totalStats.ranked.games,
        smurfProbability: data.smurfing.confidence,
        playstyle: data.playStyle,
      }
    }

    // Should be 1:1 with the one above, but incase it ever isn't, they're separated here
    else if (appSettings.prefDataSource == 'Cached') {
      const res = await fetch(`${ClarionAPI}/v3/players/${username}?cached=true&mode=${mode}`, { method: 'GET' });
      if (!res.ok) { throw new Error(`Could not fetch data for player '${username}' from CC cached datasource!`) };

      const data = await res.json() as Player;
      const totalStats = combineCharacterStats(data);

      requiredStats = {
        rating: data.latestRatings[0].rating ?? 0,
        favChar: formatProminentChars(data, 'Favorite'),
        bestChar: formatProminentChars(data, 'Best'),
        tags: data.info.tags,
        nameplate: getNameplate(data),
        peakRating: data.seasons.reduce((max, s) => s.peakRating > max.peakRating ? s : max),
        normWR: totalStats.normal.wins / totalStats.normal.games,
        normGames: totalStats.normal.games,
        rankedWR: totalStats.ranked.games ? totalStats.ranked.wins / totalStats.ranked.games : 0,
        rankedGames: totalStats.ranked.games,
        smurfProbability: data.smurfing.confidence,
        playstyle: data.playStyle,
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

      // Only consider characters from the current mode
      const candidates = flatCharStats.filter(e => (e.ratingName === 'RankedInitial' ? 'Ranked' : 'Normal') === mode);
      const toProminentChar = (e: typeof candidates[number]): ProminentChar => ({
        characterId: e.characterId,
        queue: mode,
        role: e.role,
        games: e.games,
        winrate: e.wins / e.games,
      });

      // Best (highest winrate)
      const bestChar = (['Forward', 'Goalie'] as const).flatMap(role => {
        const pool = candidates.filter(c => c.role === role)
        return pool.length > 0
          ? [toProminentChar(pool.reduce((a, b) => (b.wins / b.games > a.wins / a.games ? b : a)))]
          : []
      })

      // Favorite (most games)
      const favChar = (['Forward', 'Goalie'] as const).flatMap(role => {
        const pool = candidates.filter(c => c.role === role)
        return pool.length > 0
          ? [toProminentChar(pool.reduce((a, b) => (b.games > a.games ? b : a)))]
          : []
      })


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
        favChar,
        bestChar,
        normWR: normalTotals.wins / normalTotals.games,
        normGames: normalTotals.games,
        rankedWR: rankedTotals.wins / rankedTotals.games,
        rankedGames: rankedTotals.games,
        tags: rankQuery?.tags ?? [],
        nameplate: getNameplate(undefined, rankQuery),
      }
    }

    else { throw new Error(`Invalid datasource or usage`) };

    return requiredStats;
  } catch (e) {
    console.error(e);
    return requiredStats;
  }
}

// Prominent Character mapping (CC only) - one entry in the array for Forward and one for Goalie
function formatProminentChars(data: Player, prominence: 'Favorite' | 'Best'): ProminentChar[] {
  if (prominence == 'Best') {
    return data.accolades.bestCharacter.map((best): ProminentChar => ({
      characterId: best.character,
      queue: best.gamemode,
      role: best.role,
      games: best.games,
      winrate: best.games ? best.wins / best.games : 0,
    }))
  } else {
    return data.accolades.favCharacter.map((fav): ProminentChar => ({
      characterId: fav.character,
      queue: fav.gamemode,
      role: fav.role,
      games: fav.games,
      winrate: fav.games ? fav.wins / fav.games : 0,
    }))
  }
}

// Just combine each character's stats to get totals for the player
// We could just get this from the rating, but not everyone plays ranked
function combineCharacterStats(data: Player): CombinedPlayerStats {
  const empty = () => ({ games: 0, wins: 0, losses: 0, scores: 0, assists: 0, saves: 0, knockouts: 0, mvp: 0 })
  const totals: CombinedPlayerStats = { ranked: empty(), normal: empty() }

  for (const s of data.characterStats) {
    const t = s.gamemode === 'Ranked' ? totals.ranked : totals.normal
    t.games += s.games
    t.wins += s.wins
    t.losses += s.losses
    t.scores += s.scores
    t.assists += s.assists
    t.saves += s.saves
    t.knockouts += s.knockouts
    t.mvp += s.mvp
  }

  return totals
}

// AppAPI will infer duo/trio queues from recent matches
export async function getInferredQueueMates(username: string): Promise<PairedPlayersV1 | null> {
  try {
    const res = await fetch(`${AiMiAPI}/v1/player/${username}/teammates`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json() as PairedPlayersV1;

    // Not really an error, just drop and add to logfile
    if (res.status == 404) {
      console.debug(`No teammates could be found for ${username}: (${res.status})`);
      return null;
    } else if (!res.ok) { throw new Error(`${res.status}: ${res.statusText}`) }

    return data;

  } catch (e) {
    console.error(`Failed to fetch teammates for ${username}!`, e);
    return null;
  }
}