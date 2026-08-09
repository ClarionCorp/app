'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps, type Transition } from 'framer-motion';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { cn } from '../../core/styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'surface' | 'success' | 'ghost' | 'danger' | 'danger-ghost' | 'secondary-ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

// Style Maps
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white border border-secondary hover:bg-secondary hover:shadow-accent active:bg-tertiary',
  secondary: 'bg-secondary text-white border border-secondary hover:bg-tertiary hover:shadow-accent active:bg-tertiary',
  'secondary-ghost': 'bg-transparent text-secondary/80 border border-transparent hover:border-secondary',
  surface: 'bg-surface-overlay text-char-secondary hover:text-char border border-background-border hover:bg-surface-overlay/80',
  success: 'bg-success/80 text-white hover:bg-success/60 hover:shadow-accent active:bg-success/50',
  ghost: 'bg-transparent text-char-secondary border border-transparent hover:bg-surface-active hover:text-char active:bg-surface-raised',
  danger: 'bg-error text-white border border-error hover:brightness-110 hover:shadow-danger active:brightness-90',
  'danger-ghost': 'bg-transparent text-error border border-transparent hover:bg-error/10 hover:text-error/80 active:bg-error/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 gap-1.5 text-sm rounded-md',
  md: 'h-9 px-4 gap-2 text-sm rounded-md',
  lg: 'h-11 px-5 gap-2.5 text-base rounded-lg',
};

// Motion Variants
const motionProps = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] } as Transition,
};

// Component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled = false, fullWidth = false, iconLeft, iconRight, children, className, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        {...motionProps}
        {...props}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none cursor-pointer outline-none',
          'transition-[background-color,border-color,box-shadow,filter,color,opacity] duration-200',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
      >
        {loading
          ? <CircleNotchIcon size={16} className="animate-spin shrink-0" />
          : iconLeft && <span className="shrink-0 flex items-center">{iconLeft}</span>
        }
        {children && (
          <span className={cn(loading && 'opacity-0 absolute')}>{children}</span>
        )}
        {!loading && iconRight && (
          <span className="shrink-0 flex items-center">{iconRight}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';


// A square icon button for icon-only actions (toolbar, actions, etc.)
interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
}

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'size-7 rounded-md',
  md: 'size-9 rounded-md',
  lg: 'size-11 rounded-lg',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', loading = false, disabled = false, label, icon, className, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        {...motionProps}
        {...props}
        disabled={isDisabled}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center shrink-0 cursor-pointer outline-none',
          'transition-[background-color,border-color,box-shadow,color,opacity] duration-200',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          iconSizeStyles[size],
          className
        )}
      >
        {loading
          ? <CircleNotchIcon size={16} className="animate-spin" />
          : <span className="flex items-center justify-center">{icon}</span>
        }
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';