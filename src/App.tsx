import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { RankedQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';

export interface AppContextType {
  playerData: RankedQuery[];
  setPlayerData: (data: RankedQuery[]) => void;
  collectedPlayers: string[];
  setCollectedPlayers: (players: string[]) => void;
  navigate: ReturnType<typeof useNavigate>;
}

function App() {
  const [playerData, setPlayerData] = useState<RankedQuery[]>([]);
  const [collectedPlayers, setCollectedPlayers] = useState<string[]>([]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Outlet context={{ playerData, setPlayerData, collectedPlayers, setCollectedPlayers, navigate }} />
      <DebugConsole />
    </div>
  );
}

export default App;
