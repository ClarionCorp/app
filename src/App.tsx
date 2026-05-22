import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import Sidebar from './components/Navigation/Sidebar';
import TopBar from './components/Navigation/TopBar';
import { getPlayerAwakenings, onGameStateChanged, onPlayersChanged, onPostGameStatsChanged, refreshLatestMatchStart } from './core/bridgeListener';
import { getCurrentMatch, getUser, insertMatchHistory, setMatchPlayers, upsertCurrentMatch, getMatchPlayers } from './core/database/queries';
import { GameStateJSON, mergeMatchPlayers, PlayerFinderJSON, PostGameStatsJSON } from './types/ue4ss';
import { tryUpdateDiscordRPC } from './core/utilities/discord';

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

  // Rust Mod Bridge Listeners
  useEffect(() => {
  const unlistens = Promise.all([
    onPlayersChanged(async (payload) => {
      console.debug(`Player Status Changed!`)
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as PlayerFinderJSON;
      const currentUser = await getUser();

      await setMatchPlayers(data.players.map(p => ({
        username: p.name,
        teamNum: p.team,
        role: p.role,
        charName: p.character_name,
        charId: p.character_id,
        isMe: p.name === currentUser?.username,
        rating: p.name === currentUser?.username ? currentUser.rating : 0,
        xp: p.level,
      })));
    }),
    onGameStateChanged(async (payload) => {
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as GameStateJSON;
      await refreshLatestMatchStart();

      let cMatch = await upsertCurrentMatch({
        gameState: data.phase,
        map: data.map,
        queue: data.queue,
        teamNum: data.my_team,
        teamOnePts: data.t1_goals,
        teamTwoPts: data.t2_goals,
        teamOneSets: data.t1_sets,
        teamTwoSets: data.t2_sets,
        // startedAt: data.phase == 'VersusScreen' ? new Date() : undefined
      });

      await tryUpdateDiscordRPC(cMatch); // Ask Discord Helper to try and update
    }),
    onPostGameStatsChanged(async (payload) => {
      if (payload.kind === 'removed' || !payload.content) return;
      console.debug(`Match Ended! Saving...`)
      await refreshLatestMatchStart();
      const stats = JSON.parse(payload.content) as PostGameStatsJSON;

      const [match, currentUser, matchPlayers, awakenings] = await Promise.all([
        getCurrentMatch(),
        getUser(),
        getMatchPlayers(),
        getPlayerAwakenings(),
      ]);
      if (!match || !currentUser) return;

      const players = mergeMatchPlayers(matchPlayers, stats, awakenings);
      const myPlayer = players.find(p => p.name === currentUser.username);
      if (!myPlayer) return;

      const myTeam = match.teamNum ?? 1;
      const myScore = myTeam === 1 ? (match.teamOneSets ?? 0) : (match.teamTwoSets ?? 0);
      const enemyScore = myTeam === 1 ? (match.teamTwoSets ?? 0) : (match.teamOneSets ?? 0);

      await insertMatchHistory({
        players,
        mapId: match.map ?? '',
        duration: diffSeconds(match.startedAt!, new Date()),
        myTeam,
        t1_sets: match.teamOneSets ?? 0,
        t2_sets: match.teamTwoSets ?? 0,
        wonGame: myScore > enemyScore,
        createdAt: new Date(),
      });
    }),
  ]);

  return () => { unlistens.then((fns) => fns.forEach((fn) => fn())); };
}, []);

  return (
    <div className="min-h-screen bg-background text-white pt-12">
      <TopBar />
 
      <div className="flex">
        {showSidebar && <Sidebar navigate={navigate} connectedToOdy={connectedToOdy} />}
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
