import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TRAININGS } from '../../core/objects/trainings';
import type { Awakenings } from '../../types/clarion';
import type { CurrentMatchTable, MatchPlayersTable } from '../../types/database';
import { getClampedPopoverPosition } from '../../core/utilities/popover';

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

function TrainingTile({ awakening, isTaken, isShown }: { awakening: Awakenings; isTaken: boolean; isShown: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hovered && triggerRef.current && popoverRef.current) {
      setPosition(getClampedPopoverPosition(
        triggerRef.current.getBoundingClientRect(),
        popoverRef.current.getBoundingClientRect(),
      ));
    }
  }, [hovered]);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={awakening.image}
        alt={awakening.name}
        className={`w-10 h-10 rounded cursor-pointer transition-all ${isTaken || isShown ? 'grayscale brightness-50' : ''}`}
      />

      <AnimatePresence>
        {hovered && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-90 pointer-events-none"
            style={{ top: position.top, left: position.left }}
          >
            <div className="rounded-lg border border-background-border bg-surface shadow-xl p-3 flex items-center gap-3">
              <img src={awakening.image} alt={awakening.name} className="w-12 h-12 rounded-lg shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-char flex items-center gap-2">
                  {awakening.name}
                  {isTaken && <span className="text-xs font-bold text-red-400">(TAKEN)</span>}
                  {!isTaken && isShown && <span className="text-xs font-bold text-yellow-400">(SHOWN)</span>}
                </p>
                <p className="text-xs text-char-subtle mt-1 leading-snug">
                  {awakening_description[awakening.id] ?? awakening.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AvailableTrainings({ allTrainings, match, players }: Props) {
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

  const available = displayable.filter(a => !takenAwakeningIds.has(a.id) && !shownAwakeningIds.has(a.id));
  const unavailable = displayable.filter(a => takenAwakeningIds.has(a.id) || shownAwakeningIds.has(a.id));

  return (
    <div className="space-y-3">
      <div className="bg-surface-subtle border border-surface-border rounded-xl px-4 py-2 shadow-lg">
        <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
          Available Awakenings
        </p>
        <div className="flex flex-wrap gap-0.5">
          {available.map(awakening => (
            <TrainingTile key={awakening.id} awakening={awakening} isTaken={false} isShown={false} />
          ))}
        </div>
      </div>

      {unavailable.length > 0 && (
        <div className="bg-surface-subtle border border-surface-border rounded-xl px-4 py-2 shadow-lg">
          <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
            Shown Awakenings
          </p>
          <div className="flex flex-wrap gap-1">
            {unavailable.map(awakening => (
              <TrainingTile
                key={awakening.id}
                awakening={awakening}
                isTaken={takenAwakeningIds.has(awakening.id)}
                isShown={shownAwakeningIds.has(awakening.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
