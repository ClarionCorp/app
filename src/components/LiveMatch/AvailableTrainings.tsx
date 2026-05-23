import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getPlayerTrainings } from '../../core/bridgeListener';
import { TRAININGS } from '../../core/objects/trainings';
import type { Awakenings } from '../../types/clarion';

const POLL_MS = 3000;
const HOVER_LEAVE_DELAY = 150;

// training id -> awakening id
const TRAINING_TO_AWAKENING: Record<string, string> = Object.fromEntries(
  Object.entries(TRAININGS)
    .filter(([, info]) => info.awakeningId)
    .map(([id, info]) => [id, info.awakeningId])
);

export function AvailableTrainings({ allTrainings }: { allTrainings: Awakenings[] }) {
  const [claimedAwakeningIds, setClaimedAwakeningIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function refresh() {
      const playerTrainings = await getPlayerTrainings();
      const claimedTrainingIds = new Set(playerTrainings.flatMap(p => p.trainings));
      const awakeningIds = new Set(
        Object.entries(TRAINING_TO_AWAKENING)
          .filter(([trainingId]) => claimedTrainingIds.has(trainingId))
          .map(([, awakeningId]) => awakeningId)
      );
      setClaimedAwakeningIds(awakeningIds);
    }

    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [allTrainings]);

  const displayable = allTrainings
    .filter(a => a.active && !a.gear)
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableCount = displayable.filter(a => !claimedAwakeningIds.has(a.id)).length;
  const hovered = hoveredId ? displayable.find(a => a.id === hoveredId) ?? null : null;
  const hoveredIsTaken = hoveredId ? claimedAwakeningIds.has(hoveredId) : false;

  return (
    <div className="bg-surface border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Available Awakenings in Rotation ({availableCount})
      </p>
      <div
        className="flex flex-wrap gap-1"
        onMouseLeave={() => {
          leaveTimer.current = setTimeout(() => setHoveredId(null), HOVER_LEAVE_DELAY);
        }}
      >
        {displayable.map(awakening => {
          const isTaken = claimedAwakeningIds.has(awakening.id);
          return (
            <div
              key={awakening.id}
              className="relative"
              onMouseEnter={() => {
                if (leaveTimer.current) clearTimeout(leaveTimer.current);
                setHoveredId(awakening.id);
              }}
            >
              <img
                src={awakening.image}
                alt={awakening.name}
                className={`w-10 h-10 rounded cursor-pointer transition-all ${isTaken ? 'grayscale brightness-50' : ''} ${hoveredId && hoveredId !== awakening.id ? 'opacity-40' : 'opacity-100'}`}
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hovered && (
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
                <img src={hovered.image} alt={hovered.name} className={`w-16 h-16 rounded-lg shrink-0 ${hoveredIsTaken ? 'grayscale brightness-50' : ''}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-char flex items-center gap-2">
                    {hovered.name}
                    {hoveredIsTaken && <span className="text-xs font-bold text-red-400">(TAKEN)</span>}
                  </p>
                  <p className="text-xs text-char-subtle mt-1 leading-snug">{hovered.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
