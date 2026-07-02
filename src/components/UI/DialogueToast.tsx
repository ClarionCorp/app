'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningIcon,
  WarningOctagonIcon,
  XIcon,
} from '@phosphor-icons/react';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../../core/styles/theme';
import { Button } from './Button';

export type DialogueVariant = 'info' | 'warning' | 'danger' | 'error' | 'success';

export interface DialogueButtonConfig {
  label: string;
  variant?: 'primary' | 'secondary' | 'surface' | 'ghost' | 'danger' | 'danger-ghost' | 'success';
  onClick?: () => void;
  dismisses?: boolean;
}

export interface DialogueConfig {
  variant: DialogueVariant;
  message: string;
  image?: string;
  buttons?: DialogueButtonConfig[];
  autoDismiss?: number;
  dismissible?: boolean;
}

interface DialogueData extends DialogueConfig {
  id: string;
}

interface DialogueContextValue {
  show: (config: DialogueConfig) => string;
  dismiss: (id: string) => void;
}

const DialogueContext = createContext<DialogueContextValue | null>(null);

export function useDialogue(): DialogueContextValue {
  const ctx = useContext(DialogueContext);
  if (!ctx) throw new Error('useDialogue must be used within a DialogueProvider');
  return ctx;
}

export function DialogueProvider({ children }: { children: ReactNode }) {
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback((id: string) => {
    setDialogue(prev => (prev?.id === id ? null : prev));
  }, []);

  const show = useCallback(
    (config: DialogueConfig) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const id = Math.random().toString(36).slice(2);
      setDialogue({ ...config, id });
      if (config.autoDismiss) {
        timerRef.current = setTimeout(() => dismiss(id), config.autoDismiss);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <DialogueContext.Provider value={{ show, dismiss }}>
      {children}
      <AnimatePresence>
        {dialogue && (
          <DialogueBox key={dialogue.id} dialogue={dialogue} onDismiss={dismiss} />
        )}
      </AnimatePresence>
    </DialogueContext.Provider>
  );
}

const variantBorder: Record<DialogueVariant, string> = {
  info: 'border-blue-400',
  warning: 'border-yellow-400',
  danger: 'border-orange-500',
  error: 'border-red-500',
  success: 'border-green-500',
};

const variantShadow: Record<DialogueVariant, string> = {
  info: 'shadow-[0_0_40px_rgba(96,165,250,0.2)]',
  warning: 'shadow-[0_0_40px_rgba(250,204,21,0.2)]',
  danger: 'shadow-[0_0_40px_rgba(249,115,22,0.2)]',
  error: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
  success: 'shadow-[0_0_40px_rgba(34,197,94,0.2)]',
};

const variantIcons: Record<DialogueVariant, ReactNode> = {
  info: <InfoIcon size={14} weight="fill" className="text-blue-400 shrink-0" />,
  warning: <WarningIcon size={14} weight="fill" className="text-yellow-400 shrink-0" />,
  danger: <WarningOctagonIcon size={14} weight="fill" className="text-orange-500 shrink-0" />,
  error: <WarningCircleIcon size={14} weight="fill" className="text-red-500 shrink-0" />,
  success: <CheckCircleIcon size={14} weight="fill" className="text-green-500 shrink-0" />,
};

const variantLabelColor: Record<DialogueVariant, string> = {
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  danger: 'text-orange-500',
  error: 'text-red-500',
  success: 'text-green-500',
};

const variantLabel: Record<DialogueVariant, string> = {
  info: 'Info',
  warning: 'Warning',
  danger: 'Alert',
  error: 'Error',
  success: 'Success',
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 40, transition: { duration: 0.2 } },
};

function DialogueBox({
  dialogue,
  onDismiss,
}: {
  dialogue: DialogueData;
  onDismiss: (id: string) => void;
}) {
  const showX = dialogue.dismissible !== false;
  const hasImage = !!dialogue.image;
  const hasButtons = !!dialogue.buttons?.length;

  return (
    <motion.div
      className="fixed bottom-4 left-0 right-0 flex justify-center z-60 pointer-events-none"
      variants={slideUp}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className="w-[95%] pointer-events-auto">
        <div
          className={cn(
            'rounded-xl border-2 bg-[#080f1c] flex items-center',
            variantBorder[dialogue.variant],
            variantShadow[dialogue.variant],
          )}
        >
          {hasImage && (
            <div className="shrink-0 w-28 flex items-center justify-center px-3 self-stretch">
              <img
                src={dialogue.image}
                alt=""
                draggable={false}
                className="h-28 w-full object-contain"
              />
            </div>
          )}

          <div className={cn('flex-1', hasImage && 'border-l border-white/10')}>
            {/* Type label + dismiss */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                {variantIcons[dialogue.variant]}
                <span className={cn('text-xs font-bold uppercase tracking-widest', variantLabelColor[dialogue.variant])}>
                  {variantLabel[dialogue.variant]}
                </span>
              </div>
              {showX && (
                <button
                  onClick={() => onDismiss(dialogue.id)}
                  className="text-char-subtle hover:text-char transition-colors cursor-pointer"
                >
                  <XIcon size={13} weight="bold" />
                </button>
              )}
            </div>

            {/* Message */}
            <p className={cn('px-5 text-char text-sm leading-relaxed', hasButtons ? 'pt-3 pb-2' : 'py-3')}>
              {dialogue.message}
            </p>

            {/* Optional buttons */}
            {hasButtons && (
              <div className="flex items-center gap-2 px-5 pb-4">
                {dialogue.buttons!.map((btn, i) => (
                  <Button
                    key={i}
                    variant={btn.variant ?? 'surface'}
                    size="sm"
                    onClick={() => {
                      btn.onClick?.();
                      if (btn.dismisses !== false) onDismiss(dialogue.id);
                    }}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
