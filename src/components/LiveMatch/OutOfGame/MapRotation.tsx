import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClarionAPI } from '../../../core/constants';
import { Map, Maps } from '../../../types/clarion';
import { getMapObjectFromCCID } from '../../../core/objects/maps';

function MapTile({ map }: { map: Map }) {
  const mapInfo = getMapObjectFromCCID(map.id);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hovered && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    }
  }, [hovered]);

  return (
    <motion.div
      ref={triggerRef}
      variants={{ hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.2 } } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col gap-1.5 rounded-lg p-2 hover:bg-surface-overlay transition-colors duration-200"
    >
      <div className="w-full aspect-video overflow-hidden rounded-md bg-background-border border-surface-border border shadow-md">
        <img
          src={map.imageUrl}
          alt={map.name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-xs font-medium text-char-subtle truncate leading-tight text-center">
        {map.name}
      </span>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-90 -translate-x-1/2 pointer-events-none"
            style={{ top: position.top, left: position.left }}
          >
            <div className="rounded-lg border border-background-border bg-surface shadow-xl p-3">
              <p className="text-2xl font-bold text-char mb-1">{mapInfo.mapName}</p>
              <div className="text-sm text-char-secondary leading-relaxed whitespace-pre-line p-2">
                {mapInfo.description || 'No additional info for this map yet.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
    <div className="bg-surface-subtle border border-background-border rounded-xl p-4">
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
            <MapTile key={map.id} map={map} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
