// This refers to the Ai.Mi App API at https://api.aimis.app.

import { VersionCheck } from "../../types/appAPI";
import { AiMiAPI, version } from "../constants";

export async function checkForUpdates(): Promise<VersionCheck> {
  try {
    const res = await fetch(`${AiMiAPI}/v1/update/check?currentVer=${version}&channel=beta`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json() as VersionCheck;
    if (data.release?.author.id !== 89052946) { throw new Error("Release author ID doesn't match blals!") }; // I'll remove later but I'm paranoid rn lol
    if (data.updateAvailable) { console.log(`Update Available! (${version} ->${data.latest})`) }
    else { console.log(`App is up-to-date!`) };

    return data;

  } catch (e) {
    console.error(`Failed to fetch new updates!`, e);
    return { updateAvailable: false, latest: version }
  }
}