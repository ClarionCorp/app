import { PaletteIcon, SlidersHorizontalIcon, SparkleIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { PreferredDataSources, ReleaseChannel } from "./appAPI";

export type QueuePopType = 'Ai.Mi' | 'Generic';

export type Settings = {
  gameDirectory: string | null;
  drpcEnabled: boolean;
  notifyQueuePop: boolean;
  queuePopVol: number;
  queuePopType: QueuePopType;
  exitOnGameClose: boolean;
  prefDataSource: PreferredDataSources;
  openGameWithApp: boolean;
  releaseChannel: ReleaseChannel;
  nameplateTransparency: number;
  useCustomCharArt: boolean;
  compactMode: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  gameDirectory: null,
  drpcEnabled: true,
  notifyQueuePop: false,
  queuePopVol: 50,
  queuePopType: 'Ai.Mi',
  exitOnGameClose: false,
  prefDataSource: 'ClarionCorp',
  openGameWithApp: false,
  releaseChannel: 'Stable',
  nameplateTransparency: 50,
  useCustomCharArt: true,
  compactMode: false,
};

export interface SettingsSectionProps {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

export type SectionId = 'account' | 'appearance' | 'qol' | 'advanced' | 'danger';

// also dictates the order they show up
export const SettingsSections: { id: SectionId; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  { id: 'appearance', label: 'Appearance', icon: <PaletteIcon size={18} weight="duotone" /> },
  { id: 'qol', label: 'Quality of Life', icon: <SparkleIcon size={18} weight="duotone" /> },
  { id: 'account', label: 'My Account', icon: <UserCircleIcon size={18} weight="duotone" /> },
  { id: 'advanced', label: 'Advanced', icon: <SlidersHorizontalIcon size={18} weight="duotone" /> },
];