import { AnimatePresence, motion } from 'framer-motion';
import {
  CopySimpleIcon,
  KeyboardIcon,
  ArrowsClockwiseIcon,
  GiftIcon,
  BugIcon,
  ChatCircleDotsIcon,
  XIcon,
} from '@phosphor-icons/react';

interface HelpAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  onCopyLogs: () => void;
}

export function HelpModal({ open, onClose, onCopyLogs }: HelpModalProps) {
  function viewKeybinds() {}
  function refreshPlayerRanks() {}
  function redeemAllCodes() {}
  function submitBugReport() {}
  function submitFeedbackReport() {}

  const actions: HelpAction[] = [
    { icon: <CopySimpleIcon size={24} />, label: 'Copy Logs', onClick: onCopyLogs },
    { icon: <KeyboardIcon size={24} />, label: 'View Keybinds', onClick: viewKeybinds },
    { icon: <ArrowsClockwiseIcon size={24} />, label: 'Refresh Player Ranks', onClick: refreshPlayerRanks },
    { icon: <GiftIcon size={24} />, label: 'Redeem All Codes', onClick: redeemAllCodes },
    { icon: <BugIcon size={24} />, label: 'Submit Bug Report', onClick: submitBugReport },
    { icon: <ChatCircleDotsIcon size={24} />, label: 'Submit Feedback', onClick: submitFeedbackReport },
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
            className="relative z-10 w-120 rounded-xl bg-surface border border-background-border shadow-xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-char-subtle hover:text-char transition-colors cursor-pointer"
            >
              <XIcon size={16} weight="bold" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <img
                src="/aimi/Pat.png"
                alt="Aimi"
                className="size-28 rounded-xl object-cover"
              />
              <span className="text-base font-semibold text-char">What seems to be the problem?</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {actions.map(action => (
                <button
                  key={action.label}
                  onClick={() => { action.onClick(); onClose(); }}
                  className="flex flex-col items-center justify-center gap-2.5 py-5 rounded-lg border border-background-border bg-surface-active hover:bg-surface-overlay hover:border-primary/40 text-char-secondary hover:text-char transition-all duration-150 cursor-pointer group"
                >
                  <span className="text-primary/70 group-hover:text-primary transition-colors">
                    {action.icon}
                  </span>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
