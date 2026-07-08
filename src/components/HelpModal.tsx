import { useState, useEffect } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import {
  CopySimpleIcon,
  KeyboardIcon,
  ArrowsClockwiseIcon,
  GiftIcon,
  BugIcon,
  ChatCircleDotsIcon,
  XIcon,
  CaretLeftIcon,
} from '@phosphor-icons/react';

type View = 'home' | 'keybinds' | 'bug-report' | 'feedback';

interface HelpAction {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  navigateTo?: View;
}

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  onCopyLogs: () => void;
}

const KEYBINDS = [
  { keys: ['Ctrl', '`'], description: 'Toggle Debug Console' },
  { keys: ['F6'], description: 'Open Help' },
  { keys: ['F4'], description: 'Cycle demo dialog', debug: true },
  { keys: ['F8'], description: 'Play queue pop sound', debug: true },
  { keys: ['F9'], description: 'Debug page', debug: true },
  { keys: ['Ctrl', 'F9'], description: 'Upload last match to API', debug: true },
];

const VIEW_TITLES: Record<Exclude<View, 'home'>, string> = {
  keybinds: 'Keybinds',
  'bug-report': 'Submit Bug Report',
  feedback: 'Submit Feedback',
};

const VIEW_IMAGES: Record<View, string> = {
  home: '/aimi/Pat.png',
  keybinds: '/aimi/Keyboard.gif',
  'bug-report': '/aimi/Sweat.gif',
  feedback: '/aimi/Yapping.gif',
};

const tapTrans: Transition = { duration: 0.06, ease: [0.16, 1, 0.3, 1] };

export function HelpModal({ open, onClose, onCopyLogs }: HelpModalProps) {
  const [view, setView] = useState<View>('home');
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!open) setView('home');
  }, [open]);

  function navigate(next: View) {
    setDirection(1);
    setView(next);
  }

  function goBack() {
    setDirection(-1);
    setView('home');
  }

  function refreshPlayerRanks() {}
  function redeemAllCodes() {}
  function submitBugReport() {}
  function submitFeedbackReport() {}

  const actions: HelpAction[] = [
    { icon: <CopySimpleIcon size={24} />, label: 'Copy Logs', onClick: onCopyLogs },
    { icon: <KeyboardIcon size={24} />, label: 'View Keybinds', navigateTo: 'keybinds' },
    { icon: <ArrowsClockwiseIcon size={24} />, label: 'Refresh Player Ranks', onClick: refreshPlayerRanks },
    { icon: <GiftIcon size={24} />, label: 'Redeem All Codes', onClick: redeemAllCodes },
    { icon: <BugIcon size={24} />, label: 'Submit Bug Report', navigateTo: 'bug-report' },
    { icon: <ChatCircleDotsIcon size={24} />, label: 'Submit Feedback', navigateTo: 'feedback' },
  ];

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
          <div className="absolute inset-0 bg-overlay/60 backdrop-blur-xs" onClick={onClose} />
          <motion.div
            className="relative z-10 w-120 rounded-xl bg-surface border border-background-border shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1 text-char-subtle hover:text-char transition-colors cursor-pointer"
            >
              <XIcon size={16} weight="bold" />
            </button>
            {view !== 'home' && (
              <button
                onClick={goBack}
                className="absolute top-4 left-4 z-10 p-1 text-char-subtle hover:text-char transition-colors cursor-pointer"
              >
                <CaretLeftIcon size={16} weight="bold" />
              </button>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={view}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: -dir * 40, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] } as Transition}
                className="p-5 flex flex-col gap-4"
              >
                {view === 'home' && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <img src={VIEW_IMAGES[view]} alt="Aimi" className="size-28 rounded-xl object-cover" />
                      <span className="text-base font-semibold text-char">
                        What seems to be the <a className="text-primary font-bold">problem</a>?
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {actions.map(action => (
                        <motion.button
                          key={action.label}
                          onClick={() => {
                            if (action.navigateTo) {
                              navigate(action.navigateTo);
                            } else {
                              action.onClick?.();
                              onClose();
                            }
                          }}
                          whileTap={{ scale: 0.96 }}
                          transition={tapTrans}
                          className="flex flex-col items-center justify-center gap-2.5 py-5 rounded-lg border border-background-border bg-surface-active hover:bg-surface-overlay hover:border-primary/40 text-char-secondary hover:text-char transition-all duration-150 cursor-pointer group"
                        >
                          <span className="text-primary/70 group-hover:text-primary transition-colors">
                            {action.icon}
                          </span>
                          <span className="text-sm font-medium">{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {view !== 'home' && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <img src={VIEW_IMAGES[view]} alt="Aimi" className="size-28 rounded-xl object-cover" />
                      <span className="text-base font-semibold text-char">{VIEW_TITLES[view]}</span>
                    </div>

                    {view === 'keybinds' && (
                      <div className="flex flex-col gap-1">
                        {KEYBINDS.map(bind => (
                          <div
                            key={bind.keys.join('+')}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-active"
                          >
                            <span className={`text-sm ${bind.debug ? 'text-char-subtle' : 'text-char-secondary'}`}>
                              {bind.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {bind.keys.map((k, i) => (
                                <span key={k} className="flex items-center gap-1">
                                  <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-surface border border-background-border text-char-secondary">
                                    {k}
                                  </kbd>
                                  {i < bind.keys.length - 1 && (
                                    <span className="text-char-subtle text-xs">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(view === 'bug-report' || view === 'feedback') && (
                      <div className="flex flex-col gap-3">
                        <textarea
                          placeholder={view === 'bug-report' ? 'Describe the bug...' : 'Share your feedback...'}
                          className="w-full h-32 resize-none rounded-lg bg-surface-active border border-background-border text-sm text-char placeholder:text-char-subtle px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                        />
                        <div className="flex justify-end">
                          <motion.button
                            onClick={() => {
                              view === 'bug-report' ? submitBugReport() : submitFeedbackReport();
                              onClose();
                            }}
                            whileTap={{ scale: 0.96 }}
                            transition={tapTrans}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-secondary transition-colors cursor-pointer"
                          >
                            Submit
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
