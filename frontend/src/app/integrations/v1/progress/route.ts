import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import {
  IntegrationAuthError,
  authenticateOrganizationFromRequest,
} from "@/server/integrations/authenticate-organization";

export async function GET(request: Request) {
  try {
    const org = await authenticateOrganizationFromRequest(request);
    const url = new URL(request.url);
    const courseId = url.searchParams.get("course_id")?.trim();
    const learnerEmail = url.searchParams.get("learner_email")?.trim().toLowerCase();

    if (!courseId || !learnerEmail) {
      return NextResponse.json({ error: "course_id and learner_email are required" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        organizationId: org.id,
        courseId,
        OR: [
          { learnerProfile: { email: learnerEmail } },
          { user: { email: learnerEmail } },
        ],
      },
      include: {
        course: { select: { id: true, slug: true, title: true } },
        chapterProgress: {
          include: { chapter: { select: { id: true, title: true, order: true } } },
          orderBy: { chapter: { order: "asc" } },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const totalLessons = await prisma.chapter.count({ where: { courseId } });
    const completedLessons = enrollment.chapterProgress.filter((p) => p.status === "COMPLETED").length;
    const inProgress = enrollment.chapterProgress.find((p) => p.status === "IN_PROGRESS");
    const currentChapter = inProgress ?? enrollment.chapterProgress.find((p) => p.status !== "COMPLETED");

    const overallProgress = enrollment.percentComplete;
    const status =
      enrollment.lifecycle === "COMPLETED" || enrollment.status === "COMPLETED"
        ? "COMPLETED"
        : overallProgress > 0
          ? "IN_PROGRESS"
          : "NOT_STARTED";

    return NextResponse.json({
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
      completed: enrollment.status === "COMPLETED" || enrollment.lifecycle === "COMPLETED",
    });
  } catch (error) {
    if (error instanceof IntegrationAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}
