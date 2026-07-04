import { Awakenings, Playstyle, SmurfResult } from "../../types/clarion";
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return null
  }
}