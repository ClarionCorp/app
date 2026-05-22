export function getLevelFromXP(xp: number): number {
  let level = 0;
  for (const entry of xpThresholds) {
    if (xp >= entry.xp) level = entry.level;
    else break;
  }
  return level;
}

const xpThresholds = [
  { xp: 0, level: 0 },
  { xp: 600, level: 1 },
  { xp: 700, level: 2 },
  { xp: 1050, level: 3 },
  { xp: 1400, level: 4 },
  { xp: 1750, level: 5 },
  { xp: 2100, level: 6 }, // pretty sure this is right, but I missed the rollover
  { xp: 2450, level: 7 },
  { xp: 2800, level: 8 },
  { xp: 3150, level: 9 },
  { xp: 3500, level: 10 },
];