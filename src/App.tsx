import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RankedQuery, SelfQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import { MatchPhase } from './core/logMonitor';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export interface AppContextType {
  playerData: RankedQuery[];
  setPlayerData: (data: RankedQuery[]) => void;
  collectedPlayers: string[];
  setCollectedPlayers: (players: string[]) => void;
  navigate: ReturnType<typeof useNavigate>;

  userData: SelfQuery;
  setUserData: (self: SelfQuery) => void;

  matchPhase: MatchPhase | null;
  setMatchPhase: (phase: MatchPhase | null) => void;

  registeredPlayers: string[];
  setRegisteredPlayers: (players: string[]) => void;
}

function App() {
  const [playerData, setPlayerData] = useState<RankedQuery[]>([]);
  const [userData, setUserData] = useState<SelfQuery>();
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('EMatchPhase::Unknown');
  const [collectedPlayers, setCollectedPlayers] = useState<string[]>([]);
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
            playerData, setPlayerData,
            collectedPlayers, setCollectedPlayers,
            navigate,
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
