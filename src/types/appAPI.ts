// This refers to the Ai.Mi App API at https://api.aimis.app.

export type OnlinePlayersV1 = {
  total: number,
  in_game: number,
  idling: number
}

export type POSTMatchHistoryV1 = {
  mapId: string,
  queue: string, // English names, like "Ranked"
  result: 'VICTORY' | 'DEFEAT' | 'DRAW',
  duration: number, // in seconds
  bans: string[], // unused for now, just leave blank
  avgRating: number,

  playerId: string,
  players: POSTMatchHistoryPlayerV1[],

  t1_sets: number,
  t2_sets: number,
  myTeam: number,

  playedAt: Date
}

export type POSTMatchHistoryPlayerV1 = {
  username: string,
  teamNum: 1 | 2,
  
  characterId: string, // CD_ShieldUser
  role: 'Forward' | 'Goalie',
  trainings: string[], // training IDs only
  level: number,
  assists: number,
  scores: number,
  saves: number,
  knockouts: number,
  damage: number,
  shots: number,
  redirects: number,
  orbs: number,
  mvp: boolean, // unused for now, just leave omitted
}