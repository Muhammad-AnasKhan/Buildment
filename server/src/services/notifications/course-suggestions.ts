import type { Prisma } from "../../generated/prisma/index.js";
import { appBaseUrl } from "../email/send.js";
import { escapeHtml } from "../email/format.js";
import type { EmailContent } from "./service.js";

// "What should I learn next?" for people with nothing in progress: learners who signed in but never
// enrolled, and learners who finished every course they had. Used by the hourly reminder pass
// (reminders.ts) and by the course-completed notification (events.ts).
//
// Ranking is deliberately simple and explainable: courses by the instructor of the course they just
// finished first (a natural follow-on), then the most enrolled, then the newest.

export const MAX_SUGGESTIONS = 3;

export type SuggestableCourse = {
  id: string;
  title: string;
  slug: string;
  mentorId: string;
  enrollmentCount: number;
  publishedAt: Date | null;
};

export function rankCourseSuggestions(
  courses: SuggestableCourse[],
  input: { excludeCourseIds: Iterable<string>; preferMentorId?: string | null }
): SuggestableCourse[] {
  const exclude = new Set(input.excludeCourseIds);
  const preferred = (course: SuggestableCourse) => (input.preferMentorId && course.mentorId === input.preferMentorId ? 1 : 0);
  return courses
    .filter((course) => !exclude.has(course.id))
    .sort(
      (a, b) =>
        preferred(b) - preferred(a) ||
        b.enrollmentCount - a.enrollmentCount ||
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0) ||
        a.title.localeCompare(b.title)
    )
    .slice(0, MAX_SUGGESTIONS);
}

/** Published courses with what the ranking needs. One query, shared by every user in a pass. */
export async function loadSuggestableCourses(db: Prisma.TransactionClient): Promise<SuggestableCourse[]> {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, mentorId: true, publishedAt: true, _count: { select: { enrollments: true } } },
  });
  return courses.map(({ _count, ...course }) => ({ ...course, enrollmentCount: _count.enrollments }));
}

export type CourseSuggestionKind = "first" | "next";

export type CourseSuggestionMessage = { title: string; body: string; url: string };

/** Bell text for someone with no course in progress. `finishedTitle` is their latest finished course. */
export function courseSuggestionMessage(
  kind: CourseSuggestionKind,
  suggestions: SuggestableCourse[],
  finishedTitle?: string | null
): CourseSuggestionMessage {
  const [main, ...others] = suggestions;
  if (!main) throw new Error("courseSuggestionMessage needs at least one course");
  const also = others.length ? ` You might also like ${others.map((course) => course.title).join(" or ")}.` : "";
  const url = `/catalog/${main.slug}`;
  if (kind === "next") {
    const lead = finishedTitle ? `You finished ${finishedTitle}. ` : "";
    return { title: "Ready for your next course?", body: `${lead}Keep going with ${main.title}.${also}`, url };
  }
  return { title: "Find your first course", body: `Start learning with ${main.title}. It only takes a few minutes to begin.${also}`, url };
}

export function courseSuggestionEmail(
  suggestions: SuggestableCourse[],
  message: CourseSuggestionMessage,
  name: string | null
): EmailContent {
  const items = suggestions
    .map((course) => `<li><a href="${appBaseUrl()}/catalog/${course.slug}">${escapeHtml(course.title)}</a></li>`)
    .join("");
  const textItems = suggestions.map((course) => `- ${course.title}: ${appBaseUrl()}/catalog/${course.slug}`).join("\n");
  return {
    subject: message.title,
    html: `<p>Hi ${escapeHtml(name ?? "there")},</p>
<p>${escapeHtml(message.body)}</p>
${suggestions.length > 1 ? `<ul>${items}</ul>` : ""}
<p><a href="${appBaseUrl()}/catalog">Browse all courses</a></p>`,
    text: `${message.body}\n\n${textItems}\n\nAll courses: ${appBaseUrl()}/catalog`,
  };
}
