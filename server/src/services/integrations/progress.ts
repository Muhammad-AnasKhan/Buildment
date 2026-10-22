import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { AuthenticatedOrganization } from "../../types/auth.js";

/** Course progress for one organisation learner, in the organisation API's shape. */
export async function getLearnerProgress(
  org: AuthenticatedOrganization,
  input: { courseId: string; learnerEmail: string }
) {
  const { courseId, learnerEmail } = input;

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      organizationId: org.id,
      courseId,
      OR: [{ learnerProfile: { email: learnerEmail } }, { user: { email: learnerEmail } }],
    },
    include: {
      course: { select: { id: true, slug: true, title: true } },
      chapterProgress: {
        where: { chapter: { archivedAt: null } },
        include: { chapter: { select: { id: true, title: true, order: true } } },
        orderBy: { chapter: { order: "asc" } },
      },
    },
  });
  if (!enrollment) throw new NotFoundError("Enrollment not found");

  const totalLessons = await prisma.chapter.count({ where: { courseId, archivedAt: null } });
  const completedLessons = enrollment.chapterProgress.filter((p) => p.status === "COMPLETED").length;
  const inProgress = enrollment.chapterProgress.find((p) => p.status === "IN_PROGRESS");
  const currentChapter = inProgress ?? enrollment.chapterProgress.find((p) => p.status !== "COMPLETED");

  const completed = enrollment.lifecycle === "COMPLETED" || enrollment.status === "COMPLETED";
  const overallProgress = enrollment.percentComplete;
  const status = completed ? "COMPLETED" : overallProgress > 0 ? "IN_PROGRESS" : "NOT_STARTED";

  return {
    course_id: courseId,
    course_slug: enrollment.course.slug,
    learner_email: learnerEmail,
    lifecycle: enrollment.lifecycle,
    enrollment_status: enrollment.status,
    status,
    overall_progress: overallProgress,
    current_chapter: currentChapter
      ? {
          id: currentChapter.chapter.id,
          title: currentChapter.chapter.title,
          progress:
            currentChapter.blocksTotal > 0
              ? Math.round((100 * currentChapter.blocksCompleted) / currentChapter.blocksTotal)
              : 0,
        }
      : null,
    completed_lessons: completedLessons,
    total_lessons: totalLessons,
    completed,
  };
}
