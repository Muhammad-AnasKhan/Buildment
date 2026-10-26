
import { prisma } from "../../db/prisma.js";
import { dateToDayKey, localDayKey, shiftDayKey, startOfLocalDay } from "../../shared/lib/local-date.js";
import { computeStreak, uncelebratedStreakMilestone, type LearnerHabit } from "../../shared/lib/streak.js";
import { gamificationFeatures } from "../gamification/flags.js";
import { spendStreakFreezes } from "../gamification/habit.js";
import { learnerTimeZone } from "../learner/time-zone.js";

export type { LearnerHabit };

/**
 * Streak and weekly goal, counted in the learner's own timezone over their whole history. With
 * streak freezes on, a gap the learner's freezes can bridge is covered here and the freezes spent
 * (`applyFreezes: false` reads the streak without spending, for background jobs).
 */
export async function loadLearnerHabit(
  userId: string,
  options: { now?: Date; applyFreezes?: boolean } = {}
): Promise<LearnerHabit> {
  const now = options.now ?? new Date();
  const timeZone = await learnerTimeZone(userId);
  const todayKey = localDayKey(now, timeZone);
  const weekStart = startOfLocalDay(shiftDayKey(todayKey, -6), timeZone);
  const freezesOn = gamificationFeatures().streakFreezes;

  const [user, enrollments, frozen] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        weeklyGoalKind: true,
        weeklyGoalTarget: true,
        weeklyGoalNote: true,
        weeklyGoalReminderEnabled: true,
        celebratedStreakMilestones: true,
        streakFreezes: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { userId, status: { not: "DROPPED" } },
      select: { id: true },
    }),
    prisma.streakFreezeDay.findMany({ where: { userId }, select: { date: true } }),
  ]);

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const goalKind = user?.weeklyGoalKind ?? null;
  const goalTarget = user?.weeklyGoalTarget ?? null;

  const [days, sessionCount, chapterCount] = await Promise.all([
    // One row per active day across every course, however far back the streak goes.
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : prisma.dailyActivity.groupBy({
          by: ["date"],
          where: { enrollmentId: { in: enrollmentIds }, activeSeconds: { gt: 0 } },
        }),
    enrollmentIds.length === 0 || goalKind !== "SESSIONS"
      ? Promise.resolve(0)
      : prisma.studySession.count({
          where: {
            enrollmentId: { in: enrollmentIds },
            activeSeconds: { gt: 0 },
            startedAt: { gte: weekStart },
          },
        }),
    enrollmentIds.length === 0 || goalKind !== "CHAPTERS"
      ? Promise.resolve(0)
      : prisma.chapterProgress.count({
          where: {
            enrollmentId: { in: enrollmentIds },
            completedAt: { gte: weekStart },
          },
        }),
  ]);

  const activeDays = days.map((day) => dateToDayKey(day.date));
  const streak = computeStreak(activeDays, todayKey, {
    frozenDays: frozen.map((row) => dateToDayKey(row.date)),
    freezesAvailable: freezesOn && options.applyFreezes !== false ? (user?.streakFreezes ?? 0) : 0,
  });
  if (streak.newlyFrozenDays.length > 0) {
    const spent = await spendStreakFreezes(userId, streak.newlyFrozenDays);
    // Another request spent the same freezes first: count again from what is recorded.
    if (spent < streak.newlyFrozenDays.length) return loadLearnerHabit(userId, { ...options, now, applyFreezes: false });
  }
  const progress = goalKind === "SESSIONS" ? sessionCount : goalKind === "CHAPTERS" ? chapterCount : 0;

  return {
    streakCount: streak.count,
    graceUsed: streak.graceUsed,
    streakMilestone: uncelebratedStreakMilestone(streak.count, user?.celebratedStreakMilestones ?? []),
    weeklyGoal:
      goalKind && goalTarget && goalTarget > 0
        ? { kind: goalKind, target: goalTarget, progress, note: user?.weeklyGoalNote ?? null, dailyReminder: user?.weeklyGoalReminderEnabled ?? false }
        : null,
  };
}
