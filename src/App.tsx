import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth, SelfQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import { MatchPhase } from './core/logMonitor';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export interface AppContextType {
  navigate: ReturnType<typeof useNavigate>;

  odyAuth: OdyAuth;
  setOdyAuth: (auth: OdyAuth) => void;

  userData: SelfQuery;
  setUserData: (self: SelfQuery) => void;

  matchPhase: MatchPhase | null;
  setMatchPhase: (phase: MatchPhase | null) => void;

  registeredPlayers: string[];
  setRegisteredPlayers: (players: string[]) => void;
}

function App() {
  const [odyAuth, setOdyAuth] = useState<OdyAuth>();
  const [userData, setUserData] = useState<SelfQuery>();
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('EMatchPhase::Unknown');
  const [registeredPlayers, setRegisteredPlayers] = useState<string[]>([]);
  const navigate = useNavigate();

  const location = useLocation();
  const showSidebar = !['/', '/home'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-surface text-white pt-12">
      <TopBar matchPhase={matchPhase} />
 
      <div className="flex">
        {showSidebar && <Sidebar navigate={navigate} />}
        <main className={showSidebar ? "flex-1 pl-13" : "flex-1"}>
          <Outlet context={{
            navigate,
            odyAuth, setOdyAuth,
            userData, setUserData,
            matchPhase, setMatchPhase,
            registeredPlayers, setRegisteredPlayers,
            }}
          />
        </main>
      </div>
 
      <DebugConsole />
    </div>
  );
}

export default App;
