import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../App';
import { getPhaseGroup, PHASE_COLORS, PHASE_LABELS } from '../core/logMonitor';

interface DebugRowProps {
  label: string;
  value: React.ReactNode;
}

function DebugRow({ label, value }: DebugRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-background-border last:border-0">
      <span className="text-xs text-char-subtle">{label}</span>
      <span className="text-xs font-medium text-char text-right max-w-[60%] truncate">{value}</span>
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

export default function DebugPage() {
  const {
    matchPhase,
    currentMatch
  } = useOutletContext<AppContextType>();

  const inGame = matchPhase ? getPhaseGroup(matchPhase) !== 'out_of_game' : false;

  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg font-bold text-char mb-1">Debug</h1>
        <p className="text-xs text-char-subtle mb-6">Live game state from log monitor</p>

        {/* Match State */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4">
          <SectionHeader title="Match State" />
          <DebugRow label="Phase" value={
            <span className={(PHASE_COLORS as Record<string, string>)[matchPhase ?? ''] ?? 'text-char-subtle'}>
              {(PHASE_LABELS as Record<string, string>)[matchPhase ?? ''] ?? 'Unknown'}
            </span>
          } />
          <DebugRow label="Raw Phase" value={matchPhase ?? '—'} />
          <DebugRow label="Level" value={inGame ? (currentMatch?.level ?? '—') : '—'} />
          <DebugRow label="My Character" value={inGame ? (currentMatch?.myCharacter ?? '—') : '—'} />
          <DebugRow label="My Team" value={inGame ? (currentMatch?.myTeam ?? '—') : '—'} />
        </div>

        {/* Score */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3">
          <SectionHeader title="Score" />
          <DebugRow label="Team One Points" value={inGame ? currentMatch?.teamOnePts : '—'} />
          <DebugRow label="Team Two Points" value={inGame ? currentMatch?.teamTwoPts : '—'} />
          <DebugRow label="Team One Sets" value={inGame ? currentMatch?.teamOneSets : '—'} />
          <DebugRow label="Team Two Sets" value={inGame ? currentMatch?.teamTwoSets : '—'} />
        </div>

        {/* Players */}
        <div className="bg-surface-subtle border border-background-border rounded-xl px-4 mt-3">
          <SectionHeader title={`Registered Players (${currentMatch?.playerNames.length})`} />
          {currentMatch?.playerNames.length === 0 ? (
            <div className="py-3">
              <span className="text-xs text-char-subtle">None yet</span>
            </div>
          ) : (
            currentMatch?.playerNames.map((p, i) => (
              <DebugRow key={p} label={`Player ${i + 1}`} value={p} />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}