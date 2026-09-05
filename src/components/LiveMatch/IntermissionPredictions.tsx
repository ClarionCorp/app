import clsx from 'clsx';
import { MatchPlayersTable } from '../../types/database';
import BasicPopover from '../UI/BasicPopover';

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function IntermissionPredictions({ players }: { players: MatchPlayersTable[] }) {
  const myTeamNum = players.find(p => p.isMe)?.teamNum ?? 1;

  const byXpDesc = (a: MatchPlayersTable, b: MatchPlayersTable) => (b.gainedXp ?? 0) - (a.gainedXp ?? 0);
  const team1 = players.filter(p => p.teamNum === 1).sort(byXpDesc);
  const team2 = players.filter(p => p.teamNum === 2).sort(byXpDesc);

  const predicted: MatchPlayersTable[] = [];
  for (let tier = 0; tier < Math.max(team1.length, team2.length); tier++) {
    const p1 = team1[tier];
    const p2 = team2[tier];
    if (p1 && p2) predicted.push(...(byXpDesc(p1, p2) <= 0 ? [p1, p2] : [p2, p1]));
    else if (p1) predicted.push(p1);
    else if (p2) predicted.push(p2);
  }

  const slots: (MatchPlayersTable | null)[] = [...predicted, ...Array(Math.max(0, 6 - predicted.length)).fill(null)];

  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Intermission Pick Order
      </p>
      <div className="relative flex items-center h-12 short:h-10 px-2">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#e91e8c]/50 rounded-full mx-2" />
        <div className="relative w-full flex justify-between px-8">
          {slots.map((player, index) => {
            if (!player) return <div key={`dummy-${index}`} className="w-12 h-12 shrink-0 invisible" />;

            const borderClass = player.isMe
              ? 'border-green-400'
              : player.teamNum === myTeamNum
                ? 'border-blue-500'
                : 'border-red-500';

            return (
              <BasicPopover
                key={player.username}
                displayText={`${player.username} will be picking ${ordinal(index + 1)}`}
              >
                <div className={clsx('w-12 h-12 rounded-full overflow-hidden shrink-0 border-[3px] shadow-md', borderClass)}>
                  {player.charId ? (
                    <img
                      src={`/characters/portrait/${player.charId}.webp`}
                      alt={player.charName ?? ''}
                      className="w-full h-full object-cover bg-surface"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-overlay" />
                  )}
                </div>
              </BasicPopover>
            );
          })}
        </div>
      </div>
    </div>
  );
}
