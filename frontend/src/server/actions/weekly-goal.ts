"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireLearnSurface } from "@/server/auth/guards";
import { STREAK_MILESTONES, type StreakMilestone } from "@/server/progress/streak";

const goalInput = z.object({
  kind: z.enum(["SESSIONS", "CHAPTERS"]),
  target: z.number().int().min(1).max(50),
});

export async function setWeeklyGoal(input: { kind: "SESSIONS" | "CHAPTERS"; target: number }) {
  const user = await requireLearnSurface();
  const parsed = goalInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Choose sessions or chapters, from 1 to 50." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      weeklyGoalKind: parsed.data.kind,
      weeklyGoalTarget: parsed.data.target,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function clearWeeklyGoal() {
  const user = await requireLearnSurface();
  await prisma.user.update({
    where: { id: user.id },
    data: { weeklyGoalKind: null, weeklyGoalTarget: null },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function acknowledgeStreakMilestone(milestone: StreakMilestone) {
  if (!STREAK_MILESTONES.includes(milestone)) return;
  const user = await requireLearnSurface();
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { celebratedStreakMilestones: true },
  });
  const recorded = new Set<number>(row?.celebratedStreakMilestones ?? []);
  for (const reached of STREAK_MILESTONES) {
    if (reached <= milestone) recorded.add(reached);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { celebratedStreakMilestones: [...recorded] },
  });
}
