import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth } from './types/odyssey';
import { GlobalButtons } from './components/GlobalButtons';
import Sidebar from './components/Navigation/Sidebar';
import TopBar from './components/Navigation/TopBar';
import NavCorner from './components/Navigation/NavCorner';
import { onMatchFinalize, onMatchUpdate, onPlayersUpdate, onGameStateChange, onCustomLobbyHeartbeat, onQueueChange, pushOverlayState, pushQueueState } from './core/bridgeListener';
import { getUser, resetLocalTables, getAppSettings, appendTimelineEntry, getCurrentMatch, resetPlayerTable } from './core/database/queries';
import { tryUpdateDiscordRPC } from './core/utilities/discord';
import { playAudio, selectRandomQueuePop } from './core/utilities/audio';
import { QueuePopType } from './pages/Settings';
import { exit } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';
import { version } from './core/constants';
import { MatchJSON, MetaJSON, PlayersJSON, PostGameJSON } from './types/ue4ss';
import { checkLocalPlayer, saveMatchToHistory, updateCustomLobby, updateGameState, updatePlayers, updateScore } from './core/utilities/events';
import { sessionHeartbeat } from './core/utilities/sessions';
import { fetchOnlineCount } from './core/utilities/appAPI';
import { ThemePicker } from './components/UI/Theme/ThemePicker';
import { refreshCurrentUser } from './core/utilities/odyssey';

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
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const showSidebar = !['/', '/home', '/setup'].includes(location.pathname);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // collapse back down if we navigate away while expanded, so it doesn't reappear pre-expanded later
  useEffect(() => {
    if (!showSidebar) setSidebarHovered(false);
  }, [showSidebar]);

  // Debug Page
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        const setting = await getAppSettings();
        await playAudio(selectRandomQueuePop(setting.queuePopType as QueuePopType), setting.queuePopVol)
      };
      if (e.key === 'F9') navigate('/debug');
      if (e.key === 'F4') setThemePickerOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
    onPlayersUpdate(async (payload) => {
      await updatePlayers(JSON.parse(payload.content!) as PlayersJSON);
      await pushOverlayState();
    }),
    onCustomLobbyHeartbeat(async (payload) => { await updateCustomLobby(JSON.parse(payload.content!) as MetaJSON); }),

    onGameStateChange(async (payload) => {
      const data = JSON.parse(payload.content!) as MetaJSON;
      if (data.game_state == null) { return };
      console.log(`GameState Changed! (${data.game_state.old_phase} -> ${data.game_state.new_phase})`);

      // remove matchPlayers table entries for next game
      if (data.game_state.new_phase == 'None' || data.game_state.new_phase == 'PreGame') { await resetLocalTables(); };

      // Update database
      const matchTable = await updateGameState(data);
      await tryUpdateDiscordRPC();
      await pushOverlayState();
      await pushQueueState();

      // Only once during Match Start, log the match start time in timeline entries if not there already.
      if (data.game_state.new_phase == 'VersusScreen' && !matchTable.timeline.some(e => e.event === 'GAME_START')) { await appendTimelineEntry({ when: new Date(), event: 'GAME_START', }) };
    
      // Only during match end
      if (data.game_state.new_phase == 'PostGameSummary' || data.game_state.new_phase == 'EndGame') {
        const user = await getUser();
        await fetchOnlineCount(user!.username, user!.matchmakingRegion, version, data.queue.id, data.queue.state, user!.rating)
      }
    }),

    onMatchUpdate(async (payload) => {
      const data = JSON.parse(payload.content!) as MatchJSON;
      await updateScore(data);
      await tryUpdateDiscordRPC();
      await pushOverlayState();
    }),

    onQueueChange(async (payload) => {
      const data = JSON.parse(payload.content!) as MetaJSON;
      const previous = await getCurrentMatch();
      const user = await getUser();
      await updateGameState(data); // we are really just updating the queue object

      if ((previous?.queueState == 'Queued' || previous?.queueState == 'Idle') && (data.queue.state == 'FoundMatch' || data.queue.state == 'StartingGame')) {
        const settings = await getAppSettings();
        if (settings.notifyQueuePop) {
          await playAudio(selectRandomQueuePop(settings.queuePopType as QueuePopType), settings.queuePopVol);
        }
      }

      // On queue, reset players table and refresh overlay (to hide it)
      if (data.queue.state == 'Queued' || data.queue.state == 'FoundMatch') {
        await resetPlayerTable('Entered Queue');
      }

      // Check local_player string against current active user.
      if (data.local_player) {
        const result = await checkLocalPlayer(data.local_player);
        if (result == false) {
          localStorage.setItem('reload_reason', JSON.stringify({ reason: 'ACCOUNT_CHANGE', acknowledged: false }));
          navigate('/', { replace: true })
        };
      }

      await tryUpdateDiscordRPC();
      await pushOverlayState();
      await pushQueueState();
      await sessionHeartbeat();
      if (user) { await fetchOnlineCount(user.username, user.matchmakingRegion, version, data.queue.id, data.queue.state, user.rating) } // should always be set but whatever
    }),
    onMatchFinalize(async (payload) => {
      // Make absolutely sure the user exists in the db before attempting to save
      const user = getUser();
      if (!user) { await refreshCurrentUser(true); };

      await saveMatchToHistory(JSON.parse(payload.content!) as PostGameJSON);
    }),
  ]);
  return () => { unlistens.then((fns) => fns.forEach((fn) => fn())); };
}, []);

  return (
    <div className="min-h-screen bg-background text-white pt-12">
      <TopBar border={!showSidebar} />
      {showSidebar && <NavCorner hovered={sidebarHovered} />}

      <div className="flex">
        {showSidebar && <Sidebar navigate={navigate} hovered={sidebarHovered} onHoverChange={setSidebarHovered} />}
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
      <ThemePicker open={themePickerOpen} onClose={() => setThemePickerOpen(false)} />
    </div>
  );
}

export default App;
