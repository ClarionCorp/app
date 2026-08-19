import { useState, useEffect } from 'react';
import { getMapObjectFromID } from '../../core/objects/maps';
import { CurrentMatchTable, MatchPlayersTable } from '../../types/database';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '../UI/Button';
import { StreamOverlayModal } from './StreamOverlay';
import { getQueueObjectFromID } from '../../core/objects/queues';

export function MatchInfo({ match, myPlayer }: { match: CurrentMatchTable | undefined, myPlayer: MatchPlayersTable | undefined }) {
  const ping = myPlayer?.ping;
  const isGood = (ping ?? 0) <= 60;
  const isMid = (ping ?? 0) <= 120;
  const pingColorClass = isGood ? 'text-green-400' : isMid ? 'text-match-mid' : 'text-match-loss';

  const [runningObs, setRunningObs] = useState(false);
  const [runningMeld, setRunningMeld] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    invoke<boolean>('is_process_running', { name: 'obs64.exe' }).then(setRunningObs);
    invoke<boolean>('is_process_running', { name: 'MeldStudio.exe' }).then(setRunningMeld);
  }, []);

  return (
    <div className="bg-surface border border-surface-border rounded-xl px-4 py-2 shadow-lg">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-char-secondary">{getQueueObjectFromID(match?.queue).queueName ?? '—'}</span>
          {match?.map && (
            <span className="text-char-secondary">— {getMapObjectFromID(match.map).mapName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(runningObs || runningMeld) && (
            <Button variant="surface" size="sm" onClick={() => setModalOpen(true)}>
              Stream Overlay
            </Button>
          )}
          {ping != null && ping > 0 && (
            <span className="inline-flex items-center gap-1 text-char-secondary">
              Latency: <span className={pingColorClass}>{ping}ms</span>
            </span>
          )}
        </div>
        <StreamOverlayModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
}
