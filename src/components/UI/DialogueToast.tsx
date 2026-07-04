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
  title?: string;
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
  showQueue: (configs: DialogueConfig[]) => void;
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
  const queueRef = useRef<DialogueConfig[]>([]);
  const dismissRef = useRef<(id: string) => void>(() => {});

  const dismiss = useCallback((id: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const next = queueRef.current.shift() ?? null;
    const nextId = next ? Math.random().toString(36).slice(2) : null;
    setDialogue(prev => {
      if (prev?.id !== id) return prev;
      return next && nextId ? { ...next, id: nextId } : null;
    });
    if (next?.autoDismiss && nextId) {
      timerRef.current = setTimeout(() => dismissRef.current(nextId), next.autoDismiss);
    }
  }, []);
  dismissRef.current = dismiss;

  const show = useCallback((config: DialogueConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = [];
    const id = Math.random().toString(36).slice(2);
    setDialogue({ ...config, id });
    if (config.autoDismiss) {
      timerRef.current = setTimeout(() => dismiss(id), config.autoDismiss);
    }
    return id;
  }, [dismiss]);

  const showQueue = useCallback((configs: DialogueConfig[]) => {
    if (!configs.length) return;
    const [first, ...rest] = configs;
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = rest;
    const id = Math.random().toString(36).slice(2);
    setDialogue({ ...first, id });
    if (first.autoDismiss) {
      timerRef.current = setTimeout(() => dismiss(id), first.autoDismiss);
    }
  }, [dismiss]);

  return (
    <DialogueContext.Provider value={{ show, showQueue, dismiss }}>
      {children}
      <AnimatePresence>
        {dialogue && (
          <DialogueBox key={dialogue.id} dialogue={dialogue} onDismiss={dismiss} />
        )}
      </AnimatePresence>
    </DialogueContext.Provider>
  );
}

const variantBg: Record<DialogueVariant, string> = {
  info: 'bg-dialogue-info-surface',
  warning: 'bg-dialogue-warning-surface',
  danger: 'bg-dialogue-danger-surface',
  error: 'bg-dialogue-error-surface',
  success: 'bg-dialogue-success-surface',
};

const variantBorder: Record<DialogueVariant, string> = {
  info: 'border-dialogue-info',
  warning: 'border-dialogue-warning',
  danger: 'border-dialogue-danger',
  error: 'border-dialogue-error',
  success: 'border-dialogue-success',
};

const variantShadow: Record<DialogueVariant, string> = {
  info: 'shadow-[0_0_40px_rgba(96,165,250,0.2)]',
  warning: 'shadow-[0_0_40px_rgba(250,204,21,0.2)]',
  danger: 'shadow-[0_0_40px_rgba(249,115,22,0.2)]',
  error: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
  success: 'shadow-[0_0_40px_rgba(34,197,94,0.2)]',
};

const variantDivider: Record<DialogueVariant, string> = {
  info: 'border-dialogue-info-subtle',
  warning: 'border-dialogue-warning-subtle',
  danger: 'border-dialogue-danger-subtle',
  error: 'border-dialogue-error-subtle',
  success: 'border-dialogue-success-subtle',
};

const variantTitleColor: Record<DialogueVariant, string> = {
  info: 'text-dialogue-info-char',
  warning: 'text-dialogue-warning-char',
  danger: 'text-dialogue-danger-char',
  error: 'text-dialogue-error-char',
  success: 'text-dialogue-success-char',
};

const variantIcons: Record<DialogueVariant, ReactNode> = {
  info: <InfoIcon size={22} weight="fill" className="text-dialogue-info shrink-0" />,
  warning: <WarningIcon size={22} weight="fill" className="text-dialogue-warning shrink-0" />,
  danger: <WarningOctagonIcon size={22} weight="fill" className="text-dialogue-danger shrink-0" />,
  error: <WarningCircleIcon size={22} weight="fill" className="text-dialogue-error shrink-0" />,
  success: <CheckCircleIcon size={22} weight="fill" className="text-dialogue-success shrink-0" />,
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
      className="fixed bottom-4 left-0 right-0 flex justify-center z-201 pointer-events-none"
      variants={slideUp}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className="w-[95%] pointer-events-auto">
        <div className="relative">
          {hasImage && (
            <img
              src={dialogue.image}
              alt=""
              draggable={false}
              className="absolute bottom-3 left-1 h-36 w-auto z-10 object-contain pointer-events-none select-none"
            />
          )}
          <div
            className={cn(
              'rounded-xl border-2',
              variantBg[dialogue.variant],
              variantBorder[dialogue.variant],
              variantShadow[dialogue.variant],
              hasImage && 'pl-36',
            )}
          >
            {/* Title + dismiss */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                {variantIcons[dialogue.variant]}
                <span className={cn('text-xl font-black tracking-wide', variantTitleColor[dialogue.variant])}>
                  {dialogue.title ?? variantLabel[dialogue.variant]}
                </span>
              </div>
              {showX && (
                <button
                  onClick={() => onDismiss(dialogue.id)}
                  className="text-char-subtle hover:text-char transition-colors cursor-pointer ml-2 shrink-0"
                >
                  <XIcon size={14} weight="bold" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className={cn('border-t', variantDivider[dialogue.variant])} />

            {/* Message */}
            <p className={cn('px-4 text-sm text-char-secondary leading-relaxed', hasButtons ? 'pt-2 pb-2' : 'py-3')}>
              {dialogue.message}
            </p>

            {/* Buttons */}
            {hasButtons && (
              <div className="flex items-center gap-2 px-3 pb-3">
                {dialogue.buttons!.map((btn, i) => (
                  <Button
                    key={i}
                    variant={btn.variant ?? 'secondary'}
                    size="sm"
                    className="flex-1"
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
