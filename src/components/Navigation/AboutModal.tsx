import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  XIcon,
  IdentificationCardIcon,
  DesktopIcon,
  FolderOpenIcon,
  HeartbeatIcon,
  RssIcon,
} from '@phosphor-icons/react';
import { platform, version as osVersion, arch } from '@tauri-apps/plugin-os';
import { openUrl } from '@tauri-apps/plugin-opener';
import { getAppSettings, getUser } from '../../core/database/queries';
import { formatBytes, getHardwareInfo, getIdentityPath, getTempDir, type HardwareInfo } from '../../core/utilities/system';
import { version as appVersion, ClarionAPI, OdyAPI, AiMiAPI } from '../../core/constants';
import type { AppSettingsTable, UserTable } from '../../types/database';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-background-border last:border-0">
      <span className="text-xs text-char-subtle shrink-0">{label}</span>
      <span
        className={`text-xs font-medium text-char text-right truncate ${mono ? 'font-mono' : ''}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-raised border border-background-border rounded-lg px-3">
      <div className="flex items-center gap-1.5 pt-2.5 pb-1 text-char-secondary">
        {icon}
        <span className="text-[11px] uppercase font-semibold tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

const endpoints: { label: string; url: string }[] = [
  { label: 'Odyssey API', url: OdyAPI },
  { label: 'Clarion API', url: ClarionAPI },
  { label: 'App API', url: AiMiAPI },
];

export function AboutModal({ open, onClose }: AboutModalProps) {
  const [user, setUser] = useState<UserTable | null>(null);
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [identityPath, setIdentityPath] = useState<string | null>(null);
  const [tempDir, setTempDir] = useState<string | null>(null);
  const [appSettings, setAppSetts] = useState<AppSettingsTable | null>(null);

  useEffect(() => {
    if (!open) return;
    getUser().then(setUser).catch(() => setUser(null));
    getHardwareInfo().then(setHardware).catch(() => setHardware(null));
    getIdentityPath().then(setIdentityPath).catch(() => setIdentityPath(null));
    getTempDir().then(setTempDir).catch(() => setTempDir(null));
    getAppSettings().then(setAppSetts).catch(() => setAppSetts(null));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-150 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-overlay/60 backdrop-blur-xs" onClick={onClose} />
          <motion.div
            className="relative z-10 w-2xl max-w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl bg-surface border border-background-border shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1 text-char-subtle hover:text-char transition-colors cursor-pointer"
            >
              <XIcon size={16} weight="bold" />
            </button>

            <div className="flex flex-col items-center gap-2 px-5 pt-5 pb-3">
              <img
                src="/aimi/Plink.png"
                alt=""
                className="size-16 rounded-lg object-cover"
              />

              <div className="text-center">
                <span className="text-base font-semibold text-char">About</span>
                <p className="text-[11px] text-char-subtle mt-0.5">Version {appVersion}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-3">
                  <Section icon={<IdentificationCardIcon size={14} weight="duotone" />} title="Current Account">
                    <Row label="Username" value={user?.username} />
                    <Row label="Player ID" value={user?.playerId} mono />
                    <Row label="Region" value={user?.matchmakingRegion} />
                  </Section>

                  <Section icon={<HeartbeatIcon size={14} weight="duotone" />} title="Modloader">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-char-subtle">Heartbeat</span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-char-subtle">
                        <span className="relative flex size-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-char-subtle opacity-50 animate-ping" />
                          <span className="relative inline-flex rounded-full size-1.5 bg-char-subtle" />
                        </span>
                        Not Implemented
                      </span>
                    </div>
                  </Section>
                </div>

                <Section icon={<DesktopIcon size={14} weight="duotone" />} title="System">
                  <Row label="Platform" value={`${platform()} (${osVersion()})`} />
                  <Row label="Architecture" value={arch()} />
                  <Row label="CPU" value={hardware?.cpu.brand} />
                  <Row
                    label="Cores"
                    value={hardware ? `${hardware.cpu.logical_cores} logical${hardware.cpu.physical_cores ? ` / ${hardware.cpu.physical_cores} physical` : ''}` : undefined}
                  />
                  <Row
                    label="OS Drive"
                    value={hardware?.os_drive ? `${hardware.os_drive.kind} · ${formatBytes(hardware.os_drive.total_space)}` : undefined}
                  />
                </Section>
              </div>

              <Section icon={<FolderOpenIcon size={14} weight="duotone" />} title="Paths">
                <Row label="Identity Path" value={identityPath ?? 'Not found'} mono />
                <Row label="Game Path" value={appSettings?.gameDirectory ?? 'Not found'} mono />
                <Row label="Temp Directory" value={tempDir} mono />
              </Section>

              <Section icon={<RssIcon size={14} weight="duotone" />} title="Endpoints">
                {endpoints.map(({ label, url }) => (
                  <Row key={label} label={label} value={url.replace('https://', '')} mono />
                ))}
              </Section>

              <div className="mt-1 flex flex-col items-center gap-0.5">
                <span className="text-[11px] text-char-subtle">
                  Made with ❤️ by {' '}
                  <a onClick={() => openUrl('https://blals.com')} className="hover:text-match-ally hover:underline cursor-pointer transition-colors">blals</a>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
