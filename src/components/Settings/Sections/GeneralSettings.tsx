import { FolderOpenIcon } from "@phosphor-icons/react";
import { open } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path";
import { Toggle } from "../../UI/Toggle";
import { Button } from "../../UI/Button";
import { Input } from "../../UI/Input";
import { discordRpc, startRpc, stopRpc, DEFAULT_ACTIVITY } from "../../../core/utilities/discord";
import { PreferredDataSources, ReleaseChannel } from "../../../types/appAPI";
import { SettingGroup, SettingRow } from "../SettingRow";
import { SettingSelect } from "../SettingSelect";
import { SettingsSectionProps } from "../../../types/settings";

export function GeneralSettings({ settings, update }: SettingsSectionProps) {
  const handlePickDir = async () => {
    const selected = await open({
      filters: [{ name: 'Executable', extensions: ['exe'] }],
      title: 'Select OmegaStrikers.exe',
    });
    if (!selected) return;
    const dir = await dirname(selected as string);
    update({ gameDirectory: dir });
  };

  return (
    <>
      <SettingGroup label="Game">
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
          title="Open Game with App"
          subtitle="Automatically open Omega Strikers via Steam when the app is opened."
        >
          <Toggle
            enabled={settings.openGameWithApp}
            onChange={v => update({ openGameWithApp: v })}
          />
        </SettingRow>

        <SettingRow
          title="Close on Game Exit"
          subtitle="Automatically close the app when Omega Strikers is no longer running."
        >
          <Toggle
            enabled={settings.exitOnGameClose}
            onChange={v => update({ exitOnGameClose: v })}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup label="App">
        <SettingRow
          title="Update Release Channel"
          subtitle="Stable is the recommended version. Beta updates more often, but is likely to have issues."
        >
          <SettingSelect
            value={settings.releaseChannel}
            options={ReleaseChannel as ReleaseChannel[]}
            onChange={v => update({ releaseChannel: v })}
            capitalize
          />
        </SettingRow>

        <SettingRow
          title="Preferred Data Source"
          subtitle="Where should we pull Players' ranks from?"
        >
          <SettingSelect
            value={settings.prefDataSource}
            options={PreferredDataSources as PreferredDataSources[]}
            onChange={v => update({ prefDataSource: v })}
            capitalize
          />
        </SettingRow>

        <SettingRow
          title="Discord Rich Presence"
          subtitle="Show your current activity in Discord."
        >
          <Toggle
            enabled={settings.drpcEnabled}
            onChange={async v => {
              update({ drpcEnabled: v });
              if (v) {
                await startRpc();
                await discordRpc?.updateActivity(DEFAULT_ACTIVITY);
              } else {
                await stopRpc();
              }
            }}
          />
        </SettingRow>
      </SettingGroup>
    </>
  );
}
