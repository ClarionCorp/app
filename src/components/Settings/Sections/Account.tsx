import { SettingGroup, SettingRow } from "../SettingRow";

// I'll wire these up later
export function AccountSettings() {
  return (
    <SettingGroup>
      <SettingRow
        title="Display Name"
        subtitle="Change your Omega Strikers username."
        disabled
      >
        <ComingSoon />
      </SettingRow>

      <SettingRow
        title="Emoticon Avatar"
        subtitle="Choose the emoticon shown as your profile avatar."
        disabled
      >
        <ComingSoon />
      </SettingRow>

      <SettingRow
        title="Matchmaking Region"
        subtitle="The region you queue into."
        disabled
      >
        <ComingSoon />
      </SettingRow>
    </SettingGroup>
  );
}

function ComingSoon() {
  return <span className="text-xs text-char-subtle italic">Coming soon</span>;
}
