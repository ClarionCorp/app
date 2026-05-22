import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OdyAuth } from './types/odyssey';
import { DebugConsole } from './components/DebugConsole';
import Sidebar from './components/Navigation/Sidebar';
import TopBar from './components/Navigation/TopBar';
import { onGameStateChanged, onPlayersChanged, onPostGameStatsChanged } from './core/bridgeListener';
import { getMyMatchPlayer, getCurrentMatch, getUser, insertMatchHistory, setMatchPlayers, upsertCurrentMatch } from './core/database/queries';
import { GameStateJSON, PlayerFinderJSON, PostGameStatsJSON } from './types/ue4ss';
import { tryUpdateDiscordRPC } from './core/utilities/discord';

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
        rating: p.name === currentUser?.username ? currentUser.rating : 0
      })));
    }),
    onGameStateChanged(async (payload) => {
      console.debug(`Game State Changed!`)
      if (payload.kind === 'removed' || !payload.content) return;
      const data = JSON.parse(payload.content) as GameStateJSON;

      await upsertCurrentMatch({
        gameState: data.phase,
        map: data.map,
        queue: data.queue,
        teamNum: data.my_team,
        teamOnePts: data.t1_goals,
        teamTwoPts: data.t2_goals,
        teamOneSets: data.t1_sets,
        teamTwoSets: data.t2_sets,
        startedAt: new Date(),
      });

      await tryUpdateDiscordRPC(data); // Ask Discord Helper to try and update
    }),
    onPostGameStatsChanged(async (payload) => {
      console.debug(`PGSM Changed!`)
      if (payload.kind === 'removed' || !payload.content) return;
      const stats = JSON.parse(payload.content) as PostGameStatsJSON;

      const [match, currentUser, myPlayer] = await Promise.all([
        getCurrentMatch(),
        getUser(),
        getMyMatchPlayer(),
      ]);
      if (!match || !currentUser) return;

      const myEntry = stats.find(s => s.name === currentUser.username);
      if (!myEntry) return;

      const myTeam = match.teamNum ?? 1;
      const myScore = myTeam === 1 ? (match.teamOneSets ?? 0) : (match.teamTwoSets ?? 0);
      const enemyScore = myTeam === 1 ? (match.teamTwoSets ?? 0) : (match.teamOneSets ?? 0);

      await insertMatchHistory({
        players: stats.map(s => s.name),
        mapId: match.map ?? '',
        characterId: myPlayer?.charId ?? '',
        duration: 0,
        myScore,
        enemyScore,
        wonGame: myScore > enemyScore,
        goals:  parseInt(myEntry.goals),
        assists: parseInt(myEntry.assists),
        saves: parseInt(myEntry.saves),
        kos: parseInt(myEntry.kos),
        damage: parseInt(myEntry.damage),
        shots: parseInt(myEntry.shots),
        redirects: parseInt(myEntry.redirects),
        orbs: parseInt(myEntry.orbs),
        allGameStats: stats,
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
