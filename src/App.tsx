import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth, SelfQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import { MatchPhase } from './core/logMonitor';
import Sidebar from './components/Navigation/Sidebar';
import TopBar from './components/Navigation/TopBar';
import { RpcActivityOptions, useDiscordRpc } from './core/utilities/discord';
import { CurrentMatchTable, UserTable } from './types/database';
import { getCurrentMatch } from './core/database/queries';

export interface AppContextType {
  navigate: ReturnType<typeof useNavigate>;

  updateActivity: (options: RpcActivityOptions) => Promise<void>;
  clear: () => Promise<void>;
  startRpc: () => Promise<void>;
  stopRpc: () => Promise<void>;

  odyAuth: OdyAuth;
  setOdyAuth: (auth: OdyAuth) => void;

  userData: UserTable;
  setUserData: (self: SelfQuery) => void;

  matchPhase: MatchPhase | null;
  setMatchPhase: (phase: MatchPhase | null) => void;

  currentMatch: CurrentMatchTable | null;
  setCurrentMatch: (phase: CurrentMatchTable | null) => void;

  connectedToOdy: boolean;
  setConnectedStatus: (status: boolean) => void;
}

function App() {
  const [odyAuth, setOdyAuth] = useState<OdyAuth>();
  const [userData, setUserData] = useState<SelfQuery | null>(null);
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('EMatchPhase::Unknown');
  const [currentMatch, setCurrentMatch] = useState<CurrentMatchTable | null>(null);
  const [connectedToOdy, setConnectedStatus] = useState<boolean>(false);
  const navigate = useNavigate();
  const { updateActivity, clear, startRpc, stopRpc } = useDiscordRpc();

  const location = useLocation();
  const showSidebar = !['/', '/home', '/setup'].includes(location.pathname);

  // Debug Page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F9') navigate('/debug');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Current Match Updater
  useEffect(() => {
    const load = () => getCurrentMatch().then(setCurrentMatch);
    load();

    window.addEventListener("currentMatch:changed", load);
    return () => window.removeEventListener("currentMatch:changed", load);
  }, []);

  return (
    <div className="min-h-screen bg-background text-white pt-12">
      <TopBar matchPhase={matchPhase} />
 
      <div className="flex">
        {showSidebar && <Sidebar navigate={navigate} connectedToOdy={connectedToOdy} />}
        <main className={showSidebar ? "flex-1 pl-13" : "flex-1"}>
          <Outlet context={{
            navigate,
            updateActivity, clear, startRpc, stopRpc,
            odyAuth, setOdyAuth,
            userData, setUserData,
            matchPhase, setMatchPhase,
            currentMatch, setCurrentMatch,
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
