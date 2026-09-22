import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, CheckIcon } from '@phosphor-icons/react';
import { useTheme } from './ThemeProvider';
import { ThemeMeta, themeMeta, themes } from '../../../core/styles/theme';

interface ThemePickerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemePicker({ open, onClose }: ThemePickerProps) {
  const { theme, setTheme } = useTheme();
  const darkThemes = themes.filter(t => (themeMeta[t]?.type ?? 'dark') === 'dark');
  const lightThemes = themes.filter(t => themeMeta[t]?.type === 'light');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-150 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-overlay/60 backdrop-blur-xs" onClick={onClose} />
          <motion.div
            className="relative z-10 w-4xl max-w-[95vw] max-h-[85vh] flex flex-col rounded-xl bg-surface border border-surface-border shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-6 shrink-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold text-char">Choose a Theme</span>
                <span className="text-xs text-char-subtle">Pick your preferred colorway for the app.</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-char-subtle hover:text-char transition-colors cursor-pointer"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-5">
              <ThemeGroup label="Dark Themes" keys={darkThemes} theme={theme} setTheme={setTheme} />
              <ThemeGroup label="Light Themes" keys={lightThemes} theme={theme} setTheme={setTheme} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ThemeGroupProps {
  label: string;
  keys: string[];
  theme: string;
  setTheme: (theme: string) => void;
}

function ThemeGroup({ label, keys, theme, setTheme }: ThemeGroupProps) {
  if (keys.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-2xl font-bold tracking-wider text-char-subtle">{label}</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {keys.map(t => (
          <ThemeTile
            key={t}
            themeKey={t}
            meta={themeMeta[t] ?? { label: t, description: '', icon: '/download.png', type: 'dark' }}
            selected={t === theme}
            onSelect={() => setTheme(t)}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemeTileProps {
  themeKey: string;
  meta: ThemeMeta;
  selected: boolean;
  onSelect: () => void;
}

function ThemeTile({ themeKey, meta, selected, onSelect }: ThemeTileProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -2.5 }}
      whileTap={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={`group flex flex-col text-left rounded-lg border overflow-hidden cursor-pointer transition-[background-color,border-color,box-shadow] duration-150 hover:shadow-lg hover:shadow-black/20 ${
        selected
          ? 'border-primary bg-surface-raised shadow-accent-sm'
          : 'border-surface-border bg-surface-subtle hover:border-surface-active hover:bg-surface-raised'
      }`}
    >
      {/* A preview for a mini skeleton of the Settings page using that theme's own colors */}
      <div data-theme={themeKey} className="relative shrink-0">
        <div className="relative flex h-44 overflow-hidden bg-(--theme-background)">
          <div className="flex w-6 shrink-0 flex-col items-center gap-2 border-r border-(--theme-surface-border) bg-(--theme-navbar) py-2.5">
            <span className="size-2 rounded-sm bg-(--theme-char-subtle)/30" />
            <span className="size-2 rounded-sm bg-(--theme-char-subtle)/30" />
            <span className="size-2 rounded-sm bg-(--theme-char-subtle)/30" />
            <span className="size-2 rounded-sm bg-(--theme-char-subtle)/30" />
            <div className="flex-1" />
            <span className="flex size-3.5 items-center justify-center rounded-sm bg-(--theme-primary)/20">
              <span className="size-1.5 rounded-full bg-(--theme-primary)" />
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2 px-2.5 py-2.5">
            <div className="flex items-center justify-between">
              <span className="h-1 w-6 rounded-full bg-(--theme-char-subtle)/50" />
              <span className="h-1 w-5 rounded-full bg-(--theme-char-subtle)/30" />
            </div>

            <span className="h-1.5 w-9 rounded-full bg-(--theme-char-subtle)/70" />

            <div className="flex flex-col gap-1.5 mt-0.5">
              <SkeletonRow accent="toggle-on" />
              <SkeletonRow accent="field" />
              <SkeletonRow accent="toggle-off" />
            </div>

            <div className="flex-1" />

            <div className="flex items-center justify-between border-t border-(--theme-surface-border)/70 pt-1.5">
              <span className="h-1 w-7 rounded-full bg-(--theme-error)/60" />
              <span className="h-2 w-5 rounded-sm bg-(--theme-error)" />
            </div>
          </div>
        </div>

        {selected && (
          <span className="absolute top-2 right-2 flex items-center justify-center size-4 rounded-full bg-(--theme-primary) text-(--theme-background)">
            <CheckIcon size={10} weight="bold" />
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-2.5 p-3">
        <img
          src={meta.icon}
          alt=""
          className="aspect-square h-20 shrink-0 rounded-md object-cover"
        />
        <div className="flex flex-col justify-center gap-0.5 min-w-0">
          <span className="text-sm font-medium text-char">{meta.label}</span>
          <span className="text-[11px] text-char-subtle leading-snug">{meta.description}</span>
        </div>
      </div>
    </motion.button>
  );
}

function SkeletonRow({ accent }: { accent: 'toggle-on' | 'toggle-off' | 'field' }) {
  return (
    <div className="flex items-center justify-between border-b border-(--theme-surface-border)/60 pb-1.5">
      <div className="flex flex-col gap-1">
        <span className="h-1 w-8 rounded-full bg-(--theme-char-subtle)/60" />
        <span className="h-1 w-6 rounded-full bg-(--theme-char-subtle)/35" />
      </div>
      {accent === 'toggle-on' && (
        <span className="h-1.5 w-3 rounded-full bg-(--theme-primary)" />
      )}
      {accent === 'toggle-off' && (
        <span className="h-1.5 w-3 rounded-full border border-(--theme-surface-border) bg-(--theme-surface-raised)" />
      )}
      {accent === 'field' && (
        <span className="h-1.5 w-5 rounded-sm border border-(--theme-surface-border) bg-(--theme-surface-raised)" />
      )}
    </div>
  );
}
