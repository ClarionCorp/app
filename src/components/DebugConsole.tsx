import { useState, useEffect, useRef, type PointerEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger, LogEntry, LogLevel, formatLogTime, formatLogEntry } from '../core/logger';
import { BugIcon, XIcon, TrashIcon, CopySimpleIcon, CaretRightIcon } from '@phosphor-icons/react';
import { runConsoleCommand } from '../core/utilities/console';

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

const defaultConsoleHeight = 360;
const minHeight = 160;

function clampHeight(height: number) {
  return Math.max(minHeight, Math.min(height, window.innerHeight - 80));
}

interface DebugConsoleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebugConsole({ open, onOpenChange }: DebugConsoleProps) {
  const [entries, setEntries] = useState<LogEntry[]>([...logger.getEntries()]);
  const [filter, setFilter] = useState<Filter>('all');
  const [height, setHeight] = useState(defaultConsoleHeight);
  const [resizing, setResizing] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => logger.subscribe(() => setEntries([...logger.getEntries()])), []);

  // Auto-scroll when open and new entries arrive
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [entries.length, open, height]);

  // Keep the panel within the window when it shrinks
  useEffect(() => {
    const onResize = () => setHeight(h => clampHeight(h));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.level === filter);

  const badgeCount = entries.filter(e => e.level === 'error').length;
  const warnCount  = entries.filter(e => e.level === 'warn').length;

  function copyAll() {
    navigator.clipboard.writeText(entries.map(formatLogEntry).join('\n'));
  }

  function onResizeStart(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  }

  function onResizeMove(e: PointerEvent<HTMLDivElement>) {
    if (!resizing) return;
    setHeight(clampHeight(window.innerHeight - e.clientY));
  }

  function onResizeEnd(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setResizing(false);
  }

  async function submitCommand() {
    const command = input.trim();
    if (!command) return;
    setHistory(h => (h[h.length - 1] === command ? h : [...h, command]));
    setHistoryIndex(null);
    setInput('');
    await runConsoleCommand(command);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCommand();
    } else if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      e.preventDefault();
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (e.key === 'ArrowDown') {
      if (historyIndex === null) return;
      e.preventDefault();
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    }
  }

  return (
    <div className="fixed bottom-0 right-0 z-200 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height }}
            exit={{ opacity: 0, height: 0 }}
            transition={resizing ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            className={[
              'relative w-screen bg-zinc-950/95 backdrop-blur border border-zinc-800 border-b-0 rounded-tl-xl overflow-hidden flex flex-col pointer-events-auto',
              resizing ? 'select-none' : '',
            ].join(' ')}
          >
            {/* Resize handle */}
            <div
              onPointerDown={onResizeStart}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              onPointerCancel={onResizeEnd}
              onDoubleClick={() => setHeight(clampHeight(defaultConsoleHeight))}
              title="Drag to resize"
              className={[
                'absolute top-0 left-0 right-0 h-1.5 z-10 cursor-ns-resize transition-colors',
                resizing ? 'bg-zinc-600/60' : 'hover:bg-zinc-700/60',
              ].join(' ')}
            />

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
                onClick={() => onOpenChange(false)}
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
                  <span className="text-zinc-700 shrink-0 tabular-nums">{formatLogTime(entry.timestamp)}</span>
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

            {/* Command line */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-1.5 px-3 py-1.5 border-t border-zinc-800 bg-zinc-900/60 shrink-0 cursor-text"
            >
              <CaretRightIcon size={11} weight="bold" className="text-zinc-600 shrink-0" />
              <input
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setHistoryIndex(null);
                }}
                onKeyDown={onInputKeyDown}
                spellCheck={false}
                autoComplete="off"
                placeholder="Enter a command…"
                className="flex-1 min-w-0 bg-transparent outline-none font-mono text-[11px] text-zinc-300 placeholder:text-zinc-700"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
