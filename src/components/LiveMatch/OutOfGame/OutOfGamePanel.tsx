import { motion } from 'framer-motion';
import { MapRotation } from './MapRotation';
import { RatingChart } from './RatingChart';
import { SessionMatches } from './SessionMatches';

export function OutOfGamePanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >

      <div className="flex-1 min-w-0">
        <RatingChart />
      </div>

      <MapRotation />
      
      <div className="flex-1 min-w-0">
        <SessionMatches />
      </div>
    </motion.div>
  );
}
