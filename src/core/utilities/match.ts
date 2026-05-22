import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";
import { getCurrentMatch, getUser } from "../database/queries";
import { refreshRating } from "./odyssey";
import { matchHistory } from "../database/schema";
import { db } from "../database/driver";
import { listen } from "@tauri-apps/api/event";

export type PostGameStats = {
  shots: string, // actually all strings
  goals: string,
  kos: string,
  orbs: string,
  name: string,
  saves: string,
  redirects: string,
  damage: string,
  assists: string,
}

export const PHASE_GROUPS = {
  out_of_game: [
    'Unknown',
    'None',
    'PostGameCelebration',
    'PostGameSummary'
  ],
  starting: [
    'PreGame',
    'ArenaOverview',
    'CharacterPreSelect',
    'BanSelect',
    'LoadoutSelect',
    'CharacterSelect',
    'VersusScreen',
  ],
  waiting: [
    'IntermissionOutro',
    'GoalScore',
  ],
  in_game: [
    'InGame',
    'FaceOffIntro',
    'FaceOffCountdown',
    'GoalCelebration',
    'IntermissionMvp',
    'IntermissionIntro',
    'Intermission'
  ],
} as const;

// export async function saveMatch() {
//   try {
//     const user = await getUser();
//     if (!user) throw new Error('No local user could be found.');
//     const userRating = await refreshRating();
//     if (!userRating) throw new Error('Rating returned null!');

//     const cMatch = await getCurrentMatch();

//     const rawPGS = await readTextFile('PostGameStats.json', { baseDir: BaseDirectory.Temp });
//     const allPGS: PostGameStats[] = JSON.parse(rawPGS);
//     const gameStats: PostGameStats | undefined = allPGS.find(p => p.name === user.username);


//     const mySets = cMatch.myTeam === 'TeamTwo' ? cMatch.teamTwoSets! : cMatch.teamOneSets!;
//     const theirSets = cMatch.myTeam === 'TeamTwo' ? cMatch.teamOneSets! : cMatch.teamTwoSets!;

//     await db.insert(matchHistory).values({
//       players: cMatch.playerNames,
//       mapId: cMatch.level!, // pretty sure its there atp
//       characterId: cMatch.myCharacter!,
//       duration: 300, // placeholder
//       myScore: mySets,
//       enemyScore: theirSets,
//       wonGame: mySets > theirSets,
//       goals: Number(gameStats?.goals ?? 0), // fallback to zeroes
//       assists: Number(gameStats?.assists ?? 0),
//       saves: Number(gameStats?.saves ?? 0),
//       kos: Number(gameStats?.kos ?? 0),
//       damage: Number(gameStats?.damage ?? 0),
//       shots: Number(gameStats?.shots ?? 0),
//       redirects: Number(gameStats?.redirects ?? 0),
//       orbs: Number(gameStats?.orbs ?? 0),
//       allGameStats: allPGS, // save everyone's stats for overview (thanks sqlite)
//       createdAt: new Date(),
//     });

//     console.info(`Successfully saved latest match to local database.`);

//   } catch (e) {
//     console.error('Something went wrong saving the match!', e);
//   }
// }

// const unlisten = await listen<PostGameStats[]>('postgame-stats', (event) => {
//   console.info('Received postgame stats:', event.payload);
//   // event.payload will be the array of player stats
// });