import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, CopySimpleIcon, CheckIcon } from '@phosphor-icons/react';
import { getAppSettings, upsertAppSettings, getUser } from '../../core/database/queries';
import { Button } from '../UI/Button';
import { Toggle } from '../UI/Toggle';
import { UserTable } from '../../types/database';

const overlay_components = [
  { id: 'queue', label: 'Queue Information' },          // queue, party size
  { id: 'bans', label: 'Banned Characters' },           // banned characters (ranked & customs only)
  { id: 'trainings', label: 'Player Awakenings' },      // each player's awakenings
  { id: 'ranks', label: 'Player Ranks' },               // each player's ranks
  { id: 'timeline', label: 'XP Timeline' },             // xpGoals timeline graph
  { id: 'duration', label: 'Match Duration' },          // match timer
  // { id: 'rating', label: 'Session Rating History' },    // CCUI's live rating history (but better)
];

interface StreamOverlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function StreamOverlayModal({ open, onClose }: StreamOverlayModalProps) {
  const [sendMatchData, setSendMatchData] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    queue: true,
    bans: true,
    trainings: true,
    ranks: true,
    timeline: true,
    duration: true,
  });
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<UserTable | null>(null);

  useEffect(() => {
    if (!open) return;
    setSendMatchData(null);
    getAppSettings().then(s => setSendMatchData(s?.sendMatchData ?? false));
    getUser().then(setUser);
  }, [open]);

  const activeComponents = Object.entries(enabled).filter(([, v]) => v).map(([k]) => k).join(',');
  const overlayUrl = `https://clarioncorp.net/app/overlay/${user?.username}?components=${activeComponents}`;

  function handleCopy() {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-overlay/80" onClick={onClose} />
          <motion.div
            className="relative z-10 w-2xl max-w-[95vw] rounded-xl bg-surface border border-background-border shadow-xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-semibold text-char">Stream Overlay</span>
                <p className="text-xs text-char-subtle mt-0.5">Configure your OBS browser source overlay</p>
              </div>
              <button onClick={onClose} className="text-char-subtle hover:text-char transition-colors cursor-pointer">
                <XIcon size={16} />
              </button>
            </div>

            {sendMatchData === false && (
              <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-raised/40 border border-background-border px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-char">Enable periodic data upload to continue</span>
                  <span className="text-xs text-char-subtle">Live match data needs to be uploaded. This can be disabled in Settings.</span>
                </div>
                <Toggle
                  enabled={false}
                  onChange={async v => {
                    await upsertAppSettings({ sendMatchData: v });
                    setSendMatchData(v);
                  }}
                />
              </div>
            )}

            {sendMatchData === true && (
              <>
                <div className="aspect-video w-full rounded-lg bg-surface-raised overflow-hidden relative">
                  <div className="absolute inset-0 bg-surface-overlay animate-pulse" />
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {overlay_components.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-char-secondary">{c.label}</span>
                      <Toggle
                        enabled={enabled[c.id]}
                        onChange={v => setEnabled(prev => ({ ...prev, [c.id]: v }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-9 flex items-center px-3 rounded-md bg-surface-raised border border-background-border text-xs text-char-subtle font-mono truncate select-all">
                    {overlayUrl}
                  </div>
                  <Button
                    variant="surface"
                    size="sm"
                    iconLeft={copied ? <CheckIcon size={14} /> : <CopySimpleIcon size={14} />}
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
