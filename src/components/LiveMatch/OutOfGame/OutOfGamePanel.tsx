import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapRotation } from './MapRotation';
import { RatingChart } from './RatingChart';
import { SessionMatches } from './SessionMatches';
import { getCurrentSession } from '../../../core/database/queries';
import { GameSessionsTable } from '../../../types/database';

export function OutOfGamePanel() {
  const [session, setSession] = useState<GameSessionsTable | null>(null);

  useEffect(() => {
    async function load() {
      setSession(await getCurrentSession());
    }
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >

      <div className="flex-1 min-w-0">
        <RatingChart session={session} />
      </div>

      <MapRotation />

      <div className="flex-1 min-w-0">
        <SessionMatches session={session} />
      </div>
    </motion.div>
  );
}
