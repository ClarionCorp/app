import { useEffect, useState } from 'react';
import { getCurrentMatch, getUser } from '../../core/database/queries';
import { AiMiAPI, version } from '../../core/constants';

// Add back dynamic coloring when app gets bigger.
// const onlineColor = (n: number) => n >= 100 ? 'text-green-400' : n >= 50 ? 'text-yellow-400' : 'text-red-400';

async function fetchOnlineCount(username: string, gameState: string): Promise<number> {
  const res = await fetch(`${AiMiAPI}/v1/online`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
    body: JSON.stringify({ username, gameState }),
  });
  if (!res.ok) { console.warn(`Failed to send online status!`, JSON.stringify({ username, gameState }, null, 0)) };
  const data = await res.json() as { online: number };
  return data.online;
}

export default function TopBar() {
  const [online, setOnline] = useState(0);
  const [gameState, setGameState] = useState<string | null>(null);

  useEffect(() => {
    async function tick() {
      const match = await getCurrentMatch();
      const state = match?.gameState;
      setGameState(state);

      const user = await getUser();
      const username = user?.username;

      if (state && username) {
        const count = await fetchOnlineCount(username, state);
        setOnline(count);
      }
    }

    tick();
    const interval = setInterval(tick, 300_000); // 5 minutes in ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6 bg-surface-subtle border-b border-background-border">
      {/* Left */}
      <div className="flex items-center gap-4">
        <p className={`text-xs text-char-subtle`}>Online: {online}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-char-subtle">
          v{version} by blals
        </p>
      </div>
    </div>
  );
}
