import type { CourseOverview } from "../../shared/api/catalog.js";
import { buildCourseTrack } from "../../shared/lib/course-tracks.js";
import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { bypassProgressGatingForEmail } from "../auth/seed-access.js";
import { enrollmentGrantsContentAccess } from "../enrollment/lifecycle.js";
import { pickDefaultOpenModule, resolveContinueChapterPath, syllabusForEnrollment } from "../progress/enrollment-syllabus.js";

/** Everything the course overview page shows, including whether the caller may read it. */
export async function getCourseOverview(courseSlug: string, user: SessionUser): Promise<CourseOverview> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      projectGoal: true,
      coverUrl: true,
      difficulty: true,
      estimatedHours: true,
      sequential: true,
      familySlug: true,
      status: true,
      mentor: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
            where: { publishedAt: { not: null } },
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              order: true,
              blocks: { where: { archivedAt: null }, select: { type: true, required: true, archivedAt: true } },
            },
          },
        },
      },
    },
  });
  if (!course) throw new NotFoundError("Course not found");

  const { mentor, modules: courseModules, sequential, familySlug, ...courseFields } = course;
  const base = { course: { ...courseFields, instructorName: mentor.name } };

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId: user.id } },
  });
  if (!enrollment) return { ...base, access: "none", enrollment: null, track: null, syllabus: null };

  const summary = {
    percentComplete: enrollment.percentComplete,
    chaptersCompleted: enrollment.chaptersCompleted,
    pendingReviews: enrollment.pendingReviews,
  };
  if (!enrollmentGrantsContentAccess(enrollment.lifecycle)) {
    return { ...base, access: "payment_required", enrollment: summary, track: null, syllabus: null };
  }

  const { modules, flatChapters } = await syllabusForEnrollment(
    { sequential, modules: courseModules },
    enrollment.id,
    bypassProgressGatingForEmail(user.email)
  );

  return {
    ...base,
    access: "active",
    enrollment: summary,
    track: buildCourseTrack(familySlug, enrollment),
    syllabus: {
      modules,
      chapterCount: flatChapters.length,
      continueHref: resolveContinueChapterPath(course.slug, flatChapters),
      defaultOpenModuleId: pickDefaultOpenModule(modules),
    },
  };
}
