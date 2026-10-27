import type { LeaderboardView } from "@/shared/api/gamification";
import type { MenteeDashboardViewModel } from "@/shared/api/learner";
import { MenteeDashboard } from "@/components/learn/dashboard/mentee-dashboard";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { loadLeaderboard } from "@/server/actions/gamification";

export default async function MenteeDashboardPage() {
  await requireLearnSurface();
  const model = await serverApiFetch<MenteeDashboardViewModel>("/api/v1/learner/dashboard");

  // The board for the course the learner is working on; they can switch course in the card.
  const { gamification, primaryCourse } = model;
  let leaderboard: LeaderboardView | null = null;
  if (gamification.features.leaderboards && !gamification.hidden && primaryCourse && primaryCourse.state !== "PAYMENT_REQUIRED") {
    leaderboard = await loadLeaderboard(primaryCourse.courseId).catch(() => null);
  }

  return <MenteeDashboard model={model} leaderboard={leaderboard} />;
}
