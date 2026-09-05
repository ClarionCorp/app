import { useEffect, useRef, useState } from 'react';
import { getCurrentMatch, getMyMatchPlayer } from '../../core/database/queries';
import { getMapObjectFromID } from '../../core/objects/maps';
import { getQueueObjectFromID } from '../../core/objects/queues';
import { getGameStatus } from '../../core/objects/gameStates';
import { CurrentMatchTable, MatchPlayersTable } from '../../types/database';

const queueStateLabels: Record<string, string> = {
  Queued: 'Searching',
  FoundMatch: 'Match Found',
  StartingGame: 'Starting',
};

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TopBarMatchStatus() {
  const [match, setMatch] = useState<CurrentMatchTable | null>(null);
  const [myPlayer, setMyPlayer] = useState<MatchPlayersTable | null>(null);
  const [now, setNow] = useState(() => new Date());
  const queueEnteredAt = useRef<Date | null>(null);

  useEffect(() => {
    async function tick() {
      setMatch(await getCurrentMatch());
      setMyPlayer(await getMyMatchPlayer());
    }
    tick();
    const interval = setInterval(tick, 2_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(interval);
  }, []);

  const gameStatus = getGameStatus(match?.gameState);
  const showOutOfGame =
    match?.queueState === 'StartingGame' ||
    match?.queueState === 'FoundMatch' ||
    (gameStatus !== 'IN_GAME' && gameStatus !== 'SETUP' && gameStatus !== 'STARTING');

  const isQueueing = match?.queueState === 'Queued' || match?.queueState === 'FoundMatch' || match?.queueState === 'StartingGame';
  const isInMatch = !!match && !showOutOfGame;

  useEffect(() => {
    if (isQueueing) {
      if (!queueEnteredAt.current) queueEnteredAt.current = new Date();
    } else {
      queueEnteredAt.current = null;
    }
  }, [isQueueing]);

  if (!match || (!isQueueing && !isInMatch)) return null;

  const queueName = getQueueObjectFromID(match.queue).queueName;

  if (isInMatch) {
    const ping = myPlayer?.ping;
    const isGood = (ping ?? 0) <= 60;
    const isMid = (ping ?? 0) <= 120;
    const pingColorClass = isGood ? 'text-green-400' : isMid ? 'text-match-mid' : 'text-match-loss';

    const matchSeconds = match.startedAt
      ? Math.max(0, Math.floor((now.getTime() - new Date(match.startedAt).getTime()) / 1000))
      : null;

    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 text-sm text-char-subtle select-none pointer-events-none leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-char-secondary">{queueName}</span>
          <span className="text-char-secondary">— {getMapObjectFromID(match.map).mapName}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span>{matchSeconds != null ? formatDuration(matchSeconds) : '--:--'}</span>
          {ping != null && ping > 0 && (
            <>
              (<span className={pingColorClass}>{ping}ms</span>)
            </>
          )}
        </div>
      </div>
    );
  }

  const queueSeconds = queueEnteredAt.current
    ? Math.max(0, Math.floor((now.getTime() - queueEnteredAt.current.getTime()) / 1000))
    : 0;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 text-sm text-char-subtle select-none pointer-events-none leading-tight">
      <span className="font-semibold text-char-secondary">{queueName}</span>
      <div className="flex items-center gap-1 text-xs">
        <span>{queueStateLabels[match.queueState ?? ''] ?? 'Queued'}</span>
        <span className="opacity-60">{formatDuration(queueSeconds)}</span>
      </div>
    </div>
  );
}
