import { getMapObjectFromID } from '../../core/objects/maps';
import { CurrentMatchTable, MatchPlayersTable } from '../../types/database';

export function MatchInfo({ match, myPlayer }: { match: CurrentMatchTable | undefined, myPlayer: MatchPlayersTable | undefined }) {
  const ping = myPlayer?.ping;
  const isGood = (ping ?? 0) <= 60;
  const isMid = (ping ?? 0) <= 120;
  const pingColorClass = isGood ? 'text-match-win/75' : isMid ? 'text-match-mid' : 'text-match-loss';

  return (
    <div className="bg-surface border border-surface-border rounded-xl px-4 py-2 shadow-lg">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-char-secondary">{match?.queue ?? '—'}</span>
          {match?.map && (
            <span className="text-char-secondary">— {getMapObjectFromID(match.map).mapName}</span>
          )}
        </div>
        {ping != null && ping > 0 && (
          <span className="inline-flex items-center gap-1 text-char-secondary">
            Latency: <span className={pingColorClass}>{ping}ms</span>
          </span>
        )}
      </div>
    </div>
  );
}
