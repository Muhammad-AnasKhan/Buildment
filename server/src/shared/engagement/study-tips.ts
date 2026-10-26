import TIPS from "./study-tips.en.json" with { type: "json" };

// The supporter mascot's tip of the day on the dashboard. General study tips fit every course; a
// course can add its own under `courses.<course slug>` in study-tips.en.json, and those are mixed in
// for learners whose current course it is. Tips are shown as text only, so they need no voice clips
// and can change freely.

const DAY_MS = 24 * 60 * 60 * 1000;
const COURSE_TIPS: Record<string, string[]> = TIPS.courses;

/** Today's tip: the same all day for everyone (UTC days), and a different one tomorrow. */
export function studyTipOfTheDay(now: Date, courseSlug?: string | null): string {
  const tips = [...(courseSlug ? (COURSE_TIPS[courseSlug] ?? []) : []), ...TIPS.general];
  const day = Math.floor(now.getTime() / DAY_MS);
  return tips[day % tips.length]!;
}
