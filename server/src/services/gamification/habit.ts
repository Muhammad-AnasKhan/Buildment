import type { EngagementEvent, Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import type { EngagementPlatform } from "../../shared/api/engagement.js";
import { xpKeys } from "../../shared/gamification/xp.js";
import { dayKeyToDate, localDayKey, weekStartKey } from "../../shared/lib/local-date.js";
import { MAX_STREAK_FREEZES, type LearnerHabit } from "../../shared/lib/streak.js";
import { learnerTimeZone } from "../learner/time-zone.js";
import { gamificationFeatures } from "./flags.js";
import { awardXp } from "./xp.js";

// Streak freezes and study-goal rewards.
//
// Weekly goals: first meet in a learner-local week pays 25 XP + one streak freeze (cap 2).
// Daily goals: first meet today pays 10 XP only (no freeze — freezes stay a weekly reward).

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
  return count === 1;
}

/**
 * Pays for meeting the learner's study goal. Weekly goals still use `weekly_goal_met` (XP + freeze).
 * Daily goals use `daily_goal_met` (XP only). Returns the new event, or null.
 */
export async function settleWeeklyGoal(
  userId: string,
  habit: LearnerHabit,
  platform: EngagementPlatform = "web",
  now: Date = new Date()
): Promise<EngagementEvent | null> {
  const goal = habit.goal ?? habit.weeklyGoal;
  if (!goal || goal.progress < goal.target) return null;

  const timeZone = await learnerTimeZone(userId);
  const today = localDayKey(now, timeZone);

  if (goal.period === "DAILY") {
    return prisma.$transaction(async (tx) => {
      const [created] = await tx.engagementEvent.createManyAndReturn({
        data: [
          {
            userId,
            platform,
            type: "daily_goal_met",
            payload: { freezeEarned: false, period: "DAILY" },
            dedupeKey: `daily_goal_met:${today}`,
          },
        ],
        skipDuplicates: true,
      });
      if (!created) return null;

      await awardXp(tx, {
        userId,
        enrollmentId: null,
        courseId: null,
        source: "daily_goal_met",
        sourceKey: xpKeys.dailyGoal(today),
        at: now,
      });
      return created;
    });
  }

  const week = weekStartKey(today);
  return prisma.$transaction(async (tx) => {
    const [created] = await tx.engagementEvent.createManyAndReturn({
      data: [
        {
          userId,
          platform,
          type: "weekly_goal_met",
          payload: { freezeEarned: false, period: "WEEKLY" },
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
    return tx.engagementEvent.update({ where: { id: created.id }, data: { payload: { freezeEarned: true, period: "WEEKLY" } } });
  });
}
