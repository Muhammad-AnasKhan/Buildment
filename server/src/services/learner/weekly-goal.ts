import type { WeeklyGoalInput } from "../../shared/api/learner.js";
import { STREAK_MILESTONES, type StreakMilestone } from "../../shared/lib/streak.js";
import { prisma } from "../../db/prisma.js";

export async function setWeeklyGoal(userId: string, goal: WeeklyGoalInput) {
  await prisma.user.update({
    where: { id: userId },
    data: { weeklyGoalKind: goal.kind, weeklyGoalTarget: goal.target },
  });
}

export async function clearWeeklyGoal(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { weeklyGoalKind: null, weeklyGoalTarget: null },
  });
}

/** Reaching a milestone also marks every smaller one as celebrated. */
export async function acknowledgeStreakMilestone(userId: string, milestone: StreakMilestone) {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { celebratedStreakMilestones: true } });
  const recorded = new Set<number>(row?.celebratedStreakMilestones ?? []);
  for (const reached of STREAK_MILESTONES) {
    if (reached <= milestone) recorded.add(reached);
  }
  await prisma.user.update({ where: { id: userId }, data: { celebratedStreakMilestones: [...recorded] } });
}
