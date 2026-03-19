import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContextType } from "../App";
import { verifyClientFiles } from "../core/init";
import { DEFAULT_ACTIVITY } from "../core/discord";
import { initMonitorCallbacks } from "../core/monitorCallbacks";
import { homeDir, join } from "@tauri-apps/api/path";
import { windows_log } from "../core/constants";
import { invoke } from "@tauri-apps/api/core";
import { fetchRankQuery, fetchSelfQuery } from "../core/utilities/odyssey";
import { updateRating, upsertUser } from "../core/database/queries";

// PLACEHOLDERS
const STEPS = [
  "Fetching client files...",       // Grab identity.json & OS Log Files
  "Connecting to servers...",       // Fetch account info from Ody using identity.json
  "Connecting to Discord...",       // Start Discord RPC (must be before logs)
  "Loading monitor service...",     // Read log and fetch current game status
  "Connecting to ClarionCorp...",   // CC API Handshake for Online Status
  "Ready!",                         // Doesn't do anything
];
 
const STEP_PCTS = [0, 15, 35, 65, 85, 100];
 
export default function InitializationPage() {
  const {
    navigate,
    updateActivity,
    setUserData,
    setMatchPhase,
    setOdyAuth,
    startRpc,
    stopRpc,
  } = useOutletContext<AppContextType>();
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
 
    async function run() {
      try {
        // 1) Grab identity.json & OS Log Files
        setStepIndex(0);
        setProgress(STEP_PCTS[0]);
        const auth = await verifyClientFiles();
        setOdyAuth(auth);
        if (cancelled) return;
        await new Promise((res) => setTimeout(res, 50));
 
        // 2) Fetch account info from Ody using identity.json
        setStepIndex(1);
        setProgress(STEP_PCTS[1]);
        const selfQuery = await fetchSelfQuery();
        const rankQuery = await fetchRankQuery(selfQuery.playerId);
        if (cancelled) return;
        setUserData(selfQuery);
        await upsertUser(selfQuery);
        if (rankQuery) await updateRating(rankQuery.rating);
        await new Promise((res) => setTimeout(res, 50));

        // 3) Connect to Discord RPC
        setStepIndex(2);
        setProgress(STEP_PCTS[2]);
        await stopRpc();
        await startRpc();
        await updateActivity(DEFAULT_ACTIVITY);
        await new Promise((res) => setTimeout(res, 50));
 
        // 4) Read log and fetch current game status
        setStepIndex(3);
        setProgress(STEP_PCTS[3]);
        const home = await homeDir();
        const logPath = await join(home, windows_log);
        const sessionOffset = await invoke<number>('find_session_start', { path: logPath });
        await initMonitorCallbacks({ // Moved to its own file for organization sake
          updateActivity,
          setMatchPhase,
          sessionOffset,
        });
        await new Promise((res) => setTimeout(res, 50));

        // 5) <Connect to CC> (unused rn)
        setStepIndex(4);
        setProgress(STEP_PCTS[4]);
        await new Promise((res) => setTimeout(res, 500));
 
        navigate('/home');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }
 
    const timeout = setTimeout(run, 1000); // wait for app before starting
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-10 px-6">
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
 
          <div className="w-full h-1 rounded-full bg-surface-overlay overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
 
          <span className="text-xs text-char-subtle">{progress}%</span>
        </motion.div>
      )}
    </div>
  );
}