import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, ArrowLeftIcon, CopySimpleIcon, CheckIcon, PuzzlePieceIcon, HourglassSimpleMediumIcon } from '@phosphor-icons/react';
import { Button } from '../UI/Button';
import { Toggle } from '../UI/Toggle';
import { LocalWebServer } from '../../core/constants';

const overlay_components = [
  { id: 'queue', label: 'Queue Information' },          // queue, party size
  { id: 'leaderboard', label: 'XP Leaderboard' },       // gainedXp leaderboard (shares a slot with timeline)
  { id: 'bans', label: 'Banned Characters' },           // banned characters (ranked & customs only)
  { id: 'timeline', label: 'XP Timeline' },             // xpGoals timeline graph
  { id: 'trainings', label: 'Player Awakenings' },      // each player's awakenings
  { id: 'duration', label: 'Match Duration' },          // match timer
  { id: 'ranks', label: 'Player Ranks' },               // each player's ranks
];

// Components that occupy the same overlay slot, so enabling one must disable the other.
const EXCLUSIVE_COMPONENTS = ['timeline', 'leaderboard'];

type OverlayView = 'select' | 'ingame' | 'queue';

interface OverlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function OverlayModal({ open, onClose }: OverlayModalProps) {
  const [view, setView] = useState<OverlayView>('select');
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    queue: true,
    bans: true,
    trainings: true,
    ranks: true,
    timeline: false,
    leaderboard: true,
    duration: true,
  });
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      setPreviewScale(entries[0].contentRect.width / 1920);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    if (!open) return;
    setView('select');
  }, [open]);

  const activeComponents = Object.entries(enabled).filter(([, v]) => v).map(([k]) => k).join(',');
  const overlayUrl = `${LocalWebServer}/overlay?components=${activeComponents}`;
  const previewUrl = `${LocalWebServer}/overlay?preview=true&components=${activeComponents}`;
  const queueUrl = `${LocalWebServer}/queue`;
  const queuePreviewUrl = `${LocalWebServer}/queue?preview=true`;

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const page_titles: Record<OverlayView, { title: string; subtitle: string }> = {
    select: { title: 'OBS Stream Overlay', subtitle: 'Choose an overlay type to preview or edit' },
    ingame: { title: 'In-Game Overlay', subtitle: 'Displays useful game info for your viewers' },
    queue: { title: 'Queue Overlay', subtitle: 'Displays current queue status right in your stream' },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-150 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-overlay/60 backdrop-blur-xs" onClick={onClose} />
          <motion.div
            className="relative z-10 w-[90vw] max-w-[120vh] rounded-xl bg-surface border border-background-border shadow-xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {view !== 'select' && (
                  <button
                    onClick={() => setView('select')}
                    className="text-char-subtle hover:text-char transition-colors cursor-pointer"
                  >
                    <ArrowLeftIcon size={16} />
                  </button>
                )}
                <div>
                  <span className="text-base font-semibold text-char">{page_titles[view].title}</span>
                  <p className="text-xs text-char-subtle mt-0.5">{page_titles[view].subtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-char-subtle hover:text-char transition-colors cursor-pointer">
                <XIcon size={16} />
              </button>
            </div>

            {view === 'select' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setView('ingame')}
                  className="flex flex-col items-center gap-2 rounded-lg border border-background-border bg-surface-raised/40 hover:bg-surface-overlay transition-colors px-4 py-8 cursor-pointer text-char"
                >
                  <PuzzlePieceIcon size={28} weight="duotone" />
                  <span className="text-sm font-medium">In-Game Overlay</span>
                  <span className="text-xs text-char-subtle">Build a custom Overlay with live match data</span>
                </button>
                <button
                  onClick={() => setView('queue')}
                  className="flex flex-col items-center gap-2 rounded-lg border border-background-border bg-surface-raised/40 hover:bg-surface-overlay transition-colors px-4 py-8 cursor-pointer text-char"
                >
                  <HourglassSimpleMediumIcon size={28} weight="duotone" />
                  <span className="text-sm font-medium">Queue Overlay</span>
                  <span className="text-xs text-char-subtle">Display a custom queuing animation</span>
                </button>
              </div>
            )}

            {view === 'ingame' && (
              <>
                <div ref={containerRef} className="aspect-video w-full rounded-lg overflow-hidden relative">
                  <img src="/overlay_preview.jpg" alt="Overlay layers" className="absolute inset-0 w-full h-full object-cover" />
                  <div style={{ width: 1920, height: 1080, transformOrigin: 'top left', transform: `scale(${previewScale})`, position: 'absolute', top: 0, left: 0 }}>
                    <iframe
                      src={previewUrl}
                      style={{ width: 1920, height: 1080, border: 'none' }}
                      title="Stream Overlay Preview"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-char-subtle">
                  Add the URL below as a Browser Source in OBS or Meld Studio. It's served locally, so the overlay updates instantly.
                  Use the toggles to choose which components appear. You can even re-use this in multiple sources if you want to rearrange things.
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {overlay_components.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-char-secondary">{c.label}</span>
                      <Toggle
                        enabled={enabled[c.id]}
                        onChange={v => setEnabled(prev => {
                          const next = { ...prev, [c.id]: v };
                          if (v && EXCLUSIVE_COMPONENTS.includes(c.id)) {
                            for (const other of EXCLUSIVE_COMPONENTS) {
                              if (other !== c.id) next[other] = false;
                            }
                          }
                          return next;
                        })}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-9 flex items-center px-3 rounded-md bg-surface-raised border border-background-border text-xs text-char-subtle font-mono truncate select-all">
                    {overlayUrl}
                  </div>
                  <Button
                    variant='success'
                    size="md"
                    iconLeft={copied ? <CheckIcon size={14} /> : <CopySimpleIcon size={14} />}
                    onClick={() => handleCopy(overlayUrl)}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </>
            )}

            {view === 'queue' && (
              <>
                <div ref={containerRef} className="aspect-video w-full rounded-lg overflow-hidden relative bg-surface-raised/40 border border-background-border">
                  <div style={{ width: 1920, height: 1080, transformOrigin: 'top left', transform: `scale(${previewScale})`, position: 'absolute', top: 0, left: 0 }}>
                    <iframe
                      src={queuePreviewUrl}
                      style={{ width: 1920, height: 1080, border: 'none' }}
                      title="Queue Overlay Preview"
                    />
                  </div>
                </div>

                <p className="text-xs text-char-subtle">
                  Add the URL below as a Browser Source in OBS or Meld Studio. It's served locally, so the overlay updates instantly. <br />
                  This widget automatically hides once in a match, so feel free to place over the Game Overlay
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-9 flex items-center px-3 rounded-md bg-surface-raised border border-background-border text-xs text-char-subtle font-mono truncate select-all">
                    {queueUrl}
                  </div>
                  <Button
                    variant='success'
                    size="md"
                    iconLeft={copied ? <CheckIcon size={14} /> : <CopySimpleIcon size={14} />}
                    onClick={() => handleCopy(queueUrl)}
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
