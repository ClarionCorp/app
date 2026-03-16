import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { RankedQuery, SelfQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';

export interface AppContextType {
  playerData: RankedQuery[];
  setPlayerData: (data: RankedQuery[]) => void;
  collectedPlayers: string[];
  setCollectedPlayers: (players: string[]) => void;
  navigate: ReturnType<typeof useNavigate>;

  userData: SelfQuery;
  setUserData: (self: SelfQuery) => void;
}

function App() {
  const [playerData, setPlayerData] = useState<RankedQuery[]>([]);
  const [userData, setUserData] = useState<SelfQuery>();
  const [collectedPlayers, setCollectedPlayers] = useState<string[]>([]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Outlet context={{ playerData, setPlayerData, collectedPlayers, setCollectedPlayers, navigate, userData, setUserData }} />
      <DebugConsole />
    </div>
  );
}

export default App;
