import { MatchPhase, PHASE_COLORS, PHASE_LABELS } from '../../core/logMonitor';

interface TopBarProps {
  matchPhase: MatchPhase;
}

export default function TopBar({ matchPhase }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6 bg-surface-subtle border-b border-background-border">
      {/* Left */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-char-subtle">0 Online</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-char-subtle">
          Game State:{" "}
          <b className={(PHASE_COLORS as Record<string, string>)[matchPhase ?? ''] ?? 'text-char-subtle'}>
            {(PHASE_LABELS as Record<string, string>)[matchPhase ?? ''] ?? 'Loading'}
          </b>
        </p>
      </div>
    </div>
  );
}