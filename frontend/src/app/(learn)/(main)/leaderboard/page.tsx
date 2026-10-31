import type { Metadata } from "next";
import type { LeaderboardView } from "@/shared/api/gamification";
import type { MenteeDashboardViewModel } from "@/shared/api/learner";
import { LeaderboardPage } from "@/components/learn/leaderboard/leaderboard-page";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { loadLeaderboard } from "@/server/actions/gamification";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LearnerLeaderboardPage() {
  await requireLearnSurface();
  const model = await serverApiFetch<MenteeDashboardViewModel>("/api/v1/learner/dashboard");
  const { gamification } = model;

  const courses = model.courses
    .filter((course) => course.state !== "DROPPED" && course.state !== "PAYMENT_REQUIRED")
    .map((course) => ({ courseId: course.courseId, title: course.title }));

  const featuresEnabled = Boolean(gamification.features.leaderboards && !gamification.hidden);
  const initialCourseId =
    model.primaryCourse && model.primaryCourse.state !== "PAYMENT_REQUIRED"
      ? model.primaryCourse.courseId
      : courses[0]?.courseId ?? null;

  let initial: LeaderboardView | null = null;
  if (featuresEnabled && initialCourseId) {
    initial = await loadLeaderboard(initialCourseId).catch(() => null);
  }

  return (
    <LeaderboardPage
      initial={initial}
      initialCourseId={initialCourseId}
      courses={courses}
      featuresEnabled={featuresEnabled}
    />
  );
}
