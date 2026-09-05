import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getCurrentMatch, getMyMatchPlayer, getUser } from '../../core/database/queries';
import { StatusUrl } from '../../core/constants';
import { openUrl } from '@tauri-apps/plugin-opener';
import { fetchOnlineCount } from '../../core/utilities/appAPI';
import OnlineGraphs from '../OnlineGraphs';
import { getMapObjectFromID } from '../../core/objects/maps';
import { getQueueObjectFromID } from '../../core/objects/queues';
import { CurrentMatchTable, MatchPlayersTable } from '../../types/database';
// import { AppAPIRegion, getRegionObjectFromAppRegion, getServerObjectFromID } from '../../core/objects/regions';
// import { getOnlineStatusLevel, ONLINE_STATUS_CLASSES } from '../../core/objects/onlineStatus';


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

interface TopBarProps {
  border?: boolean; // NavCorner draws the border when the sidebar is shown; set this when it isn't
}

export default function TopBar({ border = false }: TopBarProps) {
  const [online, setOnline] = useState(0);
  // const [region, setRegion] = useState<AppAPIRegion>('None');
  const [incident, setIncident] = useState<Incident | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const [match, setMatch] = useState<CurrentMatchTable | null>(null);
  const [myPlayer, setMyPlayer] = useState<MatchPlayersTable | null>(null);
  const [now, setNow] = useState(() => new Date());
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
        // setRegion(getRegionObjectFromAppRegion(getServerObjectFromID(user.region).region).apiRegion);
      }
    }

    tick();
    const interval = setInterval(tick, 300_000); // 5 minutes in ms
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function tick() {
      setMatch(await getCurrentMatch());
      setMyPlayer(await getMyMatchPlayer());
    }
    tick();
    const interval = setInterval(tick, 2_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1_000);
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
  // const onlineLevel = getOnlineStatusLevel(region, online); // unused for now

  const ping = myPlayer?.ping;
  const isGood = (ping ?? 0) <= 60;
  const isMid = (ping ?? 0) <= 120;
  const pingColorClass = isGood ? 'text-green-400' : isMid ? 'text-match-mid' : 'text-match-loss';

  const matchDuration = match?.startedAt
    ? Math.max(0, Math.floor((now.getTime() - new Date(match.startedAt).getTime()) / 1000))
    : null;
  const matchDurationDisplay = matchDuration != null
    ? `${Math.floor(matchDuration / 60)}:${(matchDuration % 60).toString().padStart(2, '0')}`
    : '--:--';

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-5 bg-surface-subtle${border ? ' border-b border-background-border' : ''}`}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="text-xs text-char-subtle hover:text-char-default transition cursor-pointer border-2 border-surface-subtle hover:border-surface-raised rounded-md py-1 px-1.5"
          onClick={() => setShowGraphs(true)}
        >
          Online: {online}
        </button>
      </div>
      <OnlineGraphs open={showGraphs} onClose={() => setShowGraphs(false)} />

      {/* Center */}
      {match?.map && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 text-sm text-char-subtle select-none pointer-events-none leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-char-secondary">{getQueueObjectFromID(match.queue).queueName}</span>
            <span className="text-char-secondary">— {getMapObjectFromID(match.map).mapName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="">{matchDurationDisplay}</span>
            
            {ping != null && ping > 0 && (
              <>
                (<span className={pingColorClass}>{ping}ms</span>)
              </>
            )}
          </div>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-4 relative">
        <button
          ref={triggerRef}
          className="flex items-center gap-1.5 text-xs text-char-subtle hover:text-char-default transition cursor-pointer select-none border-2 border-surface-subtle hover:border-surface-raised rounded-md py-1 px-1.5"
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
                  <p className="text-xs text-char-subtle mb-2 wrap-break-word">{incident.content}</p>
                  <p className="text-xs text-char-subtle opacity-60">
                    {new Date(incident.createdDate).toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-xs text-emerald-400">All systems operational.</p>
                    </div>
                      <p className="text-xs text-char-subtle mb-2 break-all">Automatically pulls from <a onClick={() => openUrl(`${StatusUrl}/status/aimiapp`)}  className='cursor-pointer hover:underline'>{StatusUrl}</a></p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
