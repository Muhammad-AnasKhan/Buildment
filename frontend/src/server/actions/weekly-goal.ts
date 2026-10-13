"use server";

import { revalidatePath } from "next/cache";
import type { WeeklyGoalInput } from "@/shared/api/learner";
import type { StreakMilestone } from "@/shared/lib/streak";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export async function setWeeklyGoal(input: WeeklyGoalInput) {
  try {
    await serverApiFetch("/api/v1/learner/weekly-goal", { method: "PUT", json: input });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false as const, error: "Choose sessions or chapters, from 1 to 50." };
    }
    throw error;
  }
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function clearWeeklyGoal() {
  await serverApiFetch("/api/v1/learner/weekly-goal", { method: "DELETE" });
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function acknowledgeStreakMilestone(milestone: StreakMilestone) {
  await serverApiFetch(`/api/v1/learner/streak-milestones/${milestone}/acknowledge`, { method: "POST" });
}
