import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TRAININGS } from '../../core/objects/trainings';
import type { Awakenings } from '../../types/clarion';
import type { CurrentMatchTable, MatchPlayersTable } from '../../types/database';

// training id -> awakening id
const training_to_awakening: Record<string, string> = Object.fromEntries(
  Object.entries(TRAININGS)
    .filter(([, info]) => info.awakeningId)
    .map(([id, info]) => [id, info.awakeningId])
);

// awakening id -> description
const awakening_description: Record<string, string> = Object.fromEntries(
  Object.values(TRAININGS)
    .filter(info => info.awakeningId && info.description)
    .map(info => [info.awakeningId, info.description])
);

interface Props {
  allTrainings: Awakenings[];
  match: CurrentMatchTable | null | undefined;
  players: MatchPlayersTable[];
}

export function AvailableTrainings({ allTrainings, match, players }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shownAwakeningIds = new Set(
    (match?.trainings ?? [])
      .map(id => training_to_awakening[id])
      .filter(Boolean)
  );

  const takenAwakeningIds = new Set(
    players
      .flatMap(p => p.trainings)
      .map(id => training_to_awakening[id])
      .filter(Boolean)
  );

  const displayable = allTrainings
    .filter(a => a.active && !a.gear)
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableCount = displayable.filter(a => !takenAwakeningIds.has(a.id)).length;
  const hovered = hoveredId ? displayable.find(a => a.id === hoveredId) ?? null : null;
  const hoveredIsTaken = hoveredId ? takenAwakeningIds.has(hoveredId) : false;
  const hoveredIsShown = hoveredId ? shownAwakeningIds.has(hoveredId) : false;

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-4 shadow-lg">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Available Awakenings in Rotation ({availableCount})
      </p>
      <div
        className="flex flex-wrap gap-1 short:gap-0"
        onMouseLeave={() => {
          leaveTimer.current = setTimeout(() => setHoveredId(null), 150); // 150ms delay
        }}
      >
        {displayable.map(awakening => {
          const isTaken = takenAwakeningIds.has(awakening.id);
          const isShown = shownAwakeningIds.has(awakening.id);
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
                className={`w-10 h-10 rounded cursor-pointer transition-all ${isTaken || isShown ? 'grayscale brightness-50' : ''} ${hoveredId && hoveredId !== awakening.id ? 'opacity-40' : 'opacity-100'}`}
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
                <img src={hovered.image} alt={hovered.name} className={`w-16 h-16 rounded-lg shrink-0 ${hoveredIsTaken || hoveredIsShown ? 'grayscale brightness-50' : ''}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-char flex items-center gap-2">
                    {hovered.name}
                    {hoveredIsTaken && <span className="text-xs font-bold text-red-400">(TAKEN)</span>}
                    {!hoveredIsTaken && hoveredIsShown && <span className="text-xs font-bold text-yellow-400">(SHOWN)</span>}
                  </p>
                  <p className="text-xs text-char-subtle mt-1 leading-snug">{awakening_description[hovered.id] ?? hovered.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
