import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import Sidebar from './components/Navigation/Sidebar';
import TopBar from './components/Navigation/TopBar';
import { onGameStateChanged, onPlayersChanged, onMatchFinalize, onSessionUpdated, onTrainingsChanged, refreshLatestMatchStart } from './core/bridgeListener';
import { getCurrentMatch, getUser, insertMatchHistory, setMatchPlayers, upsertCurrentMatch, getMatchPlayers, updatePlayerRating, resetLocalTables, calcAndSetPlayerStats, getGameSession, updateSessionInfo, getAppSettings, appendTimelineEntry } from './core/database/queries';
import { GameSessionJSON, GameStateJSON, mergeMatchPlayers, PlayerFinderJSON, PostGameStatsJSON, TrainingsChangedJSON } from './types/ue4ss';
import { tryUpdateDiscordRPC } from './core/utilities/discord';
import { db } from './core/database/driver';
import { currentMatch, matchHistory, matchPlayers } from './core/database/schema';
import { fetchPlayerStats, fetchRankQuery, fetchSelfQuery, fetchUsernameQuery } from './core/utilities/odyssey';
import { getQueueObjectFromID, QUEUE_STATES_ARRAY } from './core/objects/queues';
import { getGameStatus } from './core/objects/gameStates';
import { playAudio, selectRandomQueuePop } from './core/utilities/audio';
import { QueuePopType } from './pages/Settings';
import { fetchPlayerPlayerstyle } from './core/utilities/clarion';
import { desc, eq } from 'drizzle-orm';
import { saveMatchHistoryEntry } from './core/utilities/appAPI';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';
import { AiMiAPI, heartbeat_interval } from './core/constants';
import { useDialogue } from './components/UI/DialogueToast';
import { checkSaveTimelineEntries, markMatchStartIfNone } from './core/timeline';
import { formatLiveMatchInfo } from './core/overlay';

const diffSeconds = (a: Date, b: Date) => Math.abs(b.getTime() - a.getTime()) / 1000;

export interface AppContextType {
  navigate: ReturnType<typeof useNavigate>;

  odyAuth: OdyAuth;
  setOdyAuth: (auth: OdyAuth) => void;

  connectedToOdy: boolean;
  setConnectedStatus: (status: boolean) => void;
}

function App() {
  const [odyAuth, setOdyAuth] = useState<OdyAuth>();
  const [connectedToOdy, setConnectedStatus] = useState<boolean>(false);
  const navigate = useNavigate();
  const { show: showDialogue } = useDialogue();
  const demoIndexRef = useRef(0);

  const location = useLocation();
  const showSidebar = !['/', '/home', '/setup'].includes(location.pathname);

  // Debug Page
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        const demos = [
          {
            variant: 'success' as const,
            message: 'Match accepted! Loading into the arena...',
            image: '/aimi/Free.png',
            autoDismiss: 4000,
          },
          {
            variant: 'info' as const,
            message: 'Your ranked season resets in 3 days. Check your standing before it ends.',
            image: '/aimi/Yapping.gif',
            buttons: [
              { label: 'View Rank', variant: 'primary' as const, onClick: () => {}, dismisses: true },
              { label: 'Dismiss', dismisses: true },
            ],
            dismissible: false,
          },
          {
            variant: 'warning' as const,
            message: 'Your rank protection expires after this match. A loss will affect your rating.',
            image: '/aimi/Free.png',
            autoDismiss: 6000,
          },
          {
            variant: 'error' as const,
            message: 'Failed to sync match data. Your stats may not be up to date.',
            image: '/aimi/Free.png',
            buttons: [{ label: 'Retry', variant: 'danger' as const, dismisses: true }],
          },
          {
            variant: 'danger' as const,
            message: 'AFK detected. You will be removed from the match in 30 seconds.',
            image: '/aimi/Free.png',
            dismissible: false,
            buttons: [{ label: "I'm here!", variant: 'primary' as const, dismisses: true }],
          },
        ];
        showDialogue(demos[demoIndexRef.current % demos.length]);
        demoIndexRef.current++;
      }
      if (e.key === 'F8') {
        const setting = await getAppSettings();
        await playAudio(selectRandomQueuePop(setting.queuePopType as QueuePopType), setting.queuePopVol)
      };
      // Upload & Validate last match history entry
      if (e.ctrlKey && e.key === 'F9') {
        const lastEntry = await db.select().from(matchHistory).orderBy(desc(matchHistory.id)).limit(1).then(r => r[0] ?? null);
        console.debug(`Uploading entry:`, JSON.stringify(lastEntry, null, 1));
        await saveMatchHistoryEntry(lastEntry);
      }
      if (e.key === 'F9') navigate('/debug');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Identity heartbeat: Relaunch if the active Odyssey account changes
  useEffect(() => {
    let firstFire = true;
    const id = setInterval(async () => {
      if (firstFire) { firstFire = false; return; }
      try {
        console.log('Checking in with Odyssey for routine heartbeat...');
        const [selfQuery, currentUser] = await Promise.all([fetchSelfQuery(), getUser()]);
        if (!currentUser) return;
        if (selfQuery.username !== currentUser.username || selfQuery.playerId !== currentUser.playerId) {
          console.error('User identity mismatch detected, relaunching...');
          await relaunch();
        }
      } catch {
        // game may not be running, just skip silently
      }
    }, heartbeat_interval);
    return () => clearInterval(id);
  }, []);

  // Periodic match data upload (every 30s) [only if allowed by settings]
  useEffect(() => {
    const uploadMatchData = async () => {
      const settings = await getAppSettings();
      if (settings.sendMatchData == false) { return };

      const buildData = await formatLiveMatchInfo();
      if (!buildData) { console.debug("Skipping live sync due to incomplete object data!"); return; };

      const res = await fetch(`${AiMiAPI}/v1/overlay/sync`, {
        method: 'POST',
        headers: { "x-user-agent": "aimi-app", "Content-Type": "application/json" },
        body: JSON.stringify(buildData),
      });

      const data = await res.json();
      if (!res.ok) { console.warn(`Live Sync with AppAPI failed! (${res.status} ${res.statusText})`, data); return; };
      console.debug(`Successfully synced live match data with AppAPI.`); // turn off later, might get spammy lol
      return;
    };
    const id = setInterval(uploadMatchData, 30_000);
    return () => clearInterval(id);
  }, []);

  // Auto-close when game exits (if enabled in settings)
  useEffect(() => {
    let wasRunning = false;
    const id = setInterval(async () => {
      const running = await invoke<boolean>('is_process_running', { name: 'OmegaStrikers.exe' });
      if (wasRunning && !running) {
        const settings = await getAppSettings();
        if (settings?.exitOnGameClose) {
          console.log(`'exitOnGameClose' is enabled, and the game is no longer detected. Closing app...`);
          await exit(0);
        };
      }
      wasRunning = running;
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  // Rust Mod Bridge Listeners
  useEffect(() => {
  const unlistens = Promise.all([
    onPlayersChanged(async (payload) => {
      console.debug(`Players updated!`)
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as PlayerFinderJSON;
      const currentUser = await getUser();

      const players = await setMatchPlayers(data.players.filter(p => p.name !== 'Player').map(p => ({
        username: p.name,
        teamNum: p.team,
        role: p.role,
        charName: p.character_name,
        charId: p.character_id,
        isMe: p.name === currentUser?.username,
        xp: p.level,
        gainedXp: p.intermissionXp,
        ping: p.ping_ms,
        trainings: p.trainings,
      })));

      for (const player of players.filter(p => p.rating === null)) {
        // fetch and set ratings and other stats (if empty)
        console.log(`Fetching statistical data for ${player.username}...`)
        try {
          const user = await fetchUsernameQuery(player.username);
          const ranked = await fetchRankQuery(user!.playerId);
          const stats = await fetchPlayerStats(user!.playerId);
          const playstyle = await fetchPlayerPlayerstyle(player.username);
          await calcAndSetPlayerStats(player.username, stats, user?.playerId); // run first since it really shouldn't fail as much as rating
          await updatePlayerRating(player.username, ranked!.rating);
          await db.update(matchPlayers).set({ playstyle }).where(eq(matchPlayers.username, player.username));
        } catch (e) {
          console.warn(`No rank data could be found for ${player.username}.`);
          updatePlayerRating(player.username, 0); // set to 0 to prevent refetching (and failing again)
          continue;
        }
      }
    }),
    onGameStateChanged(async (payload) => {
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as GameStateJSON;

      // remove matchPlayers table entries for next game
      if (data.phase == 'None' || data.phase == 'PreGame') { await resetLocalTables(); }; 

      await refreshLatestMatchStart(); // might be deprecated soon
      const session = await getGameSession();
      const gameStatus = getGameStatus(data.phase);
      const currentState = await getCurrentMatch();

      let cMatch = await upsertCurrentMatch({
        gameState: data.phase,
        map: data.map_id,
        queue: gameStatus == 'IDLING' ? session.queueName : undefined,
        bans: data.banned_characters,
        teamNum: data.my_team,
        teamOnePts: data.t1_goals,
        teamTwoPts: data.t2_goals,
        teamOneSets: data.t1_sets,
        teamTwoSets: data.t2_sets,
        // startedAt: data.phase == 'VersusScreen' ? new Date() : undefined
      });

      console.log(`GameState Changed! (${data.phase})`);
      if (gameStatus == 'IN_GAME' || gameStatus == 'SETUP') { await tryUpdateDiscordRPC(cMatch); } // Ask Discord RPC to try and update score
      
      console.log(`t1_pts: ${currentState.teamOnePts} | t2_pts: ${currentState.teamTwoPts}`);
      console.log(`t1_goals: ${data.t1_goals} | t2_goals: ${data.t2_goals}`);
      if (
        data.phase == 'GoalScore' ||
        data.phase == 'GoalCelebration' ||
        data.phase == 'InGame'
      ) { await checkSaveTimelineEntries(currentState, data) };
      if (data.phase == 'FaceOffIntro') { await markMatchStartIfNone(); };
    }),
    onSessionUpdated(async (payload) => {
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as GameSessionJSON;

      const prevSession = await getGameSession();
      const queueObj = getQueueObjectFromID(data.queue_name);
      const queueState = QUEUE_STATES_ARRAY[data.mm_state];

      console.log(`Updating Matchmaking to: (${queueState}: ${queueObj.queueName})`);
      const session = await updateSessionInfo({
        partySize: data.party_size,
        maxPartySize: data.max_party_size,
        queueName: queueObj.queueName,
        queueState: QUEUE_STATES_ARRAY[data.mm_state] ?? 'Unknown',
      });
      await tryUpdateDiscordRPC(undefined, session); // Ask Discord RPC to update

      if (prevSession.queueState == 'Queued' && (session.queueState == 'FoundMatch' || session.queueState == 'StartingGame')) {
        const settings = await getAppSettings();
        if (settings.notifyQueuePop) {
          await playAudio(selectRandomQueuePop(settings.queuePopType as QueuePopType), settings.queuePopVol);
        }
      }
    }),
    onTrainingsChanged(async (payload) => {
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as TrainingsChangedJSON;

      // ADD new trainings to the match storage
      console.log(`Updating shown awakenings list...`);
      const [row] = await db.select({ trainings: currentMatch.trainings }).from(currentMatch);
      await db.update(currentMatch).set({ trainings: [...row.trainings, ...data.trainings] });
    }),
    onMatchFinalize(async (payload) => {
      if (payload.kind === 'removed' || !payload.content) return;
      console.debug(`Match Ended! Saving...`)
      try { // if any matches fail to save, it'll be easier to debug lol (im leaving this here after I needed it)
        await refreshLatestMatchStart();
        const stats = JSON.parse(payload.content) as PostGameStatsJSON;

        const [match, currentUser, matchPlayers] = await Promise.all([
          getCurrentMatch(),
          getUser(),
          getMatchPlayers(),
        ]);
        if (!match || !currentUser) return;

        const players = mergeMatchPlayers(matchPlayers, stats);
        const myPlayer = players.find(p => p.name === currentUser.username);
        if (!myPlayer) return;

        const myTeam = match.teamNum ?? 1;
        const myScore = myTeam === 1 ? (match.teamOneSets ?? 0) : (match.teamTwoSets ?? 0);
        const enemyScore = myTeam === 1 ? (match.teamTwoSets ?? 0) : (match.teamOneSets ?? 0);
        await appendTimelineEntry({
          when: new Date(),
          event: 'WON_GAME',
          team: (match.teamOneSets ?? 0) > (match.teamTwoSets ?? 0) ? 1 : 2,
        })

        await insertMatchHistory({
          players,
          mapId: match.map ?? '',
          duration: diffSeconds(match.startedAt!, new Date()),
          queue: match.queue ?? 'queue:none',
          playerId: myPlayer.playerId,
          myTeam,
          bans: match.bans,
          t1_pts: match.teamOnePts ?? 0,
          t2_pts: match.teamTwoPts ?? 0,
          t1_sets: match.teamOneSets ?? 0,
          t2_sets: match.teamTwoSets ?? 0,
          wonGame: myScore > enemyScore,
          timeline: match.timeline,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error('Something went wrong while saving the match!', e);
      }
    }),
  ]);

  return () => { unlistens.then((fns) => fns.forEach((fn) => fn())); };
}, []);

  return (
    <div className="min-h-screen bg-background text-white pt-12">
      <TopBar />
 
      <div className="flex">
        {showSidebar && <Sidebar navigate={navigate} />}
        <main className={showSidebar ? "flex-1 pl-13" : "flex-1"}>
          <Outlet context={{
            navigate,
            odyAuth, setOdyAuth,
            connectedToOdy, setConnectedStatus,
            }}
          />
        </main>
      </div>
 
      <DebugConsole />
    </div>
  );
}

export default App;
