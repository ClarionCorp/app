import { useEffect, useState } from "react";
import { PaletteIcon } from "@phosphor-icons/react";
import { getUser } from "../../../core/database/queries";
import { PlayerCard } from "../../LiveMatch/PlayerCard";
import { MatchPlayersTable } from "../../../types/database";
import { Toggle } from "../../UI/Toggle";
import { Slider } from "../../UI/Slider";
import { Button } from "../../UI/Button";
import { useTheme } from "../../UI/Theme/ThemeProvider";
import { ThemePicker } from "../../UI/Theme/ThemePicker";
import { ClarionAPI } from "../../../core/constants";
import { SettingGroup, SettingRow } from "../SettingRow";
import { SettingsSectionProps } from "../../../types/settings";

export function AppearanceSettings({ settings, update }: SettingsSectionProps) {
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<MatchPlayersTable>(PREVIEW_PLAYER);
  const { theme } = useTheme();

  useEffect(() => {
    getUser().then(u => {
      if (!u) return;
      setPreviewPlayer(p => ({
        ...p,
        username: u.username,
        playerId: u.playerId,
        tags: u.tags,
        rating: u.rating ?? p.rating,
        accLevel: u.masteryLevel,
        nameplate: {
          nameplateId: u.nameplateId,
          nameplateUrl: `https://${ClarionAPI}/assets/nameplate/${u.nameplateId}.webp`,
        },
      }));
    });
  }, []);

  return (
    <>
      <SettingGroup>
        <SettingRow
          title="Theme"
          subtitle={`Color theme for the app. Currently using ${theme} theme.`}
        >
          <Button
            variant="surface"
            size="sm"
            onClick={() => setThemePickerOpen(true)}
            iconLeft={<PaletteIcon size={14} />}
          >
            Change Theme
          </Button>
        </SettingRow>

        <SettingRow
          title="Compact Mode"
          subtitle="Better support for smaller windows by hiding less useful features."
        >
          <Toggle
            enabled={settings.compactMode}
            onChange={v => update({ compactMode: v })}
          />
        </SettingRow>

        <SettingRow
          title="Use Custom Character Art"
          subtitle="Disabling will revert character art/icons to their normal in-game version."
        >
          <Toggle
            enabled={settings.useCustomCharArt}
            onChange={v => update({ useCustomCharArt: v })}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup label="Player Cards">

        <SettingRow
          title="Nameplate Transparency"
          subtitle="Change the opacity of nameplates on Player Cards"
          vertical
        >
          <div className="mb-3 pointer-events-none">
            <PlayerCard
              player={previewPlayer}
              match={undefined}
              index={0}
              isAlly
              nameplateOpacity={settings.nameplateTransparency}
            />
          </div>
          <Slider
            min={0}
            max={100}
            value={settings.nameplateTransparency}
            onChange={v => update({ nameplateTransparency: v })}
            unit="%"
          />
        </SettingRow>
      </SettingGroup>

      <ThemePicker open={themePickerOpen} onClose={() => setThemePickerOpen(false)} />
    </>
  );
}

const PREVIEW_PLAYER: MatchPlayersTable = {
  username: 'Striker',
  playerId: 'preview',
  tags: [],
  teamNum: 1,
  role: 'Forward',
  charName: null,
  charId: null,
  rating: 2350,
  peakRating: null,
  accLevel: 120,
  isMe: true,
  xp: 0,
  gainedXp: 0,
  xpGoals: [],
  ping: 0,
  trainings: [],
  favChar: [],
  bestChar: [],
  normWR: 0.54,
  rankedWR: 0.54,
  normGames: 312,
  rankedGames: 312,
  playstyle: null,
  knockouts: null,
  smurfProbability: 'none',
  queueMates: [],
  nameplate: {
    nameplateId: 'NameplateData_OmegaStrikers',
    nameplateUrl: `https://api.clarioncorp.net/assets/nameplate/NameplateData_OmegaStrikers.webp`
  },
};
