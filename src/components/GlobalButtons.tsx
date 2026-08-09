import { useEffect, useState } from 'react';
import { DebugConsole } from './DebugConsole';
import { HelpModal } from './HelpModal';
import { logger, formatLogEntry } from '../core/logger';

export function GlobalButtons() {
  const [debugOpen, setDebugOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') setDebugOpen(v => !v);
      if (e.key === 'F6') setHelpOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function copyAllLogs() {
    navigator.clipboard.writeText(logger.getEntries().map(formatLogEntry).join('\n'));
  }

  return (
    <>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} onCopyLogs={copyAllLogs} />
      <DebugConsole open={debugOpen} onOpenChange={setDebugOpen} />

      <div className="fixed bottom-0 right-0 z-100 flex items-center gap-2 m-3 pointer-events-none">
        <button
          onClick={() => setHelpOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-tertiary/20 hover:bg-tertiary/60 border border-tertiary/10 text-char-secondary hover:text-char transition-colors cursor-pointer"
        >
          <img src="/aimi/Pat.png" alt="" className="size-6 rounded-full object-cover" />
          <span className="text-xs font-medium">Help</span>
        </button>
      </div>
    </>
  );
}
