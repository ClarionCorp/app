import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DownloadSimpleIcon,
  ArrowCounterClockwiseIcon,
  ArrowsClockwiseIcon,
  TrashIcon,
  CheckCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { checkForUpdates, installUE4SS, unInstallUE4SS } from '../../core/utilities/ue4ss';
import { Button } from '../UI/Button';
import { ProgressBar } from '../UI/ProgressBar';

type ActionStatus = 'idle' | 'running' | 'done' | 'error';

type UE4SSSectionProps = {
  installed: boolean;
  onInstalled?: () => void;
  onUninstalled?: () => void;
};

export function UE4SSSection({ installed, onInstalled, onUninstalled }: UE4SSSectionProps) {
  const [action, setAction] = useState<'install' | 'update' | 'uninstall' | null>(null);
  const [status, setStatus] = useState<ActionStatus>('idle');
  const [percent, setPercent] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [updateFound, setUpdateFound] = useState(false);

  async function handleInstall() {
    setAction('install');
    setStatus('running');
    setPercent(null);
    setMessage('');
    try {
      await installUE4SS((_, pct, msg) => {
        setPercent(pct);
        setMessage(msg);
      });
      setStatus('done');
      setTimeout(reset, 2000);
      onInstalled?.();
    } catch {
      setStatus('error');
    }
  }

  async function handleUpdate() {
    setAction('update');
    setStatus('running');
    try {
      setPercent(0);
      setMessage('Checking for updates...');
      const release = await checkForUpdates();

      if (!release) {
        setStatus('done'); // already up to date
        setTimeout(reset, 2000);
        return;
      }

      setUpdateFound(true);

      await unInstallUE4SS((_, pct, msg) => {
        setPercent(pct);
        setMessage(msg);
      });

      await installUE4SS((_, pct, msg) => {
        setPercent(pct);
        setMessage(msg);
      });

      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  async function handleUninstall() {
    setAction('uninstall');
    setStatus('running');
    setPercent(null);
    setMessage('Uninstalling UE4SS...');
    try {
      await unInstallUE4SS((_, pct, msg) => {
        setPercent(pct);
        setMessage(msg);
      });
      setStatus('done');
      setTimeout(reset, 2000);
      onUninstalled?.();
    } catch {
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setAction(null);
    setPercent(null);
    setMessage('');
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {/* Idle (Not installed) */}
        {!installed && status === 'idle' && (
          <motion.div key="not-installed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button variant="primary" size="md" onClick={handleInstall} iconLeft={<DownloadSimpleIcon size={16} weight="bold" />}>
              Install UE4SS
            </Button>
          </motion.div>
        )}

        {/* Idle (Installed) */}
        {installed && status === 'idle' && (
          <motion.div key="installed" className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button variant="primary" size="md" onClick={handleUpdate} iconLeft={<ArrowsClockwiseIcon size={16} weight="bold" />}>
              Check for Updates
            </Button>
            <Button variant="danger-ghost" size="md" onClick={handleUninstall} iconLeft={<TrashIcon size={16} weight="bold" />}>
              Uninstall
            </Button>
          </motion.div>
        )}

        {/* Running */}
        {status === 'running' && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar percent={percent} message={message} />
          </motion.div>
        )}

        {/* Done */}
        {status === 'done' && (
          <motion.div
            key="done"
            className="flex items-center gap-2 text-sm text-green-400"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircleIcon size={16} weight="duotone" />
            {action === 'install' && 'UE4SS installed successfully!'}
            {action === 'update' && (updateFound ? 'UE4SS updated successfully!' : 'Already up to date.')}
            {action === 'uninstall' && 'UE4SS uninstalled.'}
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            key="error"
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm text-red-400 flex items-center gap-2">
              <WarningIcon size={16} weight="duotone" />
              {action === 'install' ? 'Installation failed.' : 'Action failed.'} You can try again.
            </p>
            <Button variant="ghost" size="md" onClick={reset} iconLeft={<ArrowCounterClockwiseIcon size={14} weight="bold" />}>
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}