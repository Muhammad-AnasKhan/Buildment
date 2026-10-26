// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
export const STREAK_MILESTONES = [3, 7, 14] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export type LearnerHabit = {
  streakCount: number;
  graceUsed: boolean;
  streakMilestone: StreakMilestone | null;
  weeklyGoal: { kind: "SESSIONS" | "CHAPTERS"; target: number; progress: number; note: string | null; dailyReminder: boolean } | null;
};

export function shiftUtcDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Most streak freezes a learner can hold. */
export const MAX_STREAK_FREEZES = 2;

export type StreakOptions = {
  /** Days a streak freeze already covered; they keep the run alive without adding to it. */
  frozenDays?: Iterable<string>;
  /** Freezes the learner holds and could spend on a gap now. */
  freezesAvailable?: number;
};

export type StreakResult = {
  count: number;
  graceUsed: boolean;
  /** Missed days a freeze must now cover for `count` to hold; the caller records them. */
  newlyFrozenDays: string[];
};

/**
 * Active days count. Today with no study is still open, so it does not break the run.
 * One missed day is absorbed only when study continues on the other side (the grace day). Freezes
 * cover further missed days the same way, and only when the run continues past the gap, so a
 * learner who never comes back does not lose freezes for nothing. Any other gap ends the run.
 */
export function computeStreak(activeDays: Iterable<string>, today: string, options: StreakOptions = {}): StreakResult {
  const active = new Set(activeDays);
  const frozen = new Set(options.frozenDays ?? []);
  const covered = (day: string) => active.has(day) || frozen.has(day);
  let freezes = Math.max(0, Math.floor(options.freezesAvailable ?? 0));
  const newlyFrozenDays: string[] = [];
  let count = 0;
  let graceUsed = false;
  let cursor = active.has(today) ? today : shiftUtcDate(today, -1);

  // Every step consumes an active day, a frozen day or a whole gap, so the walk ends on its own;
  // the bound only guards against malformed keys.
  const maxSteps = active.size + frozen.size + 2;
  for (let step = 0; step <= maxSteps; step += 1) {
    if (active.has(cursor)) {
      count += 1;
      cursor = shiftUtcDate(cursor, -1);
      continue;
    }
    if (frozen.has(cursor)) {
      cursor = shiftUtcDate(cursor, -1);
      continue;
    }

    const allowance = (graceUsed ? 0 : 1) + freezes;
    let gap = 0;
    let probe = cursor;
    while (gap < allowance && !covered(probe)) {
      gap += 1;
      probe = shiftUtcDate(probe, -1);
    }
    if (gap === 0 || !covered(probe)) break;

    // The grace day takes the most recent missed day; freezes cover the older ones.
    const firstFrozen = graceUsed ? 0 : 1;
    graceUsed = true;
    for (let offset = firstFrozen; offset < gap; offset += 1) newlyFrozenDays.push(shiftUtcDate(cursor, -offset));
    freezes -= gap - firstFrozen;
    cursor = probe;
  }

  return { count, graceUsed: graceUsed && count > 0, newlyFrozenDays: count > 0 ? newlyFrozenDays : [] };
}

/** The streak without freezes (the grace day still applies). */
export function currentStreak(activeDays: Iterable<string>, today: string): { count: number; graceUsed: boolean } {
  const { count, graceUsed } = computeStreak(activeDays, today);
  return { count, graceUsed };
}

/** The highest new milestone this run has reached. Lower ones are recorded with it. */
export function uncelebratedStreakMilestone(count: number, celebrated: number[]): StreakMilestone | null {
  const seen = new Set(celebrated);
  const reached = STREAK_MILESTONES.filter((milestone) => count >= milestone && !seen.has(milestone));
  return reached.at(-1) ?? null;
}

export function milestonesToRecord(count: number): number[] {
  return STREAK_MILESTONES.filter((milestone) => count >= milestone);
}
