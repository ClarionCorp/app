import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getCurrentMatch, getUser } from '../../core/database/queries';
import { AiMiAPI, StatusUrl } from '../../core/constants';

// Add back dynamic coloring when app gets bigger.
// const onlineColor = (n: number) => n >= 100 ? 'text-green-400' : n >= 50 ? 'text-yellow-400' : 'text-red-400';

async function fetchOnlineCount(username: string, gameState: string, region: string | null): Promise<number> {
  const res = await fetch(`${AiMiAPI}/v1/online`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-agent': 'aimi-app' },
    body: JSON.stringify({ username, gameState, region }),
  });
  if (!res.ok) { console.warn(`Failed to send online status!`, JSON.stringify({ username, gameState }, null, 0)) };
  const data = await res.json() as { online: number };
  return data.online;
}

interface Incident {
  title: string;
  content: string;
  createdDate: string;
  style: string;
}

const styleMap: Record<string, { label: string; color: string; }> = {
  primary: { label: 'Maintenance', color: 'text-amber-400' },
  info: { label: 'Notice', color: 'text-blue-400' },
  warning: { label: 'Degraded', color: 'text-yellow-400' },
  danger: { label: 'Outage', color: 'text-red-400' },
  dark: { label: 'Resolved', color: 'text-emerald-400' },
};

const goodStatus = { label: 'Good', color: 'text-emerald-400' };

async function fetchApiStatus(): Promise<Incident | null> {
  const res = await fetch(`${StatusUrl}/api/status-page/aimiapp`);
  const data = await res.json();
  const inc = data?.incident;
  if (inc && inc.content) {
    return { title: inc.title, content: inc.content, createdDate: inc.createdDate, style: inc.style ?? 'warning' };
  }
  return null;
}

export default function TopBar() {
  const [online, setOnline] = useState(0);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function tick() {
      const match = await getCurrentMatch();
      const state = match?.gameState;

      const user = await getUser();
      const username = user?.username;

      if (state && username) {
        const count = await fetchOnlineCount(username, state, user.region);
        setOnline(count);
      }
    }

    tick();
    const interval = setInterval(tick, 300_000); // 5 minutes in ms
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function pollStatus() {
      try {
        setIncident(await fetchApiStatus());
      } catch (err) {
        console.error('Failed to fetch incident data:', err);
      }
    }
    pollStatus();
    const interval = setInterval(pollStatus, 200_000); // 2 minutes in ms
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showPopup) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPopup(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const status = incident ? (styleMap[incident.style] ?? styleMap.warning) : goodStatus;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6 bg-surface-subtle border-b border-background-border">
      {/* Left */}
      <div className="flex items-center gap-4">
        <p className={`text-xs text-char-subtle`}>Online: {online}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 relative">
        <button
          ref={triggerRef}
          className="flex items-center gap-1.5 text-xs text-char-subtle hover:text-char-default transition-colors cursor-pointer select-none"
          onClick={() => setShowPopup(v => !v)}
        >
          API Status: <span className={status.color}>{status.label}</span>
        </button>

        <AnimatePresence>
          {showPopup && (
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-8 w-72 bg-surface border border-background-border rounded-md shadow-lg p-3 z-50"
            >
              {incident ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
                  </div>
                  <p className="text-xs font-medium text-char-default mb-1">{incident.title}</p>
                  <p className="text-xs text-char-subtle mb-2 break-all">{incident.content}</p>
                  <p className="text-xs text-char-subtle opacity-60">
                    {new Date(incident.createdDate).toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-xs text-green-400">All systems operational.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
