import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContextType } from '../App';
import { AppButton } from '../components/ui/Button';
import {
  getLogPath,
  readNewLines,
  parseMatchPhase,
  parsePlayerRegistration,
  MatchPhase,
} from '../core/utilities/logMonitor';
import { ArrowLeftIcon, PulseIcon, UserIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { logger } from '../core/logger';

const PHASE_LABELS: Record<MatchPhase, string> = {
  'EMatchPhase::None':                'Idle',
  'EMatchPhase::BanSelect':           'Ban Phase',
  'EMatchPhase::LoadoutSelect':       'Loadout Select',
  'EMatchPhase::CharacterSelect':     'Character Select',
  'EMatchPhase::VersusScreen':        'Versus Screen',
  'EMatchPhase::FaceOffIntro':        'Face-Off Intro',
  'EMatchPhase::InGame':              'In Game',
  'EMatchPhase::GoalScore':           'Goal Scored',
  'EMatchPhase::Intermission':        'Intermission',
  'EMatchPhase::PostGameCelebration': 'Post Game',
};

const ACTIVE_PHASES = new Set<MatchPhase>([
  'EMatchPhase::BanSelect',
  'EMatchPhase::LoadoutSelect',
  'EMatchPhase::CharacterSelect',
  'EMatchPhase::VersusScreen',
  'EMatchPhase::FaceOffIntro',
  'EMatchPhase::InGame',
  'EMatchPhase::GoalScore',
  'EMatchPhase::Intermission',
]);

const IDLE_INTERVAL_MS   = 5_000;
const ACTIVE_INTERVAL_MS = 15_000;

export function MonitorPage() {
  const { setCollectedPlayers, navigate } = useOutletContext<AppContextType>();
  const [phase, setPhase] = useState<MatchPhase | null>(null);
  const [foundPlayers, setFoundPlayers] = useState<string[]>([]);
  const [logError, setLogError] = useState<string | null>(null);

  // Use refs so the timeout closure always has fresh values
  const collectingRef = useRef(false);
  const playersRef = useRef<Set<string>>(new Set());
  const navigatedRef = useRef(false);
  const phaseRef = useRef<MatchPhase | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function tick(path: string) {
      if (cancelled || navigatedRef.current) return;

      let lines: string[];
      try {
        lines = await readNewLines(path);
        setLogError(null);
      } catch {
        setLogError(path);
        scheduleNext(path);
        return;
      }

      for (const line of lines) {
        const detectedPhase = parseMatchPhase(line);
        if (detectedPhase) {
          phaseRef.current = detectedPhase;
          setPhase(detectedPhase);

          if (detectedPhase === 'EMatchPhase::BanSelect') {
            collectingRef.current = true;
            playersRef.current = new Set();
            setFoundPlayers([]);
            logger.info('BanSelect detected - collection started');
          }

          if (detectedPhase === 'EMatchPhase::LoadoutSelect') {
            if (!collectingRef.current) {
              logger.warn('LoadoutSelect reached without BanSelect - starting collection as fallback');
              collectingRef.current = true;
              playersRef.current = new Set();
              setFoundPlayers([]);
            } else {
              logger.info('LoadoutSelect detected - still collecting players');
            }
          }

          if (ACTIVE_PHASES.has(detectedPhase) && collectingRef.current) {
            collectingRef.current = false;
            navigatedRef.current = true;
            logger.info(`${detectedPhase} detected with ${playersRef.current.size} player(s) - checking ranks`);
            setCollectedPlayers([...playersRef.current]);
            navigate('/loading');
            return;
          }

          if (detectedPhase === 'EMatchPhase::None') {
            collectingRef.current = false;
          }
        }

        if (collectingRef.current) {
          const player = parsePlayerRegistration(line);
          if (player && !playersRef.current.has(player)) {
            playersRef.current.add(player);
            setFoundPlayers([...playersRef.current]);

            if (playersRef.current.size >= 6) {
              navigatedRef.current = true;
              setCollectedPlayers([...playersRef.current]);
              navigate('/loading');
              return;
            }
          }
        }
      }

      scheduleNext(path);
    }

    function scheduleNext(path: string) {
      if (cancelled) return;
      const isActive = phaseRef.current !== null && ACTIVE_PHASES.has(phaseRef.current);
      const delay = isActive ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS;
      timeoutId = setTimeout(() => tick(path), delay);
    }

    async function init() {
      const path = await getLogPath();
      if (!cancelled) tick(path);
    }

    init();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const isCollecting = foundPlayers.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-50 bg-violet-700/8 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-zinc-900">
        <AppButton variant="ghost" size="sm" onClick={() => navigate('/')} icon={<ArrowLeftIcon size={14} />}>
          Back
        </AppButton>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <PulseIcon size={14} className="text-violet-400 animate-pulse" />
          Monitoring log...
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 gap-10">

        {/* Log file error */}
        <AnimatePresence>
          {logError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-sm bg-red-950/40 border border-red-800/50 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <WarningCircleIcon size={16} weight="fill" />
                Log file not found
              </div>
              <p className="text-red-400/70 text-xs font-mono break-all">{logError}</p>
              <p className="text-zinc-600 text-xs">
                Make sure Omega Strikers has been launched at least once so the log file exists.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">Waiting for Match</h2>
            <p className="text-zinc-500 text-sm">
              {isCollecting
                ? 'Match detected - collecting players...'
                : 'Watching for a new game to start.'}
            </p>
          </div>

          {/* Phase badge */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase ?? 'waiting'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border',
                  isCollecting
                    ? 'bg-violet-600/15 text-violet-300 border-violet-600/30'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-1.5 h-1.5 rounded-full',
                    isCollecting ? 'bg-violet-400 animate-pulse' : 'bg-zinc-600',
                  ].join(' ')}
                />
                {phase ? PHASE_LABELS[phase] : 'No phase detected'}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Player collection progress */}
          <AnimatePresence>
            {isCollecting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Players found</span>
                  <span className="text-violet-400 font-medium">{foundPlayers.length} / 6</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(foundPlayers.length / 6) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>

                {/* Player list */}
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {foundPlayers.map((player, i) => (
                      <motion.div
                        key={player}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2"
                      >
                        <UserIcon size={13} className="text-zinc-500 shrink-0" />
                        <span className="text-sm text-zinc-300 font-medium">{player}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty slots */}
                  {Array.from({ length: 6 - foundPlayers.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-lg px-3 py-2"
                    >
                      <span className="w-3 h-3 rounded-sm bg-zinc-800 shrink-0" />
                      <span className="text-sm text-zinc-700">-</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
