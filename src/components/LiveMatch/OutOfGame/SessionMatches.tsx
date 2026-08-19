import { useEffect, useState } from 'react';
import { getMatchHistoryByIds, getUser } from '../../../core/database/queries';
import { GameSessionsTable, MatchHistoryTable } from '../../../types/database';
import IndividualMatch from '../../MatchHistory/IndividualMatch';

export function SessionMatches({ session }: { session: GameSessionsTable | null }) {
  const [matches, setMatches] = useState<MatchHistoryTable[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  useEffect(() => {
    getUser().then((u) => setMyPlayerId(u?.playerId ?? null));
  }, []);

  useEffect(() => {
    getMatchHistoryByIds(session?.matchHistories ?? []).then(setMatches);
  }, [session?.matchHistories]);

  const sorted = [...matches].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Session Matches
      </p>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
          No matches played this session yet.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((match) => (
            <IndividualMatch key={match.id} row={match} myPlayerId={myPlayerId} />
          ))}
        </div>
      )}
    </div>
  );
}
