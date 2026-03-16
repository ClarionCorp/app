import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger, LogEntry, LogLevel } from '../core/logger';
import { BugIcon, XIcon, TrashIcon, CopySimpleIcon } from '@phosphor-icons/react';

const LEVEL_TEXT: Record<LogLevel, string> = {
  debug: 'text-zinc-500',
  info:  'text-sky-400',
  warn:  'text-amber-400',
  error: 'text-red-400',
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  debug: 'text-zinc-600',
  info:  'text-sky-500',
  warn:  'text-amber-500',
  error: 'text-red-500',
};

type Filter = LogLevel | 'all';
const FILTERS: Filter[] = ['all', 'debug', 'info', 'warn', 'error'];

function fmt(date: Date): string {
  return (
    date.toTimeString().slice(0, 8) +
    '.' +
    String(date.getMilliseconds()).padStart(3, '0')
  );
}

function entryText(e: LogEntry): string {
  return `[${fmt(e.timestamp)}] [${e.level.toUpperCase().padEnd(5)}] ${e.message}${
    e.detail ? '\n  ' + e.detail.replace(/\n/g, '\n  ') : ''
  }`;
}

export function DebugConsole() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([...logger.getEntries()]);
  const [filter, setFilter] = useState<Filter>('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => logger.subscribe(() => setEntries([...logger.getEntries()])), []);

  // Auto-scroll when open and new entries arrive
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [entries.length, open]);

  // Keyboard shortcut: Ctrl+`
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') setOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.level === filter);

  const badgeCount = entries.filter(e => e.level === 'error').length;
  const warnCount  = entries.filter(e => e.level === 'warn').length;

  function copyAll() {
    navigator.clipboard.writeText(entries.map(entryText).join('\n'));
  }

  return (
    <div className="fixed bottom-0 right-0 z-200 flex flex-col items-end pointer-events-none">
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 320 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-200 bg-zinc-950/95 backdrop-blur border border-zinc-800 border-b-0 rounded-tl-xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
              <BugIcon size={13} className="text-zinc-500 shrink-0" />
              <span className="text-zinc-500 text-xs font-mono mr-1">Debug Console</span>

              {/* Filter tabs */}
              <div className="flex items-center gap-0.5 flex-1">
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={[
                      'px-2 py-0.5 text-[11px] rounded font-mono capitalize transition-colors cursor-pointer',
                      filter === f ? 'bg-zinc-700 text-white' : 'text-zinc-600 hover:text-zinc-300',
                    ].join(' ')}
                  >
                    {f}
                    {f === 'error' && badgeCount > 0 && (
                      <span className="ml-1 text-red-400">{badgeCount}</span>
                    )}
                    {f === 'warn' && warnCount > 0 && (
                      <span className="ml-1 text-amber-400">{warnCount}</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={copyAll}
                title="Copy all logs"
                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <CopySimpleIcon size={13} />
              </button>
              <button
                onClick={logger.clear}
                title="Clear"
                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <TrashIcon size={13} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <XIcon size={13} weight="bold" />
              </button>
            </div>

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-5 px-2 py-1.5 space-y-px">
              {filtered.length === 0 && (
                <div className="text-zinc-700 text-center py-6">No entries</div>
              )}
              {filtered.map(entry => (
                <div key={entry.id} className="flex gap-2 hover:bg-zinc-900/40 px-1 rounded">
                  <span className="text-zinc-700 shrink-0 tabular-nums">{fmt(entry.timestamp)}</span>
                  <span className={`shrink-0 w-11 ${LEVEL_LABEL[entry.level]}`}>
                    [{entry.level.toUpperCase()}]
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={LEVEL_TEXT[entry.level]}>{entry.message}</span>
                    {entry.detail && (
                      <pre className="text-zinc-600 whitespace-pre-wrap break-all text-[10px] mt-0.5">
                        {entry.detail}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Debug console (Ctrl+`)"
        className={[
          'pointer-events-auto m-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
          'text-xs font-mono transition-colors cursor-pointer border',
          open
            ? 'bg-zinc-700 border-zinc-600 text-white'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-600 hover:text-zinc-300',
        ].join(' ')}
      >
        <BugIcon size={13} />
        {!open && badgeCount > 0 && <span className="text-red-400 font-bold">{badgeCount}E</span>}
        {!open && warnCount > 0  && <span className="text-amber-400">{warnCount}W</span>}
      </button>
    </div>
  );
}
