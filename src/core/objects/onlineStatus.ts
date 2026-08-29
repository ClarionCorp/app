import { AppAPIRegion } from "./regions";

export type OnlineStatusLevel = 'red' | 'yellow' | 'green';

export type OnlineThreshold = {
  yellow: number, // count at/above this is yellow
  green: number, // count at/above this is green
}

// these are kinda up in the air rn since "seen" data isn't available yet
// better colors will be available later on in a "hotfix"
export const ONLINE_THRESHOLDS: Record<AppAPIRegion, OnlineThreshold> = {
  Global: { yellow: 10, green: 15 },
  NorthAmerica: { yellow: 10, green: 15 },
  Europe: { yellow: 5, green: 10 },
  Asia: { yellow: 5, green: 10 },
  SouthAmerica: { yellow: 5, green: 10 },
  Oceania: { yellow: 5, green: 10 },
  Japan: { yellow: 5, green: 10 },
  None: { yellow: 5, green: 10 }, // unused
};

export const ONLINE_STATUS_CLASSES: Record<OnlineStatusLevel, string> = {
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  green: 'text-emerald-400',
};

export const ONLINE_STATUS_HEX: Record<OnlineStatusLevel, string> = {
  red: '#f87171',
  yellow: '#facc15',
  green: '#34d399',
};

export function getOnlineStatusLevel(region: AppAPIRegion, count: number): OnlineStatusLevel {
  const t = ONLINE_THRESHOLDS[region] ?? ONLINE_THRESHOLDS.Global;
  if (count >= t.green) return 'green';
  if (count >= t.yellow) return 'yellow';
  return 'red';
}
