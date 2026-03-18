import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth, SelfQuery } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import { MatchPhase } from './core/logMonitor';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { RpcActivityOptions, useDiscordRpc } from './core/discord';

export interface AppContextType {
  navigate: ReturnType<typeof useNavigate>;

  updateActivity: (options: RpcActivityOptions) => Promise<void>;
  clear: () => Promise<void>;
  startRpc: () => Promise<void>;
  stopRpc: () => Promise<void>;

  odyAuth: OdyAuth;
  setOdyAuth: (auth: OdyAuth) => void;

  userData: SelfQuery;
  setUserData: (self: SelfQuery) => void;

  matchPhase: MatchPhase | null;
  setMatchPhase: (phase: MatchPhase | null) => void;

  registeredPlayers: string[];
  setRegisteredPlayers: React.Dispatch<React.SetStateAction<string[]>>;

  currentLevel: string | null;
  setCurrentLevel: (v: string | null) => void;
  myCharacter: string | null;
  setMyCharacter: (v: string | null) => void;
  teamOnePoints: number;
  setTeamOnePoints: (v: number) => void;
  teamTwoPoints: number;
  setTeamTwoPoints: (v: number) => void;
  teamOneSets: number;
  setTeamOneSets: (v: number) => void;
  teamTwoSets: number;
  setTeamTwoSets: (v: number) => void;
  myTeam: string | null;
  setMyTeam: (v: string | null) => void;
  myCurrentRating: number | null;
  setCurrentRating: (v: number | null) => void;

  currentLevelRef: RefObject<string | null>;
  myCharacterRef: RefObject<string | null>;
  myTeamRef: RefObject<string | null>;
  teamOnePointsRef: RefObject<number>;
  teamTwoPointsRef: RefObject<number>;
  teamOneSetsRef: RefObject<number>;
  teamTwoSetsRef: RefObject<number>;
  myCurrentRatingRef: RefObject<number>;
}

function App() {
  const [odyAuth, setOdyAuth] = useState<OdyAuth>();
  const [userData, setUserData] = useState<SelfQuery>();
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('EMatchPhase::Unknown');
  const [registeredPlayers, setRegisteredPlayers] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [myCharacter, setMyCharacter] = useState<string | null>(null);
  const [teamOnePoints, setTeamOnePoints] = useState<number>(0);
  const [teamTwoPoints, setTeamTwoPoints] = useState<number>(0);
  const [teamOneSets, setTeamOneSets] = useState<number>(0);
  const [teamTwoSets, setTeamTwoSets] = useState<number>(0);
  const [myCurrentRating, setCurrentRating] = useState<number>(0);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const navigate = useNavigate();
  const { updateActivity, clear, startRpc, stopRpc } = useDiscordRpc();

  const currentLevelRef = useRef<string | null>(null);
  const myCharacterRef = useRef<string | null>(null);
  const myTeamRef = useRef<string | null>(null);
  const teamOnePointsRef = useRef<number>(0);
  const teamTwoPointsRef = useRef<number>(0);
  const teamOneSetsRef = useRef<number>(0);
  const teamTwoSetsRef = useRef<number>(0);
  const myCurrentRatingRef = useRef<number>(0);

  const location = useLocation(); // Remove these when they are no longer 'coming soon'.
  const showSidebar = !['/', '/home', '/cgm', '/cqm', '/account', '/mods'].includes(location.pathname);

  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);
  useEffect(() => { myCharacterRef.current = myCharacter; }, [myCharacter]);
  useEffect(() => { myTeamRef.current = myTeam; }, [myTeam]);
  useEffect(() => { teamOnePointsRef.current = teamOnePoints; }, [teamOnePoints]);
  useEffect(() => { teamTwoPointsRef.current = teamTwoPoints; }, [teamTwoPoints]);
  useEffect(() => { teamOneSetsRef.current = teamOneSets; }, [teamOneSets]);
  useEffect(() => { teamTwoSetsRef.current = teamTwoSets; }, [teamTwoSets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F9') navigate('/debug');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // This whole file is a fuckin mess but idk how to fix it so whatever

  return (
    <div className="min-h-screen bg-surface text-white pt-12">
      <TopBar matchPhase={matchPhase} />
 
      <div className="flex">
        {showSidebar && <Sidebar navigate={navigate} />}
        <main className={showSidebar ? "flex-1 pl-13" : "flex-1"}>
          <Outlet context={{
            navigate,
            updateActivity, clear, startRpc, stopRpc,
            odyAuth, setOdyAuth,
            userData, setUserData,
            matchPhase, setMatchPhase,
            registeredPlayers, setRegisteredPlayers,
            currentLevel, setCurrentLevel, currentLevelRef,
            myCharacter, setMyCharacter, myCharacterRef,
            teamOnePoints, setTeamOnePoints, teamOnePointsRef,
            teamTwoPoints, setTeamTwoPoints, teamTwoPointsRef,
            teamOneSets, setTeamOneSets, teamOneSetsRef,
            teamTwoSets, setTeamTwoSets, teamTwoSetsRef,
            myTeam, setMyTeam, myTeamRef,
            myCurrentRating, setCurrentRating, myCurrentRatingRef,
            }}
          />
        </main>
      </div>
 
      <DebugConsole />
    </div>
  );
}

export default App;
