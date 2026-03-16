'use client';

import { SunIcon, MoonIcon, CircleHalfIcon } from '@phosphor-icons/react';
import { motion, type Variants } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { cn } from '../../core/styles/theme';

type Theme = 'dark' | 'light' | 'midnight';

const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light',    icon: <SunIcon size={14} weight="bold" />,        label: 'Light' },
  { value: 'dark',     icon: <MoonIcon size={14} weight="bold" />,       label: 'Dark' },
  { value: 'midnight', icon: <CircleHalfIcon size={14} weight="bold" />, label: 'Midnight' },
];

const pillVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 bg-surface-subtle border border-background-border rounded-lg p-0.5',
        className
      )}
      role="radiogroup"
      aria-label="Select theme"
    >
      {options.map(opt => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium',
              'transition-colors duration-fast cursor-pointer outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              'focus-visible:ring-offset-surface-subtle',
              active ? 'text-text' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                variants={pillVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 bg-surface-raised border border-background-border rounded-md shadow-sm"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}