import { getCurrentMatch, getGameSession, getMatchPlayers, getUser } from "./database/queries";
import { PlaystyleType } from "../types/clarion";

// Matches what AppAPI expects
export type POSTLiveMatchV1 = {
  username: string,
  gameState: string | null,
  map: string | null, // id (GMD_)
  queue: string, // human-readable name
  partySize: number,
  teamNumber: 1 | 2,
  seenTrainings: string[],
  bans: string[],
  teamOnePts: number,
  teamTwoPts: number,
  teamOneSets: number,
  teamTwoSets: number,
  players: LiveMatchPlayer[],
  startedAt: Date,
}

// Matches what AppAPI expects
export type PlaystyleEnum =
  | 'BRAWLER'
  | 'MIDFIELDER'
  | 'HARD_FORWARD'
  | 'OFFENSIVE_GOALIE'
  | 'DEFENSIVE_GOALIE'
  | 'GENERIC_GOALIE'
  | 'GENERIC_FORWARD';

const playstyleToEnum: Record<PlaystyleType, PlaystyleEnum> = {
  'Brawler': 'BRAWLER',
  'Midfielder': 'MIDFIELDER',
  'Hard Forward': 'HARD_FORWARD',
  'Offensive Goalie': 'OFFENSIVE_GOALIE',
  'Defensive Goalie': 'DEFENSIVE_GOALIE',
  'Generic Goalie': 'GENERIC_GOALIE',
  'Generic Forward': 'GENERIC_FORWARD',
};

export type LiveMatchPlayer = {
  username: string,
  playerId: string,
  teamNumber: 1 | 2,
  role: 'Forward' | 'Goalie',
  charName: string, // human-readable name
  characterId: string,
  rating: number, // 0 if failed to fetch
  isMe: boolean,
  totalXp: number,
  gainedXp: number, // gained since last intermission
  xpGoals: number[], // gain history between goals
  ping?: number,
  trainings: string[], // ids
  playingFavChar: boolean,
  playingMainChar: boolean,
  winrate: number,
  games: number,
  playstyle: PlaystyleEnum,
}

export async function formatLiveMatchInfo(): Promise<POSTLiveMatchV1 | null> {
  const currentMatch = await getCurrentMatch();
  const sessionInfo = await getGameSession();
  const matchPlayers = await getMatchPlayers();
  const currentUser = await getUser();

  // Make sure we have all the required info to initiate a valid update
  if (!currentMatch || !currentUser || !sessionInfo || !matchPlayers) return null;
  if (
    !sessionInfo.queueName ||
    !currentMatch.teamNum ||
    !currentMatch.startedAt
  ) { return null };

  const isRanked = sessionInfo.queueName === 'Ranked';

  const formattedPlayers: LiveMatchPlayer[] = matchPlayers.map(p => ({
    username: p.username,
    playerId: p.playerId ?? '',
    teamNumber: p.teamNum ?? 1,
    role: p.role ?? 'Forward',
    charName: p.charName ?? '',
    characterId: p.charId ?? '',
    rating: p.rating ?? 0,
    isMe: p.isMe,
    totalXp: p.xp ?? 0,
    gainedXp: p.gainedXp ?? 0,
    xpGoals: p.xpGoals,
    ping: p.ping ?? undefined,
    trainings: p.trainings,
    playingFavChar: p.favChar.some(c => c.characterId === p.charId),
    playingMainChar: p.bestChar.some(c => c.characterId === p.charId),
    winrate: (isRanked ? p.rankedWR : p.normWR) ?? 0,
    games: (isRanked ? p.rankedGames : p.normGames) ?? 0,
    playstyle: playstyleToEnum[(p.role === 'Goalie' ? p.playstyle?.goalie.type : p.playstyle?.forward.type) ?? 'Generic Forward'],
  }));

  const formattedMatch: POSTLiveMatchV1 = {
    username: currentUser.username,
    gameState: currentMatch.gameState,
    map: currentMatch.map,
    queue: sessionInfo.queueName,
    partySize: sessionInfo.partySize,
    teamNumber: currentMatch.teamNum,
    seenTrainings: currentMatch.trainings,
    bans: currentMatch.bans,
    teamOnePts: currentMatch.teamOnePts ?? 0,
    teamTwoPts: currentMatch.teamTwoPts ?? 0,
    teamOneSets: currentMatch.teamOneSets ?? 0,
    teamTwoSets: currentMatch.teamTwoSets ?? 0,
    players: formattedPlayers,
    startedAt: currentMatch.startedAt,
  }

  return formattedMatch;
}