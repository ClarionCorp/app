import { RankedQuery, SelfQuery, UserQuery } from "../../types/odyssey";
import { OdyAPI } from "../constants";
import { db } from "../database/driver";
import { getUser } from "../database/queries";
import { user } from "../database/schema";
import { readIdentity } from "../init";

type QueryJSON ={
  matches: UserQuery[]
}

type RankedJSON ={
  players: RankedQuery[]
}

export async function fetchUsernameQuery(username: string): Promise<UserQuery | null> {
  const { jwt, rft } = await readIdentity();
  try {
    const res = await fetch(`${OdyAPI}/v1/players?usernameQuery=${username}`, {
      method: 'GET',
      headers: {
        'X-Authorization': `Bearer ${jwt}`,
        'X-Refresh-Token': `${rft}`
      }
    });

    const data: QueryJSON = await res.json();
    if (!res.ok || data.matches.length == 0 || !data.matches[0]?.playerId) { throw new Error(`API Unreachable or Player not found (${res.status})`) };

    return data.matches[0];
  } catch (error) {
    console.debug(error);
    console.warn(`Player '${username}' returned no data!`);
    return null
  }
}

export async function fetchRankQuery(playerId: string): Promise<RankedQuery | null> {
  const { jwt, rft } = await readIdentity();
  try {
    const res = await fetch(`${OdyAPI}/v1/ranked/leaderboard/search/${playerId}?entriesBefore=0&entriesAfter=0`, {
      method: 'GET',
      headers: {
        'X-Authorization': `Bearer ${jwt}`,
        'X-Refresh-Token': `${rft}`
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

export async function fetchSelfQuery(): Promise<SelfQuery> {
  const { jwt, rft } = await readIdentity();

  const res = await fetch(`${OdyAPI}/v1/me`, {
    headers: {
      'X-Authorization': `Bearer ${jwt}`,
      'x-Refresh-Token': rft,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch account info from Ody API.\nPlease make sure you have the game open.\n\n(Status: ${res.status})`
    );
  }

  console.debug('Successfully fetched user data from Odyssey!');
  return res.json() as Promise<SelfQuery>;
}

// refetches and saves the user's current ody rating to the database
// also returns with that number to save on having to also fetch the database.
export async function refreshRating(): Promise<number | null> {
  // This assumes the general playerData is already in the database.
  const userData = await getUser();
  if (!userData) return null;
  const ranked = await fetchRankQuery(userData.playerId);
  if (!ranked) return null;
  await db.update(user).set({ rating: ranked.rating }).run();
  return ranked.rating;
}