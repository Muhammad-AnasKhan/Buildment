"use server";

import { revalidatePath } from "next/cache";
import type { GamificationPreferencesInput, GamificationSummary, LeaderboardView } from "@/shared/api/gamification";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export async function setGamificationPreferences(input: GamificationPreferencesInput) {
  const summary = await serverApiFetch<GamificationSummary>("/api/v1/learner/gamification", { method: "PATCH", json: input });
  revalidatePath("/dashboard");
  revalidatePath("/settings/profile");
  return summary;
}

/** The weekly board for one of the learner's courses; null when the course is not theirs. */
export async function loadLeaderboard(courseId: string): Promise<LeaderboardView | null> {
  try {
    return await serverApiFetch<LeaderboardView>(`/api/v1/learner/leaderboard?courseId=${encodeURIComponent(courseId)}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}
