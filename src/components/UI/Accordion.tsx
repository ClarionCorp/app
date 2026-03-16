'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDownIcon } from '@phosphor-icons/react';
import { cn } from '../../core/styles/theme';

interface AccordionItem {
  id: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ items, allowMultiple = false, defaultOpen = [], className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              'rounded-xl border transition-colors duration-150',
              isOpen ? 'border-background-border bg-surface-raised' : 'border-background-border bg-surface-raised hover:border-primary/20'
            )}
          >
            {/* Trigger */}
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer outline-none"
            >
              <div className="flex-1 min-w-0">
                {item.trigger}
              </div>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 text-char-subtle"
              >
                <CaretDownIcon size={14} />
              </motion.span>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 border-t border-background-border">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}