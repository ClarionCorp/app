// Types from Upstream CC API
import { OdyRegion } from "../core/objects/regions"

export type Awakenings = {
  id: string, // awakening id, not training id
  name: string,
  description?: string | null,
  image: string,
  active: boolean,
  gear: boolean,
  rotatedIn?: Date
}

export type Map = {
  id: string, // GTD_
  name: string,
  imageUrl: string,
  active: boolean,
  rotatedAt: Date
}

export type Maps = {
  active: Map[],
  all: Map[]
}

export type Season = {
  season: number,
  startDate: Date,
  endDate: Date
}

export type Player = {
  info: {
    playerId: string,
    username: string,
    nameplateId: string | null,
    emoticonId: string | null,
    titleId: string | null,
    title?: string | null,
    region: OdyRegion,
    tags: string[],
    socialUrl: string | null,
    discord: {
      id: string,
      overwritten: boolean,
    } | null,
  },
  leveling: {
    currentLevel: number,
    currentLevelXp: number,
    totalXp: number,
    xpToNextLevel: number,
  },
  latestRatings: PlayerRating[], // latest first
  seasons: PlayerSeason[], // latest first
  characterStats: PlayerCharacterRating[],
  characterMasteries: [], // not setup yet
  accolades: {
    bestCharacter: PlayerCharacterRating,
    favCharacter: PlayerCharacterRating,
  },
  teams: PlayerTeam[],
  playStyle: Playstyle,
  smurfing: {
    confidence: SmurfConfidence,
    signals: {
      youngAccount: boolean,
      lowLevel: boolean,
      abnormalWinrate: boolean,
    }
  },
  assets?: {
    nameplate?: string,
  },
  currentSeason: number,
  createdAt: Date,
  updatedAt: Date,
}

export type PlayerRating = {
  rating: number,
  ranking: {
    global: number,
    region: number,
  },
  region: OdyRegion,
  games: number,
  wins: number,
  losses: number,
  season: number,
  createdAt: Date,
}

export type PlayerSeason = {
  season: number,
  peakRating: number,
  finalRating: number,
}

export type PlayerCharacterRating = {
  character: string,
  role: 'Forward' | 'Goalie',
  games: number,
  wins: number,
  losses: number,
  scores: number,
  assists: number,
  saves: number,
  knockouts: number,
  mvp: number,
  gamemode: 'Normal' | 'Ranked',
  createdAt: Date
}

export type PlayerTeam = {
  teamName: string,
  teamTag: string,
  series: string,
  season: string,
  logo: string,
}

export type RolePlaystyle = {
  assists: PlaystyleStat,
  knockouts: PlaystyleStat,
  scores: PlaystyleStat,
  saves: PlaystyleStat,
  type: PlaystyleType
}

export type Playstyle = {
  forward: PlaystyleStat,
  goalie: PlaystyleStat,
}

export type PlaystyleStat = {
  multiplier: number,
  avgPerGame: number | null,
}

export type PlaystyleType = 
  'Brawler' |
  'Midfielder' |
  'Hard Forward' |
  'Offensive Goalie' |
  'Defensive Goalie' |
  'Generic Goalie' |
  'Generic Forward'
;

export type SmurfConfidence = 'none' | 'low' | 'medium' | 'high';