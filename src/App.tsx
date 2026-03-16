import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { RankedQuery, SelfQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import { MatchPhase, PHASE_COLORS, PHASE_LABELS } from './core/logMonitor';

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

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6 bg-surface-subtle border-b border-background-border">
        {/* Left */}
        <div className="flex items-center gap-4">
          <p className="text-xs text-char-subtle">0 Online</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <p className="text-xs text-char-subtle">
            Game State:{" "}
            <b className={matchPhase ? (PHASE_COLORS[matchPhase] ?? 'text-char-subtle') : 'text-char-subtle'}>
              {matchPhase ? (PHASE_LABELS[matchPhase] ?? 'Loading') : 'Loading'}
            </b>
          </p>
        </div>
      </div>

      <Outlet context={{
        playerData, setPlayerData,
        collectedPlayers, setCollectedPlayers,
        navigate,
        userData, setUserData,
        matchPhase, setMatchPhase,
        registeredPlayers, setRegisteredPlayers,
        }}
      />
      <DebugConsole />
    </div>
  );
}

export default App;
