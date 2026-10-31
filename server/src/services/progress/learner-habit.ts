import { prisma } from "../../db/prisma.js";
import { dateToDayKey, localDayKey, shiftDayKey, startOfLocalDay } from "../../shared/lib/local-date.js";
import { computeStreak, uncelebratedStreakMilestone, type LearnerHabit, type StudyGoal } from "../../shared/lib/streak.js";
import { gamificationFeatures } from "../gamification/flags.js";
import { spendStreakFreezes } from "../gamification/habit.js";
import { learnerTimeZone } from "../learner/time-zone.js";

export type { LearnerHabit };

/**
 * Streak and study goal, counted in the learner's own timezone. Daily goals use today;
 * weekly goals use the last 7 local days. With streak freezes on, a gap the learner's
 * freezes can bridge is covered here and the freezes spent (`applyFreezes: false` reads
 * without spending, for background jobs).
 */
export async function loadLearnerHabit(
  userId: string,
  options: { now?: Date; applyFreezes?: boolean } = {}
): Promise<LearnerHabit> {
  const now = options.now ?? new Date();
  const timeZone = await learnerTimeZone(userId);
  const todayKey = localDayKey(now, timeZone);
  const freezesOn = gamificationFeatures().streakFreezes;

  const [user, enrollments, frozen] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        weeklyGoalKind: true,
        weeklyGoalTarget: true,
        goalPeriod: true,
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
  // Older rows have a kind/target but no period — treat them as weekly.
  const goalPeriod = user?.goalPeriod ?? (goalKind && goalTarget ? "WEEKLY" : null);
  const windowStart = startOfLocalDay(
    goalPeriod === "DAILY" ? todayKey : shiftDayKey(todayKey, -6),
    timeZone,
  );

  const [days, sessionCount, chapterCount, minuteSeconds] = await Promise.all([
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
            startedAt: { gte: windowStart },
          },
        }),
    enrollmentIds.length === 0 || goalKind !== "CHAPTERS"
      ? Promise.resolve(0)
      : prisma.chapterProgress.count({
          where: {
            enrollmentId: { in: enrollmentIds },
            completedAt: { gte: windowStart },
          },
        }),
    enrollmentIds.length === 0 || goalKind !== "MINUTES"
      ? Promise.resolve(0)
      : prisma.dailyActivity
          .aggregate({
            where: {
              enrollmentId: { in: enrollmentIds },
              date: { gte: windowStart },
            },
            _sum: { activeSeconds: true },
          })
          .then((row) => row._sum.activeSeconds ?? 0),
  ]);

  const activeDays = days.map((day) => dateToDayKey(day.date));
  const streak = computeStreak(activeDays, todayKey, {
    frozenDays: frozen.map((row) => dateToDayKey(row.date)),
    freezesAvailable: freezesOn && options.applyFreezes !== false ? (user?.streakFreezes ?? 0) : 0,
  });
  if (streak.newlyFrozenDays.length > 0) {
    const spent = await spendStreakFreezes(userId, streak.newlyFrozenDays);
    if (spent < streak.newlyFrozenDays.length) return loadLearnerHabit(userId, { ...options, now, applyFreezes: false });
  }

  const progress =
    goalKind === "SESSIONS"
      ? sessionCount
      : goalKind === "CHAPTERS"
        ? chapterCount
        : goalKind === "MINUTES"
          ? Math.floor(minuteSeconds / 60)
          : 0;

  const goal: StudyGoal | null =
    goalPeriod && goalKind && goalTarget && goalTarget > 0
      ? {
          period: goalPeriod,
          kind: goalKind,
          target: goalTarget,
          progress,
          note: user?.weeklyGoalNote ?? null,
          dailyReminder: user?.weeklyGoalReminderEnabled ?? false,
        }
      : null;

  return {
    streakCount: streak.count,
    graceUsed: streak.graceUsed,
    streakMilestone: uncelebratedStreakMilestone(streak.count, user?.celebratedStreakMilestones ?? []),
    weeklyGoal: goal,
    goal,
  };
}
