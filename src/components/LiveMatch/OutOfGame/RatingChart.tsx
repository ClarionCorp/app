import { GameSessionsTable } from '../../../types/database';

export function RatingChart({ session }: { session: GameSessionsTable | null }) {
  return (
    <div className="bg-surface border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Rating This Session
      </p>

      <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
        {session
          ? `${session.endOfMatchLPs.length} data point(s) this session.`
          : 'Rating chart will appear here.'}
      </div>
    </div>
  );
}
