import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentMatch, getMatchPlayers } from '../core/database/queries';
import type { CurrentMatchTable, MatchPlayersTable } from '../types/database';
import { TRAININGS } from '../core/objects/trainings';

const POLL_MS = 2000;

function DebugRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-background-border last:border-0">
      <span className="text-xs text-char-subtle">{label}</span>
      <span className="text-xs font-medium text-char text-right max-w-[60%] truncate">{value ?? '—'}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-sm uppercase font-semibold tracking-widest text-char-subtle mb-1 mt-5 first:mt-0 py-2">
      {title}
    </p>
  );
}

const activeTrainings = Object.entries(TRAININGS).filter(([, info]) => !info.disabled);

export default function DebugPage() {
  const [match, setMatch] = useState<CurrentMatchTable | null>(null);
  const [players, setPlayers] = useState<MatchPlayersTable[]>([]);

  useEffect(() => {
    async function poll() {
      const [m, p] = await Promise.all([getCurrentMatch(), getMatchPlayers()]);
      setMatch(m);
      setPlayers(p);
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg font-bold text-char mb-1">Debug</h1>
        <p className="text-xs text-char-subtle mb-6">Polling every {POLL_MS / 1000}s</p>

        {/* Match State */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4">
          <SectionHeader title="Match State" />
          <DebugRow label="Game State"  value={match?.gameState} />
          <DebugRow label="Map"         value={match?.map} />
          <DebugRow label="Queue"       value={match?.queue} />
          <DebugRow label="My Team"     value={match?.teamNum} />
          <DebugRow label="Started At"  value={match?.startedAt?.toLocaleTimeString()} />
        </div>

        {/* Score */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3">
          <SectionHeader title="Score" />
          <DebugRow label="Team 1 Points" value={match?.teamOnePts} />
          <DebugRow label="Team 2 Points" value={match?.teamTwoPts} />
          <DebugRow label="Team 1 Sets"   value={match?.teamOneSets} />
          <DebugRow label="Team 2 Sets"   value={match?.teamTwoSets} />
        </div>

        {/* Players */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3">
          <SectionHeader title={`Players (${players.length})`} />
          {players.length === 0 ? (
            <div className="py-3">
              <span className="text-xs text-char-subtle">None yet</span>
            </div>
          ) : (
            players.map((p) => (
              <DebugRow
                key={p.username}
                label={`${p.username}${p.isMe ? ' (me)' : ''}`}
                value={`T${p.teamNum} · ${p.role ?? '?'} · ${p.charName ?? '?'}`}
              />
            ))
          )}
        </div>

        {/* Trainings */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3 pb-4">
          <SectionHeader title={`Trainings (${activeTrainings.length})`} />
          <div className="grid grid-cols-6 gap-3">
            {activeTrainings.map(([id, info]) => (
              <div key={id} className="flex flex-col items-center gap-1">
                <img src={info.image} alt={info.name} className="w-10 h-10 rounded" />
                <span className="text-[10px] text-char text-center leading-tight">{info.name || id}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
