'use client';

import { useState, useEffect } from 'react';
import { ArrowCounterClockwiseIcon, ChartBarIcon, FireIcon, WarningIcon, WrenchIcon } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '../components/UI/Checkbox';
import { getAppSettings, getTelemetrySettings, upsertSettings } from '../core/database/queries';
import { TelemetryOption, telemetryOptions } from '../types/settings';
import { Button } from '../components/UI/Button';
import { resetDatabase } from '../core/database/driver';
import { UE4SSSection } from '../components/Mods/UE4SSManager';

export default function SettingsPage() {
  const [telemetry, setTelemetry] = useState<Record<TelemetryOption, boolean>>({
    game_stats: true,
    play_state: true,
    play_count: true,
  });
  const [sideCarEnabled, setSideCar] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setTelemetry(await getTelemetrySettings());
      const appSettings = await getAppSettings();
      setSideCar(!!appSettings?.ue4ss);
    })();
  }, []);

  async function handleToggle(key: TelemetryOption, val: boolean) {
    const updated = { ...telemetry, [key]: val };
    setTelemetry(updated);
    await upsertSettings({
      sendStats: updated.game_stats,
      sendPlayState: updated.play_state,
      sendPlayCount: updated.play_count,
    });
  }

  async function handleConfirmReset() {
    setConfirmOpen(false);
    await resetDatabase();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-char tracking-tight">Settings</h1>
        <p className="text-sm text-char-subtle">Changes are saved automatically.</p>
      </div>

      <div className="flex flex-col gap-4 pt-5">
        <div className="flex flex-row gap-3 items-center ml-1">
          <ChartBarIcon size={16} weight="duotone" className="text-char-subtle" />
          <p className="text-sm font-medium text-char">Telemetry</p>
        </div>

        <div className="flex flex-col gap-2">
          {telemetryOptions.map((opt) => (
            <Checkbox
              key={opt.value}
              checked={telemetry[opt.value]}
              onChange={(val) => handleToggle(opt.value, val)}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-5">
        <div className="flex flex-row gap-3 items-center ml-1">
          <WrenchIcon size={16} weight="duotone" className="text-char-subtle" />
          <p className="text-sm font-medium text-char">UE4SS Sidecar</p>
        </div>
        <UE4SSSection
          installed={sideCarEnabled}
          onInstalled={() => setSideCar(true)}
          onUninstalled={() => setSideCar(false)}
        />
      </div>

      <div className="flex flex-col gap-4 pt-10">
        <div className="flex flex-row gap-3 items-center ml-1">
          <FireIcon size={16} weight="duotone" className="text-char-subtle" />
          <p className="text-sm font-medium text-char">Danger Zone</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="danger"
            size="md"
            iconLeft={<ArrowCounterClockwiseIcon size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            Reset Database
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setConfirmOpen(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-sm mx-4 bg-surface border border-background-border rounded-xl p-6 flex flex-col gap-4 shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 size-9 rounded-lg bg-error/10 flex items-center justify-center">
                  <WarningIcon size={20} className="text-error" weight="fill" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-char font-semibold text-sm">Reset Database</span>
                  <span className="text-char-secondary text-sm leading-relaxed">
                    This will permanently delete all local data and restart the app. This action cannot be undone.
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleConfirmReset}>
                  Reset
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}