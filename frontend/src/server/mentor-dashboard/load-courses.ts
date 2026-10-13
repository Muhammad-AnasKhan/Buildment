import "server-only";

import { prisma } from "@/server/db";
import { average, activityState } from "./helpers";
import type { MentorCoursesView } from "./types";

export async function loadMentorCourses(user: { id: string; role: string }): Promise<MentorCoursesView> {
  const now = Date.now();
  const rows = await prisma.course.findMany({
    where: user.role === "ADMIN" ? undefined : { mentorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      updatedAt: true,
      _count: { select: { chapters: true } },
      enrollments: {
        select: {
          status: true,
          percentComplete: true,
          pendingReviews: true,
          lastActiveAt: true,
        },
      },
      helpThreads: { where: { status: "OPEN" }, select: { id: true } },
    },
  });

  const courses = rows.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    status: course.status,
    chapterCount: course._count.chapters,
    learnerCount: course.enrollments.length,
    averageProgress: average(course.enrollments.map((item) => item.percentComplete)),
    completedLearners: course.enrollments.filter((item) => item.status === "COMPLETED").length,
    pendingReviews: course.enrollments.reduce((sum, item) => sum + item.pendingReviews, 0),
    openHelpRequests: course.helpThreads.length,
    inactiveLearners: course.enrollments.filter(
      (item) => item.status === "IN_PROGRESS" && activityState(item.lastActiveAt, now) === "inactive"
    ).length,
    updatedAt: course.updatedAt.toISOString(),
  }));

  return {
    courses,
    summary: {
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.status === "PUBLISHED").length,
      draftCourses: courses.filter((course) => course.status === "DRAFT").length,
      totalLearners: courses.reduce((sum, course) => sum + course.learnerCount, 0),
      pendingReviews: courses.reduce((sum, course) => sum + course.pendingReviews, 0),
      openHelpRequests: courses.reduce((sum, course) => sum + course.openHelpRequests, 0),
    },
  };
}
