// Types from Upstream CC API
export type Player = {
  id: string,
  username: string,
  region: string,
  logoId: string,
  nameplateId: string,
  emoticonId: string,
  titleId: string,
  title: string | null,
  socialUrl: string,
  discordId: string,
  createdAt: Date,
  tags: string[],
  updatedAt: Date,
  currentXp: number,
  playerStatus: 'Online' | 'Offline' | 'InQueue' | 'InGame',
  ratings: PlayerRating[],
  // teams: // unused for now
  mastery: {
    currentLevel: number,
    currentLevelXp: number,
    totalXp: number,
    xpToNextLevel: number,
  }
}

export type PlayerRating = {
  playerId: string,
  rating: number,
  rank: number,
  wins: number,
  losses: number,
  masteryLevel: number,
  games: number,
  createdAt: Date
}

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

type RoleCategoryPS = {
  multiplier: number,
  avgPerGame: number | null
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

type RolePlaystyle = {
  type?: PlaystyleType
  assists: RoleCategoryPS
  knockouts: RoleCategoryPS
  scores: RoleCategoryPS
  saves: RoleCategoryPS
}

export type Playstyle = {
  forward: RolePlaystyle,
  goalie: RolePlaystyle
}

export type SmurfConfidence = 'none' | 'low' | 'medium' | 'high';
export type SmurfResult = {
  username: string,
  confidence: SmurfConfidence,
  signals: {
    youngAccount: boolean,
    lowLevel: boolean,
    abnormalWinrate: boolean,
  }
}