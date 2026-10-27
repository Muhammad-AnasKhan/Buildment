import type { EngagementEvent, Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import type { EngagementPlatform } from "../../shared/api/engagement.js";
import { xpKeys } from "../../shared/gamification/xp.js";
import { dayKeyToDate, localDayKey, weekStartKey } from "../../shared/lib/local-date.js";
import { MAX_STREAK_FREEZES, type LearnerHabit } from "../../shared/lib/streak.js";
import { learnerTimeZone } from "../learner/time-zone.js";
import { gamificationFeatures } from "./flags.js";
import { awardXp } from "./xp.js";

// Streak freezes and the weekly-goal reward.
//
// A learner earns one freeze each week they meet their weekly goal, holding at most two. When the
// streak walk (shared/lib/streak.ts computeStreak) finds a gap it can bridge, the days it covers are
// recorded in StreakFreezeDay and the balance goes down, in one transaction, so a freeze is spent
// exactly once even when two pages compute the streak at the same moment.

type Tx = Prisma.TransactionClient;

/** Spends one freeze per day, stopping when the balance runs out. Returns how many were spent. */
export async function spendStreakFreezes(userId: string, dayKeys: string[]): Promise<number> {
  if (dayKeys.length === 0) return 0;
  return prisma.$transaction(async (tx) => {
    let spent = 0;
    for (const day of dayKeys) {
      const taken = await tx.user.updateMany({
        where: { id: userId, streakFreezes: { gt: 0 } },
        data: { streakFreezes: { decrement: 1 } },
      });
      if (taken.count === 0) break;
      const { count } = await tx.streakFreezeDay.createMany({
        data: [{ userId, date: dayKeyToDate(day) }],
        skipDuplicates: true,
      });
      if (count === 0) {
        // Another request already covered this day: give the freeze back.
        await tx.user.update({ where: { id: userId }, data: { streakFreezes: { increment: 1 } } });
        continue;
      }
      spent += 1;
    }
    return spent;
  });
}

/** One more freeze, unless freezes are off or the learner already holds the maximum. */
export async function grantStreakFreeze(tx: Tx, userId: string): Promise<boolean> {
  if (!gamificationFeatures().streakFreezes) return false;
  const { count } = await tx.user.updateMany({
    where: { id: userId, streakFreezes: { lt: MAX_STREAK_FREEZES } },
    data: { streakFreezes: { increment: 1 } },
  });
  return count > 0;
}

/**
 * The first time the weekly goal is met in a learner-local week (Monday to Sunday), records the
 * moment and pays for it: XP and a streak freeze. The once-per-week `weekly_goal_met` event is the
 * key for both, so they are paid once even with XP switched off. Returns the new event, or null.
 */
export async function settleWeeklyGoal(
  userId: string,
  habit: LearnerHabit,
  platform: EngagementPlatform = "web",
  now: Date = new Date()
): Promise<EngagementEvent | null> {
  const goal = habit.weeklyGoal;
  if (!goal || goal.progress < goal.target) return null;
  const week = weekStartKey(localDayKey(now, await learnerTimeZone(userId)));

  return prisma.$transaction(async (tx) => {
    const [created] = await tx.engagementEvent.createManyAndReturn({
      data: [
        {
          userId,
          platform,
          type: "weekly_goal_met",
          payload: { freezeEarned: false },
          dedupeKey: `weekly_goal_met:${week}`,
        },
      ],
      skipDuplicates: true,
    });
    if (!created) return null;

    await awardXp(tx, {
      userId,
      enrollmentId: null,
      courseId: null,
      source: "weekly_goal_met",
      sourceKey: xpKeys.weeklyGoal(week),
      at: now,
    });
    if (!(await grantStreakFreeze(tx, userId))) return created;
    return tx.engagementEvent.update({ where: { id: created.id }, data: { payload: { freezeEarned: true } } });
  });
}
