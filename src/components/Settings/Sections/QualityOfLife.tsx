import { Toggle } from "../../UI/Toggle";
import { Slider } from "../../UI/Slider";
import { SettingGroup, SettingRow } from "../SettingRow";
import { SettingSelect } from "../SettingSelect";
import { QueuePopType, SettingsSectionProps } from "../../../types/settings";

const queuePopTypes: QueuePopType[] = ['Ai.Mi', 'Generic'];

export function QualityOfLifeSettings({ settings, update }: SettingsSectionProps) {
  return (
    <>
      <SettingGroup label="Game">
        <SettingRow
          title="Automatically Open Game"
          subtitle="When the app is started, it will also launch Omega Strikers via Steam."
        >
          <Toggle
            enabled={settings.openGameWithApp}
            onChange={v => update({ openGameWithApp: v })}
          />
        </SettingRow>

        <SettingRow
          title="Close with Game"
          subtitle="Automatically close the app when Omega Strikers is no longer running."
        >
          <Toggle
            enabled={settings.exitOnGameClose}
            onChange={v => update({ exitOnGameClose: v })}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup label="Queue Pop">
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
          title="Sound Pack"
          subtitle="The sound pack used for when your queue pops. Press F8 to test."
          disabled={!settings.notifyQueuePop}
        >
          <SettingSelect
            value={settings.queuePopType}
            options={queuePopTypes}
            onChange={v => update({ queuePopType: v })}
          />
        </SettingRow>

        <SettingRow
          title="SFX Volume"
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
      </SettingGroup>
    </>
  );
}
