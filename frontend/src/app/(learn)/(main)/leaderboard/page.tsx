import type { Metadata } from "next";
import type { LeaderboardCategory, LeaderboardHubView, LeaderboardScope } from "@/shared/api/gamification";
import type { MenteeDashboardViewModel } from "@/shared/api/learner";
import { LeaderboardPage } from "@/components/learn/leaderboard/leaderboard-page";
import type { HubSelection } from "@/components/learn/leaderboard/leaderboard-tabs";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { loadLeaderboardHub } from "@/server/actions/gamification";

export const metadata: Metadata = { title: "Leaderboard" };

const CATEGORIES: LeaderboardCategory[] = ["weekly_xp", "all_time_xp", "speed", "streak"];
const SCOPES: LeaderboardScope[] = ["course", "global"];

export default async function LearnerLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; scope?: string; courseId?: string }>;
}) {
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

  // Deep links: /leaderboard?category=speed&scope=global, or ?category=weekly_xp&scope=course&courseId=…
  const params = await searchParams;
  const category: LeaderboardCategory = CATEGORIES.includes(params.category as LeaderboardCategory)
    ? (params.category as LeaderboardCategory)
    : "weekly_xp";
  const scope: LeaderboardScope = SCOPES.includes(params.scope as LeaderboardScope) ? (params.scope as LeaderboardScope) : "global";
  const courseId =
    typeof params.courseId === "string" && courses.some((course) => course.courseId === params.courseId)
      ? params.courseId
      : initialCourseId;

  const weekly = category === "weekly_xp";
  const selection: HubSelection = {
    category,
    scope: weekly ? scope : "global",
    courseId: weekly && scope === "course" ? courseId : null,
  };

  let initial: LeaderboardHubView | null = null;
  if (featuresEnabled && courses.length > 0) {
    initial = await loadLeaderboardHub(selection).catch(() => null);
  }

  return <LeaderboardPage initial={initial} initialSelection={selection} courses={courses} featuresEnabled={featuresEnabled} />;
}
