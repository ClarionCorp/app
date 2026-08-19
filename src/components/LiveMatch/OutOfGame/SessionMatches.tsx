export function SessionMatches() {
  return (
    <div className="bg-surface border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Session Matches
      </p>

      <div className="flex items-center justify-center rounded-lg border border-dashed border-background-border text-zinc-600 text-sm min-h-32">
        Match history for this session will appear here.
      </div>
    </div>
  );
}
