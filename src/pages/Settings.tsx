'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon } from '@phosphor-icons/react';
import { Checkbox } from '../components/UI/Checkbox';
import { getTelemetrySettings, upsertSettings } from '../core/database/queries';
import { TelemetryOption, telemetryOptions } from '../types/settings';

export default function SettingsPage() {
  const [telemetry, setTelemetry] = useState<Record<TelemetryOption, boolean>>({
    game_stats: true,
    play_state: true,
    play_count: true,
  });

  useEffect(() => {
    (async () => {
      setTelemetry(await getTelemetrySettings());
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-char tracking-tight">Settings</h1>
        <p className="text-sm text-char-subtle">Changes are saved automatically.</p>
      </div>

      <div className="flex flex-col gap-4">
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
    </div>
  );
}