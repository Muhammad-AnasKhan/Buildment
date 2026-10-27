// Levels come from total XP. Each level asks for a little more than the last: reaching level n
// takes 50·(n−1)² XP, so level 2 is 50 XP, level 3 is 200, level 5 is 800 and level 10 is 4,050.
// A typical 20-chapter course is worth roughly 600 XP, about level 4.

export const LEVEL_XP_STEP = 50;

/** Total XP needed to reach `level` (level 1 starts at 0). */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return LEVEL_XP_STEP * (n - 1) ** 2;
}

export function levelForXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = Math.floor(Math.sqrt(xp / LEVEL_XP_STEP)) + 1;
  // Guard against floating-point edges on exact thresholds.
  while (xpForLevel(level + 1) <= xp) level += 1;
  while (level > 1 && xpForLevel(level) > xp) level -= 1;
  return level;
}

export type LevelProgress = {
  level: number;
  totalXp: number;
  /** XP earned since this level began. */
  intoLevel: number;
  /** XP between this level and the next. */
  levelSpan: number;
  /** XP still needed for the next level. */
  toNext: number;
  /** 0–100. */
  percent: number;
};

export function levelProgress(totalXp: number): LevelProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const span = ceiling - floor;
  const into = xp - floor;
  return {
    level,
    totalXp: xp,
    intoLevel: into,
    levelSpan: span,
    toNext: ceiling - xp,
    percent: Math.min(100, Math.floor((into / span) * 100)),
  };
}
