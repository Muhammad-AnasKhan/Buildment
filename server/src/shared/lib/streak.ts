export const STREAK_MILESTONES = [3, 7, 14] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export type LearnerHabit = {
  streakCount: number;
  graceUsed: boolean;
  streakMilestone: StreakMilestone | null;
  weeklyGoal: { kind: "SESSIONS" | "CHAPTERS"; target: number; progress: number } | null;
};

export function shiftUtcDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Active days count. Today with no study is still open, so it does not break the run.
 * One missed day is absorbed only when study continues on the other side. A second missed day starts the count over.
 */
export function currentStreak(activeDays: Iterable<string>, today: string): { count: number; graceUsed: boolean } {
  const active = new Set(activeDays);
  let count = 0;
  let graceUsed = false;
  let cursor = active.has(today) ? today : shiftUtcDate(today, -1);

  for (let step = 0; step < 400; step += 1) {
    if (active.has(cursor)) {
      count += 1;
      cursor = shiftUtcDate(cursor, -1);
      continue;
    }
    const bridged = shiftUtcDate(cursor, -1);
    if (!graceUsed && active.has(bridged)) {
      graceUsed = true;
      cursor = bridged;
      continue;
    }
    break;
  }

  return { count, graceUsed: graceUsed && count > 0 };
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
