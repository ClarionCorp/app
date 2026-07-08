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
  CaretDownIcon,
} from '@phosphor-icons/react';
import { Dropdown, type DropdownItem } from './UI/Dropdown';
import { Checkbox } from './UI/Checkbox';
import { BugReport, Feedback } from '../types/help';
import { UserTable } from '../types/database';
import { AiMiAPI, version } from '../core/constants';
import { getUser } from '../core/database/queries';
import { useToast } from './UI/Toast';

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

const keybinds = [
  { keys: ['Ctrl', '`'], description: 'Toggle Debug Console' },
  { keys: ['F6'], description: 'Open Help' },
  { keys: ['F8'], description: 'Preview Queue Pop SFX', debug: false },
  { keys: ['F9'], description: 'Open Debug Page', debug: true },
  { keys: ['Ctrl', 'F9'], description: 'Upload last match to API', debug: true },
];

const pageTitles: Record<Exclude<View, 'home'>, string> = {
  keybinds: 'Keybinds',
  'bug-report': 'Submit Bug Report',
  feedback: 'Submit Feedback',
};

const flavorImages: Record<View, string> = {
  home: '/aimi/Pat.png',
  keybinds: '/aimi/Keyboard.gif',
  'bug-report': '/aimi/Sweat.gif',
  feedback: '/aimi/Yapping.gif',
};

const buttonTap: Transition = { duration: 0.06, ease: [0.16, 1, 0.3, 1] };

export function HelpModal({ open, onClose, onCopyLogs }: HelpModalProps) {
  const [view, setView] = useState<View>('home');
  const [direction, setDirection] = useState(1);
  const [bugPage, setBugPage] = useState<string | null>(null);
  const [bugDescription, setBugDescription] = useState('');
  const [bugDropOpen, setBugDropOpen] = useState(false);
  const [bugCreditMe, setCreditMe] = useState(false);
  const [feedbackEntry, setFeedbackEntry] = useState('');
  const [feedbackEnjoying, setFeedbackEnjoying] = useState(true);
  const [feedbackIsReview, setFeedbackIsReview] = useState(false);
  const [feedbackCreditMe, setFeedbackCreditMe] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserTable | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (!open) {
      setView('home');
      setBugPage(null);
      setBugDescription('');
      setBugDropOpen(false);
      setCreditMe(false);
      setFeedbackEntry('');
      setFeedbackEnjoying(false);
      setFeedbackIsReview(false);
      setFeedbackCreditMe(false);
    }
  }, [open]);

  function navigate(next: View) {
    setDirection(1);
    setView(next);
  }

  function goBack() {
    setDirection(-1);
    setView('home');
  }

  function simulateKey(keys: string[]) {
    const key = keys[keys.length - 1];
    const ctrlKey = keys.includes('Ctrl');
    const altKey = keys.includes('Alt');
    const shiftKey = keys.includes('Shift');
    window.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey, altKey, shiftKey, bubbles: true }));
    onClose();
  }

  function refreshPlayerRanks() {}
  function redeemAllCodes() {}

  async function submitBugReport(report: BugReport) {
    toast(`Sending bug report...`, 'info');
    const bundled = {
        report,
        version,
        username: currentUser?.username,
        playerId: currentUser?.playerId,
        discordId: currentUser?.discordId,
    }
    console.debug(`Submitting bug report:`, bundled);

    const res = await fetch(`${AiMiAPI}/v1/bugs/report`, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "x-user-agent": "aimi-app" },
      body: JSON.stringify(bundled)
    });

    const response = await res?.json();

    if (!res.ok) {
      console.error(`Failed to send bug report! Error:`, response?.error);
      toast(`Bug report failed to send! (Error: ${res.status})`, 'error');
      return;
    };

    toast(`Submitted bug report #${response.id} successfully!`, 'success');
    console.log(`Submitted bug report successfully.`);
    return;
  }

  async function submitFeedbackReport(submission: Feedback) {
    const bundled = {
        submission,
        version,
        username: currentUser?.username,
        playerId: currentUser?.playerId,
        discordId: currentUser?.discordId,
    }
    console.debug(`Submitting feedback:`, bundled);

    const res = await fetch(`${AiMiAPI}/v1/feedback/submit`, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "x-user-agent": "aimi-app" },
      body: JSON.stringify(bundled)
    });

    const response = await res?.json();

    if (!res.ok) {
      console.error(`Failed to send feedback! Error:`, response?.error);
      toast(`Feedback failed to send! (Error: ${res.status})`, 'error');
      return;
    };

    toast(`Submitted feedback successfully!`, 'success');
    console.log(`Submitted feedback successfully.`);
    return;
  }

  const bugPageItems: DropdownItem[] = 
    ['Home', 'Current Match', 'Match History', 'Stream Overlay', 'Settings', 'Other']
    .map(page => ({
      label: page,
      onClick: () => setBugPage(page),
    })
  );

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
                      <img src={flavorImages[view]} alt="Aimi" className="size-28 rounded-xl object-cover" />
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
                          transition={buttonTap}
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

                {/* Virtual Pages */}
                {view !== 'home' && (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <img src={flavorImages[view]} alt="Aimi" className="size-28 rounded-xl object-cover" />
                      <span className="text-base font-semibold text-char">{pageTitles[view]}</span>
                    </div>

                    {/* Keybind Page */}
                    {view === 'keybinds' && (
                      <div className="flex flex-col gap-1">
                        {keybinds.map(bind => (
                          <motion.button
                            key={bind.keys.join('+')}
                            onClick={() => simulateKey(bind.keys)}
                            whileTap={{ scale: 0.97 }}
                            transition={buttonTap}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-active hover:bg-tertiary/20 cursor-pointer transition-colors w-full"
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
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Bug Reporting Page */}
                    {view === 'bug-report' && (
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <button
                            onClick={() => setBugDropOpen(v => !v)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-active border border-background-border text-sm hover:border-primary/60 transition-colors cursor-pointer"
                          >
                            <span className={bugPage ? 'text-char' : 'text-char-subtle'}>
                              {bugPage ?? 'Which page does this occur on?'}
                            </span>
                            <CaretDownIcon size={14} className="text-char-subtle shrink-0" />
                          </button>
                          <Dropdown
                            open={bugDropOpen}
                            onClose={() => setBugDropOpen(false)}
                            items={bugPageItems}
                          />
                        </div>

                        <textarea
                          placeholder="Describe the bug..."
                          value={bugDescription}
                          onChange={e => setBugDescription(e.target.value)}
                          className="w-full h-28 resize-none rounded-lg bg-surface-active border border-background-border text-sm text-char placeholder:text-char-subtle px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                        />

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Checkbox checked={bugCreditMe} onChange={setCreditMe} label="Credit Me" description='Display my username in the patch notes when this gets fixed.' />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <motion.button
                            onClick={() => { submitBugReport({ page: bugPage ?? '', content: bugDescription, credit: bugCreditMe }); onClose(); }}
                            whileTap={{ scale: 0.96 }}
                            transition={buttonTap}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-secondary transition-colors cursor-pointer"
                          >
                            Submit
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Feedback Page */}
                    {view === 'feedback' && (
                      <div className="flex flex-col gap-3">
                        <Checkbox
                          checked={feedbackEnjoying}
                          onChange={setFeedbackEnjoying}
                          label="Enjoying the app?"
                          description="Let us know if you're having a good experience overall."
                        />

                        <textarea
                          placeholder="Share your feedback..."
                          value={feedbackEntry}
                          onChange={e => setFeedbackEntry(e.target.value)}
                          className="w-full h-28 resize-none rounded-lg bg-surface-active border border-background-border text-sm text-char placeholder:text-char-subtle px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                        />

                        <Checkbox
                          checked={feedbackIsReview}
                          onChange={v => { setFeedbackIsReview(v); if (!v) setFeedbackCreditMe(false); }}
                          label="This is a review"
                          description="Mark this feedback as a review of this app version."
                        />
                        <Checkbox
                          checked={feedbackCreditMe}
                          onChange={setFeedbackCreditMe}
                          disabled={!feedbackIsReview || !currentUser}
                          label="Attach my username"
                          description={currentUser ? `'${currentUser.username}' will be displayed alongside your review.` : `Unable to resolve current username, option cannot be enabled.`}
                        />

                        <div className="flex justify-end">
                          <motion.button
                            onClick={() => { submitFeedbackReport({ content: feedbackEntry, review: feedbackIsReview, public: feedbackCreditMe, enjoying: feedbackEnjoying }); onClose(); }}
                            whileTap={{ scale: 0.96 }}
                            transition={buttonTap}
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
