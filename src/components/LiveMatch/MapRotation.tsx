import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClarionAPI } from '../../core/constants';
import { Map, Maps } from '../../types/clarion';

export function MapRotation() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${ClarionAPI}/v2/tools/maps`)
      .then((r) => r.ok ? r.json() as Promise<Maps> : Promise.reject())
      .then((data) => setMaps(data.active))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface border border-background-border rounded-xl p-4">
      <p className="text-xs uppercase font-semibold tracking-widest text-char-subtle mb-3">
        Current Maps in Rotation
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-surface-overlay border-t-primary animate-spin" />
        </div>
      ) : maps.length === 0 ? (
        <p className="text-center py-8 text-zinc-500 text-sm">No maps in rotation.</p>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
          className="grid grid-cols-3 xl:grid-cols-5 gap-2"
        >
          {maps.map((map) => (
            <motion.div
              key={map.id}
              variants={{ hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.2 } } }}
              className="flex flex-col gap-1.5 rounded-lg p-2 bg-surface hover:bg-surface-overlay transition-colors duration-200"
            >
              <div className="w-full aspect-video overflow-hidden rounded-md bg-background-border">
                <img
                  src={map.imageUrl}
                  alt={map.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-zinc-400 truncate leading-tight text-center">
                {map.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
