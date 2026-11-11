import { useState } from "react";
import { exit } from "@tauri-apps/plugin-process";
import { Button } from "../../UI/Button";
import { ConfirmModal } from "../../UI/ConfirmModal";
import { ProgressBar } from "../../UI/ProgressBar";
import { useToast } from "../../UI/Toast";
import { resetDatabase } from "../../../core/database/driver";
import { unInstallUE4SS } from "../../../core/utilities/ue4ss";
import { SettingRow } from "../SettingRow";
import { SettingsSectionProps } from "../../../types/settings";

export function DangerZoneSettings({ settings }: Pick<SettingsSectionProps, 'settings'>) {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [uninstallModalOpen, setUninstallModalOpen] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [uninstallProgress, setUninstallProgress] = useState<{ percent: number | null; message: string } | null>(null);
  const { toast } = useToast();

  const handleUninstall = async () => {
    if (!settings.gameDirectory) return;
    setUninstallModalOpen(false);
    setUninstalling(true);
    setUninstallProgress({ percent: null, message: 'Starting...' });
    try {
      await unInstallUE4SS(settings.gameDirectory, (_stage, percent, message) => {
        setUninstallProgress({ percent, message });
      });
      await exit(0);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to uninstall UE4SS.', 'error');
    }
    setUninstalling(false);
    setUninstallProgress(null);
  };

  return (
    <>
      <div className="flex flex-col divide-y divide-error/10 rounded-lg overflow-hidden">
        <SettingRow
          title="Reset Database"
          subtitle="Wipes all local data. This cannot be undone."
        >
          <Button variant="danger" size="sm" onClick={() => setResetModalOpen(true)}>Reset</Button>
        </SettingRow>

        <SettingRow
          title="Uninstall UE4SS"
          subtitle="Removes UE4SS and companion mods from your game folder."
          vertical={uninstalling}
        >
          {uninstalling
            ? <ProgressBar percent={uninstallProgress?.percent ?? null} message={uninstallProgress?.message} />
            : <Button variant="danger" size="sm" onClick={() => setUninstallModalOpen(true)}>Uninstall</Button>
          }
        </SettingRow>
      </div>

      <ConfirmModal
        open={uninstallModalOpen}
        title="Uninstall UE4SS & Close App"
        description="This will remove UE4SS and all companion mods from OS, then close the App. Are you sure?"
        confirmLabel="Uninstall"
        onConfirm={handleUninstall}
        onCancel={() => setUninstallModalOpen(false)}
      />
      <ConfirmModal
        open={resetModalOpen}
        title="Reset Local Database"
        description="This will wipe all local data (incl. match history) and cannot be undone. Are you sure?"
        confirmLabel="Reset"
        onConfirm={async () => { setResetModalOpen(false); await resetDatabase(); }}
        onCancel={() => setResetModalOpen(false)}
      />
    </>
  );
}
