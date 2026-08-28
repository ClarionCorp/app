import clsx from 'clsx';
import { MatchPlayersTable } from '../../types/database';

const MY_COLOR = '#25cf0e';
const ALLY_COLOR = '#3b82f6';
const ENEMY_COLOR = '#ef4444';

function getBarColor(player: MatchPlayersTable, myTeamNum: number | null) {
  if (player.isMe) return MY_COLOR;
  if (myTeamNum != null && player.teamNum === myTeamNum) return ALLY_COLOR;
  return ENEMY_COLOR;
}

export function XPLeaderboard({ players }: { players: MatchPlayersTable[] }) {
  if (players.length === 0) {
    return (
      <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
        <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
          Top XP Gainers
        </p>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
          No recent player data yet.
        </div>
      </div>
    );
  }

  const myTeamNum = players.find(p => p.isMe)?.teamNum ?? null;
  const sorted = [...players].sort((a, b) => (b.gainedXp ?? 0) - (a.gainedXp ?? 0));
  const maxXp = Math.max(1, ...sorted.map(p => p.gainedXp ?? 0));

  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Most XP Gained This Set (weighs pick order)
      </p>

      <div className="space-y-2.5">
        {sorted.map((player, index) => {
          const xp = player.gainedXp ?? 0;
          const pct = Math.max(4, (xp / maxXp) * 100);
          const color = getBarColor(player, myTeamNum);

          return (
            <div key={player.username} className="flex items-center gap-2">
              <span className="w-3 shrink-0 text-xs font-semibold text-char-subtle text-right">
                {index + 1}
              </span>

              <div
                className="w-7 h-7 rounded-full overflow-hidden shrink-0 border-2"
                style={{ borderColor: color }}
              >
                {player.charId ? (
                  <img
                    src={`/characters/portrait/${player.charId}.webp`}
                    alt=""
                    className="w-full h-full object-cover bg-surface"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-overlay" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className={clsx(
                    'text-xs font-medium truncate',
                    player.isMe ? 'text-char' : 'text-char-secondary'
                  )}>
                    {player.username}
                  </span>
                  <span className="text-xs font-semibold text-char-subtle shrink-0">
                    {xp.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-overlay overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
