'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../core/styles/theme';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  dividerAbove?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  open: boolean;
  onClose: () => void;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -4 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.15, ease: 'easeOut' },
  }),
};

export function Dropdown({ items, open, onClose, className, triggerRef }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (triggerRef?.current?.contains(e.target as Node)) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          variants={menuVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className={cn(
            'absolute top-full left-0 mt-1 z-10 min-w-full w-max',
            'bg-surface rounded-lg border border-background-border shadow-xl shadow-black/30 p-1',
            className
          )}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.dividerAbove && (
                <div className="my-1 border-t border-background-border" />
              )}
              <motion.button
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                onClick={() => { item.onClick(); onClose(); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-left',
                  'transition-colors duration-100 outline-none cursor-pointer',
                  item.variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-char-subtle hover:bg-surface-raised hover:text-char'
                )}
              >
                {item.icon && (
                  <span className="shrink-0 opacity-80">{item.icon}</span>
                )}
                {item.label}
              </motion.button>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}