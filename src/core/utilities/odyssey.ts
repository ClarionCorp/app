import { OdyAuth, RankedQuery, UserQuery } from "../../types/odyssey";
import { OdyAPI } from "../constants";

type QueryJSON ={
  matches: UserQuery[]
}

type RankedJSON ={
  players: RankedQuery[]
}

export async function usernameQuery(username: string, auth: OdyAuth): Promise<UserQuery | null> {
  try {
    const res = await fetch(`${OdyAPI}/v1/players?usernameQuery=${username}`, {
      method: 'GET',
      headers: {
        'X-Authorization': `Bearer ${auth.jwt}`,
        'X-Refresh-Token': `${auth.rft}`
      }
    });

    const data: QueryJSON = await res.json();
    if (!res.ok || data.matches.length == 0 || !data.matches[0].playerId) { throw new Error(`API Unreachable or Player not found (${res.status})`) };

    return data.matches[0];
  } catch (error) {
    console.debug(error);
    console.warn(`Player '${username}' returned no data!`);
    return null
  }
}

export async function rankQuery(playerId: string, auth: OdyAuth): Promise<RankedQuery | null> {
  try {
    const res = await fetch(`${OdyAPI}/v1/ranked/leaderboard/search/${playerId}?entriesBefore=0&entriesAfter=0`, {
      method: 'GET',
      headers: {
        'X-Authorization': `Bearer ${auth.jwt}`,
        'X-Refresh-Token': `${auth.rft}`
      }
    });

    const data: RankedJSON = await res.json();
    if (!res.ok || data.players.length == 0 || !data.players[0] ) { throw new Error(`API Unreachable or Player not found (${res.status})`) };

    return data.players[0];
  } catch (error) {
    console.debug(error);
    console.warn(`Player '${playerId}' returned no data!`);
    return null
  }
}