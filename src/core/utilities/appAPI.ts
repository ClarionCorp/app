// This refers to the Ai.Mi App API at https://api.aimis.app.

import { POSTMatchHistoryV1 } from "../../types/appAPI";
import { MatchHistoryTable } from "../../types/database";

export async function saveMatchHistoryEntry(match: MatchHistoryTable) {
  const avgRating = 0;
  const body: POSTMatchHistoryV1 = {
    mapId: match.mapId,
    queue: match.queue,
    result: match.wonGame ? 'VICTORY' : 'DEFEAT',
    duration: match.duration,
    bans: [],
    avgRating,
    playerId: match.
  }
}