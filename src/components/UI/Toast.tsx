'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { WarningCircleIcon, XIcon, CheckCircleIcon, InfoIcon } from '@phosphor-icons/react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '../../core/styles/theme';

// Types
export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type: ToastType) => void;
  dismiss: (id: string) => void;
}

// Context
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const value: ToastContextValue = { toast, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// Styles & Icons
interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, string> = {
  error:   'bg-surface-raised border-error/30 text-char',
  success: 'bg-surface-raised border-green-500/30 text-char',
  warning: 'bg-surface-raised border-yellow-400/30 text-char',
  info:    'bg-surface-raised border-primary/30 text-char',
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  error:   <WarningCircleIcon size={16} className="text-error shrink-0" weight="fill" />,
  success: <CheckCircleIcon   size={16} className="text-green-500 shrink-0" weight="fill" />,
  warning: <WarningCircleIcon size={16} className="text-yellow-400 shrink-0" weight="fill" />,
  info:    <InfoIcon          size={16} className="text-primary shrink-0" weight="fill" />,
};

const variants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: 8,  scale: 0.95, transition: { duration: 0.15 } },
};

// Toast
function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={cn(
        'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-lg text-sm w-full',
        toastStyles[toast.type]
      )}
    >
      {toastIcons[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-char-subtle hover:text-char transition-colors cursor-pointer shrink-0"
      >
        <XIcon size={14} weight="bold" />
      </button>
    </motion.div>
  );
}

// Container
interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 items-center pointer-events-none w-120 max-w-[90vw]">
      <AnimatePresence>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}