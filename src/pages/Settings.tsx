import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowSquareOutIcon,
  BugIcon,
  FireIcon,
} from "@phosphor-icons/react";
import { getAppSettings, upsertAppSettings } from "../core/database/queries";
import { DEFAULT_SETTINGS, QueuePopType, SectionId, Settings, SettingsSections } from "../types/settings";
import { AccountSettings } from "../components/Settings/Sections/Account";
import { AppearanceSettings } from "../components/Settings/Sections/Appearance";
import { QualityOfLifeSettings } from "../components/Settings/Sections/QualityOfLife";
import { AdvancedSettings } from "../components/Settings/Sections/Advanced";
import { DangerZoneSettings } from "../components/Settings/Sections/DangerZone";

export type { QueuePopType };

const SAVE_DELAY_MS = 300;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [active, setActive] = useState<SectionId>('account');
  const pending = useRef<Partial<Settings>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAppSettings().then(s => {
      if (!s) return;
      setSettings({
        gameDirectory: s.gameDirectory ?? null,
        drpcEnabled: s.drpcEnabled,
        notifyQueuePop: s.notifyQueuePop,
        queuePopVol: s.queuePopVol,
        queuePopType: (s.queuePopType as QueuePopType) ?? 'Ai.Mi',
        exitOnGameClose: s.exitOnGameClose,
        prefDataSource: s.prefDataSource ?? 'ClarionCorp',
        openGameWithApp: s.openGameWithApp,
        releaseChannel: s.releaseChannel,
        nameplateTransparency: s.nameplateTransparency,
        useCustomCharArt: s.useCustomCharArt,
        compactMode: s.compactMode,
      });
    });

    // Persist anything still pending when leaving the page.
    return () => flush();
  }, []);

  const flush = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length > 0) upsertAppSettings(patch);
  };

  // Applies changes instantly and batches DB writes so sliders don't write on every tick.
  const update = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
    pending.current = { ...pending.current, ...patch };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, SAVE_DELAY_MS);
  };

  const activeLabel = active === 'danger' ? 'Danger Zone' : SettingsSections.find(s => s.id === active)?.label;

  return (
    <motion.div
      className="flex gap-6 px-4 py-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <nav className="sticky top-6 self-start flex flex-col gap-1 w-56 shrink-0">
        <span className="px-3 mb-1 text-xs font-semibold text-char-subtle uppercase tracking-wider">
          Settings
        </span>

        {SettingsSections.map(s => (
          <SectionButton
            key={s.id}
            label={s.label}
            icon={s.icon}
            active={active === s.id}
            onClick={() => setActive(s.id)}
          />
        ))}

        <div className="h-px bg-background-border my-2 mx-2" />

        <SectionButton
          label="Debug"
          icon={<BugIcon size={18} weight="duotone" />}
          trailing={<ArrowSquareOutIcon size={14} className="opacity-60" />}
          onClick={() => navigate('/debug')}
        />
        <SectionButton
          label="Danger Zone"
          icon={<FireIcon size={18} weight="duotone" />}
          active={active === 'danger'}
          danger
          onClick={() => setActive('danger')}
        />
      </nav>

      <div className="flex-1 min-w-0">
        <h1 className={`text-xl font-bold mb-4 ${active === 'danger' ? 'text-error' : 'text-char'}`}>
          {activeLabel}
        </h1>
        <div className={`h-px mb-4 ${active === 'danger' ? 'bg-error/30' : 'bg-background-border'}`} />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {active === 'account' && <AccountSettings />}
            {active === 'appearance' && <AppearanceSettings settings={settings} update={update} />}
            {active === 'qol' && <QualityOfLifeSettings settings={settings} update={update} />}
            {active === 'advanced' && <AdvancedSettings settings={settings} update={update} />}
            {active === 'danger' && <DangerZoneSettings settings={settings} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface SectionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  trailing?: React.ReactNode;
}

function SectionButton({ label, icon, onClick, active, danger, trailing }: SectionButtonProps) {
  const colors = danger
    ? active ? 'bg-error/10 text-error' : 'text-error/80 hover:bg-error/10 hover:text-error'
    : active ? 'bg-primary/10 text-primary' : 'text-char-subtle hover:bg-surface-overlay hover:text-char';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer ${colors}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}
