import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth } from './types/odyssey';
import { GlobalButtons } from './components/GlobalButtons';
import Sidebar from './components/Navigation/Sidebar';
import TopBar from './components/Navigation/TopBar';
import { onMatchFinalize, onMatchUpdate, onStateChange, onQueueChange, onPlayersUpdate } from './core/bridgeListener';
import { getUser, resetLocalTables, getAppSettings } from './core/database/queries';
import { tryUpdateDiscordRPC } from './core/utilities/discord';
import { db } from './core/database/driver';
import { matchHistory } from './core/database/schema';
import { fetchSelfQuery } from './core/utilities/odyssey';
import { getGameStatus } from './core/objects/gameStates';
import { playAudio, selectRandomQueuePop } from './core/utilities/audio';
import { QueuePopType } from './pages/Settings';
import { desc} from 'drizzle-orm';
import { saveMatchHistoryEntry } from './core/utilities/appAPI';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';
import { AiMiAPI, heartbeat_interval } from './core/constants';
import { formatLiveMatchInfo } from './core/overlay';
import { MatchJSON, MetaJSON, PlayersJSON, PostGameJSON } from './types/ue4ss';
import { saveMatchToHistory, updateGameState, updatePlayers, updateScore, updateSession } from './core/utilities/events';

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

  const location = useLocation();
  const showSidebar = !['/', '/home', '/setup'].includes(location.pathname);

  // Debug Page
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
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
      if (!buildData) { console.debug("Skipping live sync due to incomplete object data!"); return; }; // kinda spammy

      const res = await fetch(`${AiMiAPI}/v1/overlay/sync`, {
        method: 'POST',
        headers: { "x-user-agent": "aimi-app", "Content-Type": "application/json" },
        body: JSON.stringify(buildData),
      });

      const data = await res.json();
      if (!res.ok) { console.warn(`Live Sync with AppAPI failed! (${res.status} ${res.statusText})`, data); return; };
      // console.debug(`Successfully synced live match data with AppAPI.`); // turn off later, might get spammy lol
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
    onMatchUpdate(async (payload) => { updateScore(JSON.parse(payload.content!) as MatchJSON); }),
    onPlayersUpdate(async (payload) => { await updatePlayers(JSON.parse(payload.content!) as PlayersJSON); }),
    onMatchFinalize(async (payload) => { await saveMatchToHistory(JSON.parse(payload.content!) as PostGameJSON); }),

    onStateChange(async (payload) => {
      const data = JSON.parse(payload.content!) as MetaJSON;
      if (data.game_state == null) { return };

      // remove matchPlayers table entries for next game
      if (data.game_state.new_phase == 'None' || data.game_state.new_phase == 'PreGame') { await resetLocalTables(); }; 

      const gameStatus = getGameStatus(data.game_state.new_phase);
      await updateGameState(data.game_state.new_phase, data.queue.name);

      console.log(`GameState Changed! (${data.game_state.old_phase} -> ${data.game_state.new_phase})`);
      if (gameStatus == 'IN_GAME' || gameStatus == 'SETUP') { await tryUpdateDiscordRPC(); }
    }),

    onQueueChange(async (payload) => {
      const data = JSON.parse(payload.content!) as MetaJSON;

      console.log(`Updating Matchmaking to: (${data.queue.state}: ${data.queue.name})`);
      await updateSession(data);
      await tryUpdateDiscordRPC();

      if (data.queue.state == 'FoundMatch') {
        const settings = await getAppSettings();
        if (settings.notifyQueuePop) {
          await playAudio(selectRandomQueuePop(settings.queuePopType as QueuePopType), settings.queuePopVol);
        }
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
 
      <GlobalButtons />
    </div>
  );
}

export default App;
