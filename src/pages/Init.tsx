import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContextType } from "../App";
import { readIdentity } from "../core/init";
import { DEFAULT_ACTIVITY, discordRpc, startRpc, stopRpc } from "../core/utilities/discord";
import { dirname } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { fetchRankQuery, fetchSelfQuery } from "../core/utilities/odyssey";
import { getAppSettings, upsertAppSettings, updateRating, upsertUser } from "../core/database/queries";
import { checkUE4SS } from "../core/utilities/ue4ss";
import { db } from "../core/database/driver";
import { matchPlayers } from "../core/database/schema";

const STEPS = [
  "Checking UE4SS...",
  "Fetching account info...",
  "Connecting to Discord...",
];

const STEP_PCTS = [5, 40, 75, 100];

export default function InitializationPage() {
  const {
    navigate,
    setOdyAuth,
    setConnectedStatus,
  } = useOutletContext<AppContextType>();

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsGameDir, setNeedsGameDir] = useState(false);
  const [ue4ssMessage, setUe4ssMessage] = useState<string | null>(null);
  const [ue4ssPercent, setUe4ssPercent] = useState<number | null>(null);

  const gameDirResolveRef = useRef<((dir: string) => void) | null>(null);

  const handlePickExe = async () => {
    const selected = await open({
      filters: [{ name: 'Executable', extensions: ['exe'] }],
      title: 'Select OmegaStrikers.exe',
    });
    if (!selected) return;
    const dir = await dirname(selected);
    await upsertAppSettings({ gameDirectory: dir });
    gameDirResolveRef.current?.(dir);
    setNeedsGameDir(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // Get or prompt for game directory
        const settings = await getAppSettings();
        let gameDir = settings?.gameDirectory ?? null;

        if (!gameDir) {
          const defaultDir = 'C:/Program Files (x86)/Steam/steamapps/common/OmegaStrikers';
          if (await exists(`${defaultDir}/OmegaStrikers.exe`)) {
            gameDir = defaultDir;
            await upsertAppSettings({ gameDirectory: gameDir });
          } else {
            setNeedsGameDir(true);
            gameDir = await new Promise<string>(resolve => {
              gameDirResolveRef.current = resolve;
            });
          }
        }

        // 1) Check & install/update UE4SS and companion mods
        setStepIndex(0);
        setProgress(STEP_PCTS[0]);
        await checkUE4SS(gameDir, (_stage, percent, message) => {
          setUe4ssMessage(message);
          setUe4ssPercent(percent);
        });
        if (cancelled) return;

        // 1.5) (Hidden) Purge players table as we'll just fetch a new one anyway
        await db.delete(matchPlayers).run();

        // 2) Fetch account info from Odyssey
        setStepIndex(1);
        setProgress(STEP_PCTS[1]);
        try {
          const auth = await readIdentity();
          setOdyAuth(auth);
          const selfQuery = await fetchSelfQuery();
          const rankQuery = await fetchRankQuery(selfQuery.playerId);
          if (cancelled) return;
          await upsertUser(selfQuery);
          if (rankQuery) await updateRating(rankQuery.rating);
          setConnectedStatus(true);
        } catch (e) {
          console.warn('Failed to fetch account data, some features disabled.', e);
          setConnectedStatus(false);
        }

        // 3) Connect to Discord RPC
        setStepIndex(2);
        setProgress(STEP_PCTS[2]);
        await stopRpc();
        await startRpc();
        await discordRpc?.updateActivity(DEFAULT_ACTIVITY);
        if (cancelled) return;

        setProgress(100);
        await new Promise(res => setTimeout(res, 100));
        navigate('/home');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    }

    const timeout = setTimeout(run, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-10 px-6">

      {/* Game directory picker modal */}
      <AnimatePresence>
        {needsGameDir && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col gap-4 bg-surface p-6 rounded-xl w-80 shadow-xl"
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
            >
              <p className="text-sm font-semibold text-char">Game Location Required</p>
              <p className="text-xs text-char-secondary">
                Select your <span className="text-primary font-mono">OmegaStrikers.exe</span> to continue.
              </p>
              <button
                onClick={handlePickExe}
                className="mt-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Browse...
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-col relative items-center gap-2"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img
          src={'/aimi/Noted.gif'}
          className="w-40 aspect-square rounded-xl object-cover absolute -top-56"
        />
        <span className="text-3xl font-extrabold tracking-tight text-char">
          Loading Ai.Mi App...
        </span>
        <span className="text-xs uppercase tracking-widest text-char-subtle">
          The Omega Strikers Companion App
        </span>
      </motion.div>

      {error ? (
        <motion.div
          className="flex flex-col items-center gap-3 w-80 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-semibold text-error">Initialization Failed</p>
          <p className="text-xs text-char-secondary whitespace-pre-wrap">{error}</p>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center gap-5 w-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="w-10 h-10 rounded-full border-[3px] border-surface-overlay border-t-primary animate-spin" />

          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              className="text-sm text-char-secondary text-center"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>

          {/* Main progress bar */}
          <div className="w-full h-1 rounded-full bg-surface-overlay overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* UE4SS sub-progress — only visible during step 0 */}
          <AnimatePresence>
            {stepIndex === 0 && ue4ssMessage && (
              <motion.div
                className="flex flex-col gap-1.5 w-full"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-char-subtle text-center">{ue4ssMessage}</p>
                <div className="w-full h-0.5 rounded-full bg-surface-overlay overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary/50"
                    animate={{ width: `${ue4ssPercent ?? 0}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <span className="text-xs text-char-subtle">{progress}%</span>
        </motion.div>
      )}
    </div>
  );
}
