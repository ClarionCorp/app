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

const variantBg: Record<DialogueVariant, string> = {
  info: 'bg-blue-200',
  warning: 'bg-yellow-100',
  danger: 'bg-orange-100',
  error: 'bg-red-100',
  success: 'bg-green-100',
};

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

const variantDivider: Record<DialogueVariant, string> = {
  info: 'border-blue-300',
  warning: 'border-yellow-200',
  danger: 'border-orange-200',
  error: 'border-red-200',
  success: 'border-green-200',
};

const variantTitleColor: Record<DialogueVariant, string> = {
  info: 'text-blue-900',
  warning: 'text-yellow-900',
  danger: 'text-orange-900',
  error: 'text-red-900',
  success: 'text-green-900',
};

const variantIcons: Record<DialogueVariant, ReactNode> = {
  info: <InfoIcon size={22} weight="fill" className="text-blue-600 shrink-0" />,
  warning: <WarningIcon size={22} weight="fill" className="text-yellow-600 shrink-0" />,
  danger: <WarningOctagonIcon size={22} weight="fill" className="text-orange-600 shrink-0" />,
  error: <WarningCircleIcon size={22} weight="fill" className="text-red-600 shrink-0" />,
  success: <CheckCircleIcon size={22} weight="fill" className="text-green-600 shrink-0" />,
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
                <span className={cn('text-xl font-black uppercase tracking-wide', variantTitleColor[dialogue.variant])}>
                  {dialogue.title ?? variantLabel[dialogue.variant]}
                </span>
              </div>
              {showX && (
                <button
                  onClick={() => onDismiss(dialogue.id)}
                  className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer ml-2 shrink-0"
                >
                  <XIcon size={14} weight="bold" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className={cn('border-t', variantDivider[dialogue.variant])} />

            {/* Message */}
            <p className={cn('px-4 text-sm text-gray-700 leading-relaxed', hasButtons ? 'pt-2 pb-2' : 'py-3')}>
              {dialogue.message}
            </p>

            {/* Buttons */}
            {hasButtons && (
              <div className="flex items-center gap-2 px-3 pb-3">
                {dialogue.buttons!.map((btn, i) => (
                  <Button
                    key={i}
                    variant={btn.variant ?? 'primary'}
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
