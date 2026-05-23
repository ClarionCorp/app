import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getPlayerTrainings } from '../../core/bridgeListener';
import { getTrainingInfo } from '../../core/objects/trainings';

const POLL_MS = 3000;
const HOVER_LEAVE_DELAY = 150;

export function AvailableTrainings({ allTrainings }: { allTrainings: string[] }) {
  const [available, setAvailable] = useState<string[]>(allTrainings);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function refresh() {
      const playerTrainings = await getPlayerTrainings();
      const claimed = new Set(playerTrainings.flatMap(p => p.trainings));
      setAvailable(allTrainings.filter(id => !claimed.has(id)));
    }

    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [allTrainings]);

  const displayable = available
    .filter(id => {
      const info = getTrainingInfo(id);
      return info && !info.disabled;
    })
    .sort((a, b) => {
      const nameA = getTrainingInfo(a)?.name ?? a;
      const nameB = getTrainingInfo(b)?.name ?? b;
      return nameA.localeCompare(nameB);
    });

  const hoveredInfo = hoveredId ? getTrainingInfo(hoveredId) : null;

  return (
    <div className="bg-surface border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Available Trainings ({displayable.length})
      </p>
      <div
        className="flex flex-wrap gap-1"
        onMouseLeave={() => {
          leaveTimer.current = setTimeout(() => setHoveredId(null), HOVER_LEAVE_DELAY);
        }}
      >
        {displayable.map(id => {
          const info = getTrainingInfo(id)!;
          return (
            <div
              key={id}
              className="relative"
              onMouseEnter={() => {
                if (leaveTimer.current) clearTimeout(leaveTimer.current);
                setHoveredId(id);
              }}
            >
              <img
                src={info.image}
                alt={info.name}
                className={`w-10 h-10 rounded transition-opacity cursor-pointer ${hoveredId && hoveredId !== id ? 'opacity-40' : 'opacity-100'}`}
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hoveredInfo && (
          <motion.div
            key="panel"
            className="border-t border-background-border overflow-hidden"
            initial={{ height: 0, marginTop: 0, paddingTop: 0 }}
            animate={{ height: 72, marginTop: 12, paddingTop: 12 }}
            exit={{ height: 0, marginTop: 0, paddingTop: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={hoveredId}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <img src={hoveredInfo.image} alt={hoveredInfo.name} className="w-16 h-16 rounded-lg shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-char">{hoveredInfo.name}</p>
                  <p className="text-xs text-char-subtle mt-1 leading-snug">{hoveredInfo.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
