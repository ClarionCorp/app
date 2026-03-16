'use client';

import { CheckIcon } from '@phosphor-icons/react';
import { cn } from '../../core/styles/theme';

interface CheckboxOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CheckboxGroupProps<T extends string> {
  options: CheckboxOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  disabled?: boolean;
}

function CheckboxDot({ selected }: { selected: boolean }) {
  return (
    <div className={cn(
      'size-4 rounded-[5px] border-2 shrink-0 transition-colors flex items-center justify-center',
      selected ? 'border-primary bg-primary' : 'border-char-subtle bg-transparent'
    )}>
      {selected && <CheckIcon size={10} weight="bold" className="text-white" />}
    </div>
  );
}

export function CheckboxGroup<T extends string>({ options, value, onChange, disabled }: CheckboxGroupProps<T>) {
  function toggle(opt: T) {
    if (disabled) return;
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-3.5 p-3.5 rounded-xl border transition-all text-left cursor-pointer',
              selected
                ? 'bg-primary/10 border-primary/40'
                : 'bg-surface-raised border-background-border hover:border-primary/20 hover:bg-surface-overlay',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {opt.icon && (
              <div className={cn(
                'size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                selected ? 'bg-primary/20 text-primary' : 'bg-surface-overlay text-char-subtle'
              )}>
                {opt.icon}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-char">{opt.label}</p>
              {opt.description && <p className="text-xs text-char-subtle mt-0.5">{opt.description}</p>}
            </div>
            <CheckboxDot selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

// Single standalone checkbox for simpler use cases
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, description, icon, disabled }: CheckboxProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3.5 p-3.5 rounded-xl border transition-all text-left cursor-pointer w-full',
        checked
          ? 'bg-primary/10 border-primary/40'
          : 'bg-surface-raised border-background-border hover:border-primary/20 hover:bg-surface-overlay',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && (
        <div className={cn(
          'size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
          checked ? 'bg-primary/20 text-primary' : 'bg-surface-overlay text-char-subtle'
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-char">{label}</p>
        {description && <p className="text-xs text-char-subtle mt-0.5">{description}</p>}
      </div>
      <CheckboxDot selected={checked} />
    </button>
  );
}