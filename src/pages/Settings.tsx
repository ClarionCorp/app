import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CaretDownIcon, FireIcon, FolderOpenIcon } from "@phosphor-icons/react";
import { open } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path";
import { getAppSettings, upsertAppSettings } from "../core/database/queries";
import { Toggle } from "../components/UI/Toggle";
import { Slider } from "../components/UI/Slider";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Dropdown } from "../components/UI/Dropdown";
import { discordRpc, startRpc, stopRpc, DEFAULT_ACTIVITY } from "../core/utilities/discord";
import { useTheme } from "../components/UI/Theme/ThemeProvider";
import { themes } from "../core/styles/theme";

export type QueuePopType = 'Ai.Mi' | 'Generic';

type Settings = {
  gameDirectory: string | null;
  drpcEnabled: boolean;
  notifyQueuePop: boolean;
  queuePopVol: number;
  queuePopType: QueuePopType;
};

const DEFAULT_SETTINGS: Settings = {
  gameDirectory: null,
  drpcEnabled: true,
  notifyQueuePop: false,
  queuePopVol: 50,
  queuePopType: 'Ai.Mi',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [queuePopTypeOpen, setQueuePopTypeOpen] = useState(false);
  const queuePopTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeTriggerRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    getAppSettings().then(s => {
      if (!s) return;
      setSettings({
        gameDirectory: s.gameDirectory ?? null,
        drpcEnabled: s.drpcEnabled,
        notifyQueuePop: s.notifyQueuePop,
        queuePopVol: s.queuePopVol,
        queuePopType: (s.queuePopType as QueuePopType) ?? 'Ai.Mi',
      });
    });
  }, []);

  const update = async (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
    await upsertAppSettings(patch);
  };

  const handlePickDir = async () => {
    const selected = await open({
      filters: [{ name: 'Executable', extensions: ['exe'] }],
      title: 'Select OmegaStrikers.exe',
    });
    if (!selected) return;
    const dir = await dirname(selected as string);
    await update({ gameDirectory: dir });
  };

  return (
    <motion.div
      className="flex flex-col px-4 py-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <h1 className="text-base font-semibold text-char mb-4">Settings</h1>

      <div className="flex flex-col divide-y divide-background-border">
        <SettingRow
          title="Game Directory"
          subtitle="Path to your OmegaStrikers installation folder."
          stretch
        >
          <div className="flex items-center gap-2 min-w-0">
            <Input
              readOnly
              value={settings.gameDirectory ?? ''}
              placeholder="Not set"
              className="flex-1 min-w-0 w-85"
              inputClassName="text-xs font-mono truncate"
            />
            <Button
              variant="surface"
              size="sm"
              onClick={handlePickDir}
              iconLeft={<FolderOpenIcon size={14} />}
              className="h-9"
            >
              Browse
            </Button>
          </div>
        </SettingRow>
        
        <SettingRow
          title="Sync Match History"
          subtitle="Uploads current Match History to the Cloud and downloads all previous games."
        >
          <Button
            variant="secondary"
            size="sm"
          >
            Sync
          </Button>
        </SettingRow>

        <SettingRow
          title="Discord Rich Presence"
          subtitle="Show your current activity in Discord."
        >
          <Toggle
            enabled={settings.drpcEnabled}
            onChange={async v => {
              await update({ drpcEnabled: v });
              if (v) {
                await startRpc();
                await discordRpc?.updateActivity(DEFAULT_ACTIVITY);
              } else {
                await stopRpc();
              }
            }}
          />
        </SettingRow>

        <SettingRow
          title="Theme"
          subtitle="Color theme for the app."
        >
          <div className="relative">
            <button
              ref={themeTriggerRef}
              onClick={() => setThemeOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-background-border text-sm text-char hover:bg-surface-raised transition-colors duration-100 cursor-pointer capitalize"
            >
              {theme}
              <CaretDownIcon size={12} className="opacity-60" />
            </button>
            <Dropdown
              triggerRef={themeTriggerRef}
              open={themeOpen}
              onClose={() => setThemeOpen(false)}
              items={themes.map(t => ({ label: t, onClick: () => setTheme(t as typeof theme) }))}
            />
          </div>
        </SettingRow>

        <SettingRow
          title="Queue Pop Notification"
          subtitle="Play a sound when your queue pops."
        >
          <Toggle
            enabled={settings.notifyQueuePop}
            onChange={v => update({ notifyQueuePop: v })}
          />
        </SettingRow>

        <SettingRow
          title="Queue Pop Sound"
          subtitle="The sound pack used for queue pop notifications."
          disabled={!settings.notifyQueuePop}
        >
          <div className="relative">
            <button
              ref={queuePopTypeTriggerRef}
              onClick={() => setQueuePopTypeOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-background-border text-sm text-char hover:bg-surface-raised transition-colors duration-100 cursor-pointer"
            >
              {settings.queuePopType}
              <CaretDownIcon size={12} className="opacity-60" />
            </button>
            <Dropdown
              triggerRef={queuePopTypeTriggerRef}
              open={queuePopTypeOpen}
              onClose={() => setQueuePopTypeOpen(false)}
              items={[
                { label: 'Ai.Mi', onClick: () => update({ queuePopType: 'Ai.Mi' }) },
                { label: 'Generic', onClick: () => update({ queuePopType: 'Generic' }) },
              ]}
            />
          </div>
        </SettingRow>

        <SettingRow
          title="Queue Pop Volume"
          subtitle="Volume level for the queue pop sound."
          vertical
          disabled={!settings.notifyQueuePop}
        >
          <Slider
            min={0}
            max={100}
            value={settings.queuePopVol}
            onChange={v => update({ queuePopVol: v })}
            unit="%"
            disabled={!settings.notifyQueuePop}
          />
        </SettingRow>
      </div>

      {/* Danger Zone */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <FireIcon size={16} className="text-error shrink-0" weight="duotone" />
          <span className="text-xs font-semibold text-error uppercase tracking-wider">
            Danger Zone
          </span>
          <div className="flex-1 h-px bg-error/30" />
        </div>

        <div className="flex flex-col divide-y divide-error/10 rounded-lg overflow-hidden">

          <SettingRow
            title="Reset Database"
            subtitle="Wipes all local data. This cannot be undone."
          >
            <Button variant="danger" size="sm">Reset</Button>
          </SettingRow>

          <SettingRow
            title="Uninstall UE4SS"
            subtitle="Removes UE4SS and companion mods from your game folder."
          >
            <Button variant="danger" size="sm">Uninstall</Button>
          </SettingRow>
        </div>
      </div>
    </motion.div>
  );
}

interface SettingRowProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  vertical?: boolean;
  stretch?: boolean;
  disabled?: boolean;
}

function SettingRow({ title, subtitle, children, vertical, stretch, disabled }: SettingRowProps) {
  return (
    <div className={`flex gap-4 py-3.5 px-1 transition-opacity duration-200 ${vertical ? 'flex-col' : 'items-center justify-between'} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-char">{title}</span>
        <span className="text-xs text-char-subtle">{subtitle}</span>
      </div>
      <div className={vertical ? 'w-full' : stretch ? 'flex min-w-0 justify-end' : 'shrink-0'}>{children}</div>
    </div>
  );
}
