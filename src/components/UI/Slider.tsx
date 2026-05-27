'use client';

import { cn } from '../../core/styles/theme';

interface SliderStop {
  value: number;
  label: string;
}

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  stops?: SliderStop[];
  unit?: string;
  disabled?: boolean;
}

export function Slider({ min, max, value, onChange, stops, unit, disabled }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  // Matches the browser's internal thumb travel range (full width minus one thumb width of 16px).
  // Both the fill and the custom thumb use this same formula so they stay in sync.
  const thumbPos = `calc((100% - 16px) * ${pct} / 100)`;

  return (
    <div className="flex flex-col gap-3">
      {/* Track + thumb */}
      <div className="relative flex items-center h-6">
        {/* Track background: inset by 8px (half thumb) on each side to align with thumb center */}
        <div className="absolute inset-x-2 h-1.5 rounded-full bg-surface-overlay" />
        {/* Filled portion */}
        <div
          className="absolute left-2 h-1.5 rounded-full bg-primary"
          style={{ width: `calc((100% - 16px) * ${pct} / 100)` }}
        />
        {/* Stop markers */}
        {stops?.map(stop => {
          const stopPct = ((stop.value - min) / (max - min)) * 100;
          return (
            <div
              key={stop.value}
              className="absolute w-0.5 h-2.5 rounded-full"
              style={{
                left: `calc(8px + (100% - 16px) * ${stopPct} / 100)`,
                transform: 'translateX(-50%)',
                backgroundColor: stop.value <= value ? 'hsl(var(--color-primary) / 0.4)' : 'hsl(var(--color-surface-active))',
              }}
            />
          );
        })}
        {/* Native input (invisible, handles interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={e => {
            const raw = Number(e.target.value);
            if (stops) {
              const nearest = stops.reduce((a, b) =>
                Math.abs(b.value - raw) < Math.abs(a.value - raw) ? b : a
              );
              if (Math.abs(nearest.value - raw) <= (max - min) * 0.02) {
                onChange(nearest.value);
                return;
              }
            }
            onChange(raw);
          }}
          className={cn(
            'absolute inset-0 w-full opacity-0 cursor-pointer h-6',
            disabled && 'cursor-not-allowed'
          )}
        />
        {/* Thumb */}
        <div
          className="absolute size-4 rounded-full bg-white shadow-md border border-white/20 pointer-events-none"
          style={{ left: thumbPos }}
        />
      </div>

      {/* Stop labels */}
      {stops && (
        <div className="relative h-4">
          {stops.map(stop => {
            const stopPct = ((stop.value - min) / (max - min)) * 100;
            return (
              <button
                key={stop.value}
                type="button"
                onClick={() => !disabled && onChange(stop.value)}
                className={cn(
                  'absolute text-xs transition-colors cursor-pointer',
                  stop.value === value ? 'text-primary font-medium' : 'text-char-subtle hover:text-char'
                )}
                style={{
                  left: `calc(8px + (100% - 16px) * ${stopPct} / 100)`,
                  transform: 'translateX(-50%)',
                }}
              >
                {stop.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Current value display — value tracks the thumb, min/max anchored to track ends */}
      <div className="relative h-5">
        <span className="absolute left-0 text-xs text-char-subtle leading-5">{min}{unit}</span>
        <span
          className="absolute text-sm font-semibold text-char tabular-nums leading-5 -translate-x-1/2"
          style={{ left: `calc(8px + (100% - 16px) * ${pct} / 100)` }}
        >
          {value}{unit}
        </span>
        <span className="absolute right-0 text-xs text-char-subtle leading-5">{max}{unit}</span>
      </div>
    </div>
  );
}