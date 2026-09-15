import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { cardMotion } from './motion';

export default function FoundMatch({ queue }: { queue: string; }) {
  return (
    <motion.div
      {...cardMotion}
      className="relative min-w-64 w-fit overflow-hidden rounded-xl border-2 border-emerald-400/80 bg-black/80 px-4 py-3 shadow-xl shadow-emerald-500/20"
    >
      <style>{`
        @keyframes found-match-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.08); }
        }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(52,211,153,0.6), transparent 70%)',
          animation: 'found-match-pulse 1.8s ease-in-out infinite',
        }}
      />
      <div className="relative flex flex-col gap-0.5">
        <span className="text-white font-bold text-2xl leading-tight">Queued {queue}</span>
        <div className="flex items-center gap-2 text-white/70 text-lg">
          <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
            <CheckCircleIcon size={18} weight="fill" />
            Match Found!
          </span>
        </div>
      </div>
    </motion.div>
  );
}
