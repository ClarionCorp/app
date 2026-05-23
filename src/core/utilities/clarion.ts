import { Awakenings } from "../../types/clarion";
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