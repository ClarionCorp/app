import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AppContextType } from "../App";
import { useOutletContext } from "react-router-dom";

// PLACEHOLDERS
const STEPS = [
  "Fetching client files...",       // Grab identity.json & OS Log Files
  "Connecting to servers...",       // Fetch account info from Ody using identity.json
  "Loading monitor service...",     // Read log and fetch current game status
  "Connecting to ClarionCorp...",   // CC API Handshake for Online Status
  "Preparing your dashboard...",    // Doesn't do anything
  "Ready!",                         // Doesn't do anything
];

const STEP_PCTS = [15, 35, 55, 75, 92, 100];
const STEP_DURATION = 55000;

export default function InitializationPage() {
  const { navigate } = useOutletContext<AppContextType>();
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const advance = (i: number) => {
      if (i >= STEPS.length) {
        navigate('/home');
      }
      setStepIndex(i);
      setProgress(STEP_PCTS[i]);
      setTimeout(() => advance(i + 1), i === STEPS.length - 1 ? 400 : STEP_DURATION);
    };

    const timeout = setTimeout(() => advance(0), 600);
    return () => clearTimeout(timeout);
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-10 px-6">
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="text-3xl font-extrabold tracking-tight text-char">
          Loading Ai.Mi App...
        </span>
        <span className="text-xs uppercase tracking-widest text-char-subtle">
          The Omega Strikers Companion App
        </span>
      </motion.div>

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
    </div>
  );
}