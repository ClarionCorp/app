import { GameControllerIcon, ListPlusIcon, TrendUpIcon } from "@phosphor-icons/react";


export type TelemetryOption = 'game_stats' | 'play_state' | 'play_count';

export const telemetryOptions: { value: TelemetryOption; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'game_stats',
    label: 'Extra Game Stats',
    description: 'Automatically send limited match history data to ClarionCorp.',
    icon: <ListPlusIcon size={18} weight="duotone" />,
  },
  {
    value: 'play_state',
    label: 'Playing State',
    description: 'Share current game state with Discord Rich Presence and your account on ClarionCorp.',
    icon: <GameControllerIcon size={18} weight="duotone" />,
  },
  {
    value: 'play_count',
    label: 'Play Count',
    description: 'Send an anonymous +1 to ClarionCorp for updating the online counter.',
    icon: <TrendUpIcon size={18} weight="duotone" />,
  },
];