export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  timestamp: Date;
  level: LogLevel;
  message: string;
  /** Serialized extra data (objects, errors, etc.) */
  detail?: string;
}

const MAX_ENTRIES = 500;
let _nextId = 0;
const _entries: LogEntry[] = [];
const _subscribers = new Set<() => void>();

function serialize(data: unknown): string | undefined {
  if (data === undefined) return undefined;
  if (typeof data === 'string') return data;
  if (data instanceof Error) return `${data.name}: ${data.message}${data.stack ? '\n' + data.stack : ''}`;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function push(level: LogLevel, message: string, detail?: string) {
  if (_entries.length >= MAX_ENTRIES) _entries.shift();
  _entries.push({ id: _nextId++, timestamp: new Date(), level, message, detail });
  _subscribers.forEach(fn => fn());
}

export const logger = {
  debug: (message: string, data?: unknown) => push('debug', message, serialize(data)),
  info:  (message: string, data?: unknown) => push('info',  message, serialize(data)),
  warn:  (message: string, data?: unknown) => push('warn',  message, serialize(data)),
  error: (message: string, data?: unknown) => push('error', message, serialize(data)),
  getEntries: (): readonly LogEntry[] => _entries,
  clear: () => { _entries.length = 0; _subscribers.forEach(fn => fn()); },
  subscribe: (fn: () => void): (() => void) => {
    _subscribers.add(fn);
    return () => _subscribers.delete(fn);
  },
};

// Intercept all console.* calls so existing logs are captured automatically.
// The original methods still fire so the browser devtools console still works.
const _origLog   = console.log.bind(console);
const _origDebug = console.debug.bind(console);
const _origWarn  = console.warn.bind(console);
const _origError = console.error.bind(console);

function argsToString(args: unknown[]): { msg: string; detail?: string } {
  if (args.length === 0) return { msg: '' };
  const [first, ...rest] = args;
  const msg = typeof first === 'string' ? first : (serialize(first) ?? '');
  const detail = rest.length > 0 ? rest.map(a => serialize(a) ?? '').join('\n') : undefined;
  return { msg, detail };
}

console.log   = (...args) => { _origLog(...args);   const { msg, detail } = argsToString(args); push('info',  msg, detail); };
console.debug = (...args) => { _origDebug(...args); const { msg, detail } = argsToString(args); push('debug', msg, detail); };
console.warn  = (...args) => { _origWarn(...args);  const { msg, detail } = argsToString(args); push('warn',  msg, detail); };
console.error = (...args) => { _origError(...args); const { msg, detail } = argsToString(args); push('error', msg, detail); };
