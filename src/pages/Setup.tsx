import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContextType } from "../App";
import { getAppSettings, upsertAppSettings } from "../core/database/queries";
import { AiMiAPI } from "../core/constants";

type SetupPageId = "welcome" | "mods" | "pat" | "privacy" | "settings";

type PrivacyPolicy = {
  lastUpdated: Date;
  privacyPolicy: string;
};

export default function SetupPage() {
  const { navigate } = useOutletContext<AppContextType>();

  const [showSetup, setShowSetup] = useState(false);
  const [page, setPage] = useState<SetupPageId>("welcome");
  const [privacy, setPrivacy] = useState<PrivacyPolicy | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const settings = await getAppSettings();
      if (cancelled) return;

      if (settings?.acceptedPrivacy) {
        navigate('/init', { replace: true });
      } else {
        setShowSetup(true);
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  // Fetch the privacy policy once the user reaches that page
  useEffect(() => {
    if (page !== "privacy" || privacy) return;
    let cancelled = false;

    async function fetchPrivacy() {
      try {
        setPrivacyError(null);
        const res = await fetch(`${AiMiAPI}/v3/legal/privacy`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        if (cancelled) return;
        setPrivacy({ lastUpdated: new Date(data.lastUpdated), privacyPolicy: data.privacyPolicy });
      } catch (e) {
        console.error('Failed to fetch privacy policy!', e);
        if (!cancelled) setPrivacyError(e instanceof Error ? e.message : String(e));
      }
    }

    fetchPrivacy();
    return () => { cancelled = true; };
  }, [page]);

  const handleAccept = async () => {
    await upsertAppSettings({ acceptedPrivacy: true });
    navigate('/init', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
      <AnimatePresence>
        {showSetup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
            >
            <div className="flex flex-col gap-4 bg-surface p-6 rounded-xl w-120 shadow-xl">
              <AnimatePresence mode="wait">
                {/* Page 1: Welcome */}
                {page === "welcome" && (
                  <motion.div
                    key="welcome"
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <img
                      src="/aimi/Custom_Welcome_1.webp"
                      className="h-48 w-auto self-center -mt-20 rounded-lg object-contain mask-[linear-gradient(to_bottom,black_75%,transparent_95%)]"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-semibold text-char">Welcome to the Ai.Mi App!</p>
                      <p className="text-sm text-char-secondary">
                        I'm Ai.Mi, I'll be your assistant while playing Corestrike. Before we get started, there are a couple quick things you should know.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setPage("mods")}
                        className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Okay
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Page 2: UE4SS & PATs */}
                {page === "mods" && (
                  <motion.div
                    key="mods"
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <img
                      src="/aimi/Custom_Welcome_3.webp"
                      className="h-48 w-auto self-center -mt-20 rounded-lg object-contain mask-[linear-gradient(to_bottom,black_90%,transparent)]"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-semibold text-char">How It Works</p>
                      <p className="text-sm text-char-secondary">
                        The App uses <span className="text-primary font-semibold">UE4SS</span>, a mod loader, to read match info straight from the game. I'll install and keep it updated for you automatically.
                      </p>
                      <p className="text-sm text-char-secondary">
                        Keep in mind that it will <span className="text-primary">always run whenever you start Omega Strikers</span>, even if the app is closed. To fully remove it, Uninstall it in the <span className="text-error font-semibold">Danger Zone</span> Settings.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setPage("welcome")}
                        className="flex-1 py-2 rounded-lg bg-surface-overlay text-char text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setPage("pat")}
                        className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Sounds Good
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Page 3: PATs */}
                {page === "pat" && (
                  <motion.div
                    key="pat"
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <img
                      src="/aimi/HALT.png"
                      className="h-48 w-auto self-center -mt-20 rounded-lg object-contain mask-[linear-gradient(to_bottom,black_75%,transparent)]"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-semibold text-char">Player Access Tokens</p>
                      <p className="text-sm text-char-secondary">
                        Whenever the App starts, your <span className="text-primary font-semibold">Odyssey Auth Tokens</span> will be forwarded to the App's private API. It will then send a single request to Odyssey's <code>/v1/me</code>.
                      </p>
                      <p className="text-sm text-char-secondary">
                        This process generates a <span className="text-primary font-semibold">Player Access Token (PAT)</span> for you automatically, and it is provided back to the API in your requests.
                      </p>
                      <p className="text-sm text-char-secondary">
                        This is so we can validate that you are who you say you are. So other players can't spoof their requests to show up as you.<br /> <span className="text-error">Your Odyssey tokens are never stored</span>.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setPage("mods")}
                        className="flex-1 py-2 rounded-lg bg-surface-overlay text-char text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setPage("privacy")}
                        className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Okay
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Page 4: Privacy Policy */}
                {page === "privacy" && (
                  <motion.div
                    key="privacy"
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <img src={''} className="h-40 w-40 self-center -mt-20 rounded-lg object-contain bg-surface-overlay mask-[linear-gradient(to_bottom,black_60%,transparent)]" />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <p className="text-lg font-semibold text-char">Privacy Policy</p>
                        {privacy && (
                          <span className="text-xs text-char-subtle">
                            Last updated {privacy.lastUpdated.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {privacyError ? (
                        <p className="text-xs text-error">Couldn't load the privacy policy: {privacyError}</p>
                      ) : privacy ? (
                        <code className="block h-48 overflow-y-auto whitespace-pre-wrap bg-surface-overlay rounded-lg p-3 text-xs text-char-secondary font-mono">
                          {privacy.privacyPolicy}
                        </code>
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-surface-overlay rounded-lg">
                          <div className="w-6 h-6 rounded-full border-2 border-surface border-t-primary animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setPage("pat")}
                        className="flex-1 py-2 rounded-lg bg-surface-overlay text-char text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setPage("settings")}
                        disabled={!privacy}
                        className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Accept
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Page 5: Settings */}
                {page === "settings" && (
                  <motion.div
                    key="settings"
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <img
                      src="/aimi/Custom_Welcome_2.webp"
                      className="h-48 w-auto self-center -mt-20 rounded-lg object-contain mask-[linear-gradient(to_bottom,black_95%,transparent)]"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-semibold text-char">Have Fun!</p>
                      <p className="text-sm text-char-secondary">
                        If you ever need <span className="text-primary font-semibold">help</span>, click the button in the bottom right, or by pressing <span className="text-primary font-semibold">F6</span> <span className="text-xs text-char-secondary">(or <code>Fn + F6</code>)</span>.
                      </p>
                      
                      <p className="text-sm text-char-secondary">
                        I also recommend checking out the App's <span className="text-primary font-semibold">Settings</span> page to tweak things to your liking! I have plenty of <span className="text-primary font-semibold">themes</span>!
                      </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={handleAccept}
                        className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Got it!
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Page indicator */}
            <div className="flex items-center gap-1.5 bg-surface px-3 py-2 rounded-full shadow-xl">
              <div className={`h-1.5 rounded-full transition-all ${page === "welcome" ? 'w-6 bg-primary' : 'w-1.5 bg-surface-overlay'}`} />
              <div className={`h-1.5 rounded-full transition-all ${page === "mods" ? 'w-6 bg-primary' : 'w-1.5 bg-surface-overlay'}`} />
              <div className={`h-1.5 rounded-full transition-all ${page === "pat" ? 'w-6 bg-primary' : 'w-1.5 bg-surface-overlay'}`} />
              <div className={`h-1.5 rounded-full transition-all ${page === "privacy" ? 'w-6 bg-primary' : 'w-1.5 bg-surface-overlay'}`} />
              <div className={`h-1.5 rounded-full transition-all ${page === "settings" ? 'w-6 bg-primary' : 'w-1.5 bg-surface-overlay'}`} />
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
