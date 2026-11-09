// This refers to the Ai.Mi App API at https://api.aimis.app.

import { AppAPIRegion } from "../core/objects/regions"
import { GithubRelease } from "./github"

// POST /v3/online
// Just returns the same as GETOnlinePlayersV3

// GET /v3/online
export type GETOnlinePlayersV3 = {
  regions: Record<AppAPIRegion, OnlineObjectV3>,
};

export type QueueCounts = {
  queueId: string,
  count: number,
};

export type OnlineObjectV3 = {
  total: number,
  in_game: number,
  idling: number,
  queuing: number,
  seen: number,
  queues: QueueCounts[],
};

// /v3/online/history
export type HistoryPoint = Omit<OnlineObjectV3, 'queues'> & { at: Date };

export type OnlineHistoryV3 = {
  regions: Record<AppAPIRegion, HistoryPoint[]>,
};


// /v1/matches
export type POSTMatchHistoryV1 = {
  mapId: string,
  queue: string, // English names, like "Ranked"
  result: 'VICTORY' | 'DEFEAT' | 'DRAW',
  duration: number, // in seconds
  bans: string[], // unused for now, just leave blank
  avgRating: number,

  playerId: string,
  username: string,
  players: POSTMatchHistoryPlayerV1[],

  t1_sets: number,
  t2_sets: number,
  t1_pts: number,
  t2_pts: number,
  myTeam: number,

  timeline?: {
    when: Date,
    event: string,
    team?: 1 | 2
  }[],

  region: AppAPIRegion,
  playedAt: number,
}

export type POSTMatchHistoryPlayerV1 = {
  playerId: string | null,
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
  mvp: boolean,
  rating: number,
}

// /v1/player/:username/teammates
export type PairedPlayersV1 = {
  username: string,
  queuemates: string[],
  updatedAt: Date,
  createdAt: Date
}

// /v1/updates
export type VersionCheck = {
  updateAvailable: boolean,
  latest: string, // tag/version name
  release?: GithubRelease
}

export type PreferredDataSources = 'ClarionCorp' | 'Cached' | 'Odyssey';
export const PreferredDataSources = ['ClarionCorp', 'Cached', 'Odyssey'];

export type ReleaseChannel = 'Stable' | 'Beta';
export const ReleaseChannel = ['Stable', 'Beta'];