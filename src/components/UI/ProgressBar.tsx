import { motion } from 'framer-motion';

type ProgressBarProps = {
  percent: number | null;
  message?: string;
  indeterminateLabel?: string;
};

export function ProgressBar({ percent, message, indeterminateLabel = 'This may take a moment...' }: ProgressBarProps) {
  const isIndeterminate = percent === null;

  return (
    <div className="flex flex-col gap-2">
      {(message || percent !== null) && (
        <div className="flex items-center justify-between">
          {message && <p className="text-xs text-char-subtle">{message}</p>}
          {percent !== null && (
            <p className="text-xs text-char-subtle tabular-nums ml-auto">{percent}%</p>
          )}
        </div>
      )}

      <div className="h-1.5 rounded-full bg-background-border overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${percent ?? 0}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {isIndeterminate && indeterminateLabel && (
        <p className="text-xs text-char-subtle/60 italic">{indeterminateLabel}</p>
      )}
    </div>
  );
}