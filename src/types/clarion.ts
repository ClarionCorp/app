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