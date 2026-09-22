import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { getCurrentMatch, getOnlineCache, getUser, updateOnlineCache } from '../../core/database/queries';
import { StatusUrl, version } from '../../core/constants';
import { openUrl } from '@tauri-apps/plugin-opener';
import { fetchOnlineCount } from '../../core/utilities/appAPI';
import OnlineGraphs from '../OnlineGraphs';
import TopBarMatchStatus from './TopBarMatchStatus';
import { getOnlineStatusLevel, ONLINE_STATUS_CLASSES } from '../../core/objects/onlineStatus';
import BasicPopover from '../UI/BasicPopover';
import { useDialogue } from '../UI/DialogueToast';
import { getQueueName } from '../../core/objects/ody';
// import { AppAPIRegion, getRegionObjectFromAppRegion, getServerObjectFromID } from '../../core/objects/regions';


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
  const { show: showDialogue } = useDialogue();
  const [online, setOnline] = useState(0);
  const [queuing, setQueuing] = useState<number | null>(null);
  const [queue, setQueue] = useState<string>('queue:none');
  // const [region, setRegion] = useState<AppAPIRegion>('None');
  const [incident, setIncident] = useState<Incident | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Update cache table
  useEffect(() => {
    async function tick() {
      const match = await getCurrentMatch();

      const user = await getUser();
      const username = user?.username;

      if (match && username) {
        const jason = await fetchOnlineCount(username, user.matchmakingRegion, version, match.queue, match.queueState ?? 'Idle', user.rating);
        await updateOnlineCache(jason);
        console.debug(`Updated online cache!`);
      }
    }

    tick();
    const interval = setInterval(tick, 300_000); // 5 minutes in ms
    return () => clearInterval(interval);
  }, []);

  // Update counter from cache
  useEffect(() => {
    async function tick() {
      const match = await getCurrentMatch();
      const counts = await getOnlineCache();

      const inQueue = match.queueState === 'Queued' || match.queueState === 'FoundMatch' || match.queueState === 'StartingGame';
      setQueuing(inQueue ? counts.in_your_queue : null);
      setOnline(counts.total);
      setQueue(match.queue ?? 'queue:none');
    }

    tick();
    const interval = setInterval(tick, 5_000); // 5 seconds in ms
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
  const onlineLevel = getOnlineStatusLevel('Global', online);

  return (
    <div className={`fixed top-0 left-0 right-0 z-60 h-12 flex items-center justify-between px-5 bg-surface-subtle${border ? ' border-b border-background-border' : ''}`}>
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          className="text-xs text-char-subtle hover:text-char-default transition cursor-pointer border-2 border-surface-subtle hover:border-surface-raised rounded-md py-1 px-1.5"
          onClick={() => setShowGraphs(true)}
        >
          Online: <span className={`${ONLINE_STATUS_CLASSES[onlineLevel]} brightness-75`}>{online}</span>
        </button>
        {queuing !== null && (
          <BasicPopover displayText="Other App Users in your queue & region right now" preferBelow>
            <button
              className="text-xs text-char-subtle hover:text-char-default transition cursor-pointer border-2 border-surface-subtle hover:border-surface-raised rounded-md py-1 px-1.5"
              onClick={() => showDialogue({
                variant: 'info',
                image: '/aimi/Yapping.gif',
                title: 'What does "Queued" mean?',
                message: `I can only track the queue states of other Ai.Mi App users. So for your queue (${getQueueName(queue)}), there is ${queuing} player(s) in your region queuing right now.`,
                autoDismiss: 20000
              })}
            >
              Queued: <span className="text-char-default brightness-75">{queuing}</span>
            </button>
          </BasicPopover>
        )}
      </div>
      <OnlineGraphs open={showGraphs} onClose={() => setShowGraphs(false)} />

      {/* Center */}
      <TopBarMatchStatus />

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
