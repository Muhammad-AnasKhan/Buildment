import "server-only";

import { prisma } from "@/server/db";
import { utcDateOnly } from "./heartbeat";
import { currentStreak, uncelebratedStreakMilestone, type LearnerHabit } from "./streak";

export type { LearnerHabit };

export async function loadLearnerHabit(userId: string): Promise<LearnerHabit> {
  const today = utcDateOnly();
  const todayKey = today.toISOString().slice(0, 10);
  const weekStart = new Date(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  const historyStart = new Date(today);
  historyStart.setUTCDate(historyStart.getUTCDate() - 60);

  const [user, enrollments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        weeklyGoalKind: true,
        weeklyGoalTarget: true,
        celebratedStreakMilestones: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { userId, status: { not: "DROPPED" } },
      select: { id: true },
    }),
  ]);

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const goalKind = user?.weeklyGoalKind ?? null;
  const goalTarget = user?.weeklyGoalTarget ?? null;

  const [days, sessionCount, chapterCount] = await Promise.all([
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : prisma.dailyActivity.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            date: { gte: historyStart },
            activeSeconds: { gt: 0 },
          },
          select: { date: true },
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

  const activeDays = days.map((day) => day.date.toISOString().slice(0, 10));
  const streak = currentStreak(activeDays, todayKey);
  const progress = goalKind === "SESSIONS" ? sessionCount : goalKind === "CHAPTERS" ? chapterCount : 0;

  return {
    streakCount: streak.count,
    graceUsed: streak.graceUsed,
    streakMilestone: uncelebratedStreakMilestone(streak.count, user?.celebratedStreakMilestones ?? []),
    weeklyGoal:
      goalKind && goalTarget && goalTarget > 0
        ? { kind: goalKind, target: goalTarget, progress }
        : null,
  };
}
