"use server";

import { revalidatePath } from "next/cache";
import type {
  GamificationPreferencesInput,
  GamificationSummary,
  LeaderboardCategory,
  LeaderboardHubView,
  LeaderboardScope,
  LeaderboardView,
} from "@/shared/api/gamification";
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

export type LeaderboardHubSelection = {
  category: LeaderboardCategory;
  scope: LeaderboardScope;
  courseId?: string | null;
};

/** One board from the leaderboard hub: a category, a scope, and (for course boards) the course. */
export async function loadLeaderboardHub(input: LeaderboardHubSelection): Promise<LeaderboardHubView | null> {
  const params = new URLSearchParams({ category: input.category, scope: input.scope });
  if (input.courseId) params.set("courseId", input.courseId);
  try {
    return await serverApiFetch<LeaderboardHubView>(`/api/v1/learner/leaderboards?${params.toString()}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}
