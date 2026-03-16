export type UserQuery = {
  username: string,
  playerId: string,
  emoticonId: string,
  nameplateId: string,
  titleId: string,
  tags: string[],
  masteryLevel: number,
}

export type RankedQuery = {
  username: string,
  playerId: string,
  emoticonId: string,
  nameplateId: string,
  titleId: string,
  tags: string[],
  masteryLevel: number,
  rank: number,
  wins: number,
  losses: number,
  games: number,
  topRole: 'Forward' | 'Goalie',
  rating: number,
  mostPlayedCharacters: {
    characterId: string,
    gamesPlayed: number,
  }[],
  currentDivisionId: string, // usually "WORLD"
}

export type SelfQuery = {
  username: string,
  playerId: string,
  emoticonId: string,
  nameplateId: string,
  titleId: string,
  tags: string[],
  masteryLevel: number,
  playerStatus: string,
  displayNameStatus: string,
  lastDisplayNameChangeTimestamp?: Date,
  matchmakingRegion: string,
  gameLiftRegionUrls: {
    region: string,
    url: string,
  }[],
  discordConnection?: {
    discordId: string
  }
}

export type OdyAuth = {
  jwt: string,
  rft: string,
}