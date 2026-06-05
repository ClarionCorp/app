// This refers to the Ai.Mi App API at https://api.aimis.app.

import { POSTMatchHistoryPlayerV1, POSTMatchHistoryV1 } from "../../types/appAPI";
import { MatchHistoryTable } from "../../types/database";
import { AiMiAPI } from "../constants";
import { getUsers, usernameToPlayerId } from "../database/queries";

// Here we parse the data we have locally before shipping it off to the AppAPI
export async function saveMatchHistoryEntry(match: MatchHistoryTable) {
  const avgRating = 0;

  let playerId: string | null = null;
  if (match.username) {
    playerId = await usernameToPlayerId(match.username);
  } else {
    const users = await getUsers();
    for (const u of users) {
      const allNames = [u.username, ...u.nameHistory];
      if (match.players.some(p => allNames.includes(p.name))) {
        playerId = u.playerId;
        break;
      }
    }
  }
  if (!playerId) { return 'PlayerID could not be resolved.' };

  const players: POSTMatchHistoryPlayerV1[] = await Promise.all(
    match.players.map(async (p) => ({
      username: p.name,
      teamNum: p.team,
      characterId: p.characterId,
      role: p.role,
      trainings: p.trainings,
      level: p.level,
      assists: Number(p.assists),
      scores: Number(p.goals),
      saves: Number(p.saves),
      knockouts: Number(p.kos),
      damage: Number(p.damage),
      shots: Number(p.shots),
      redirects: Number(p.redirects),
      orbs: Number(p.orbs),
      mvp: false,
    }))
  );

  const body: POSTMatchHistoryV1 = {
    mapId: match.mapId,
    queue: match.queue,
    result: match.wonGame ? 'VICTORY' : 'DEFEAT',
    duration: match.duration,
    bans: [],
    avgRating,
    playerId,
    players,
    t1_sets: match.t1_sets,
    t2_sets: match.t2_sets,
    myTeam: match.myTeam,
    playedAt: match.createdAt
  }

  const res = await fetch(`${AiMiAPI}/v1/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
    body: JSON.stringify(body)
  });
  if (!res.ok) { return `Failed to send! (${res.status})` };
  const data = await res.json();
  return data;
}