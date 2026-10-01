import { Awakenings, Playstyle, Season, SmurfResult } from "../../types/clarion";
import { ClarionAPI, version } from "../constants";


export async function getCurrentAwakeningRotation(): Promise<Awakenings[]> {
  try {
    const res = await fetch(`${ClarionAPI}/v2/tools/awakenings?active=true`, {
      method: 'GET',
      headers: { 'User-Agent': `AiMisApp v${version}` }
    });

    const data: Awakenings[] = await res.json();
    if (!res.ok || data.length == 0) { throw new Error(`CC is currently unreachable! Please contact blals ASAP! (${res.status})`) };

    return data;
  } catch (error) {
    console.error(`Failed to fetch current awakening rotation from CC!`, error);
    return []
  }
}

export async function fetchPlayerPlayerstyle(username: string): Promise<Playstyle | null> {
  try {
    const res = await fetch(`${ClarionAPI}/v2/players/${username}/playstyle`, {
      method: 'GET',
      headers: { 'User-Agent': `AiMisApp v${version}` }
    });

    const data: Playstyle = await res.json();
    if (!res.ok) { throw new Error(`CC is currently unreachable! Please contact blals ASAP! (${res.status})`) };

    return data;
  } catch (error) {
    console.error(`Failed to fetch playstyle for ${username}!`, error);
    return null
  }
}

export async function fetchPlayerSmurfEstimate(username: string): Promise<SmurfResult | null> {
  try {
    const res = await fetch(`${ClarionAPI}/v2/tools/smurf/${username}`, {
      method: 'GET',
      headers: { 'User-Agent': `AiMisApp v${version}` }
    });

    const data: SmurfResult = await res.json();
    if (!res.ok) { throw new Error(`CC is currently unreachable! Please contact blals ASAP! (${res.status})`) };

    return data;
  } catch (error) {
    console.error(`Failed to fetch smurf estimate for ${username}!`, error);
    return null
  }
}

export async function fetchCurrentSeason(): Promise<Season | null> {
  try {
    const res = await fetch(`${ClarionAPI}/v2/tools/season/current`, {
      method: 'GET',
      headers: { 'User-Agent': `AiMisApp v${version}` }
    });

    const data: Season = await res.json();
    if (!res.ok) { throw new Error(`CC is currently unreachable! Please contact blals ASAP! (${res.status})`) };

    return data;
  } catch (error) {
    console.error(`Failed to fetch current season!`, error);
    return null
  }
}

export async function fetchAllSeasons(): Promise<Season[]> {
  try {
    const res = await fetch(`${ClarionAPI}/v2/tools/seasons`, {
      method: 'GET',
      headers: { 'User-Agent': `AiMisApp v${version}` }
    });

    const data: { seasons: Season[] } = await res.json();
    if (!res.ok) { throw new Error(`CC is currently unreachable! Please contact blals ASAP! (${res.status})`) };

    return data.seasons.map((s: any) => ({
      ...s,
      startDate: new Date(s.startDate),
      endDate: new Date(s.endDate)
    }));
  } catch (error) {
    console.error(`Failed to fetch season history!`, error);
    return [];
  }
}

export async function getSeasonFromDate(date: Date): Promise<Season> {
  const seasons = await fetchAllSeasons();
  if (seasons.length == 0) { throw new Error(`No season data came back from CC for some reason.`) };

  const target = new Date(date).getTime();

  const season = seasons.find(
    s => target >= s.startDate.getTime() && target <= s.endDate.getTime()
  ) ?? seasons.reduce((closest, s) => {
    const dist = Math.min(
      Math.abs(target - s.startDate.getTime()),
      Math.abs(target - s.endDate.getTime())
    );
    const closestDist = Math.min(
      Math.abs(target - closest.startDate.getTime()),
      Math.abs(target - closest.endDate.getTime())
    );
    return dist < closestDist ? s : closest;
  });

  if (!season) { throw new Error(`No season could be found for date ${date}!`); };

  return season;
}