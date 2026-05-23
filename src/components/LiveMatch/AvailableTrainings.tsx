import { useEffect, useState } from 'react';
import { getPlayerTrainings } from '../../core/bridgeListener';
import { getTrainingInfo } from '../../core/objects/trainings';

const POLL_MS = 3000;

export function AvailableTrainings({ allTrainings }: { allTrainings: string[] }) {
  const [available, setAvailable] = useState<string[]>(allTrainings);

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

  return (
    <div className="bg-surface border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Available Trainings ({available.length})
      </p>
      <div className="flex flex-wrap gap-1">
        {available.map(id => {
          const info = getTrainingInfo(id);
          if (!info || info.disabled) return null;
          return (
            <div key={id} className="relative group">
              <img src={info.image} alt={info.name} className="w-10 h-10 rounded" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-100 w-56 bg-surface-overlay border border-background-border rounded-xl p-3 pointer-events-none shadow-lg">
                <p className="text-sm font-semibold text-char">{info.name}</p>
                <p className="text-xs text-char-subtle mt-1 leading-snug">{info.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
