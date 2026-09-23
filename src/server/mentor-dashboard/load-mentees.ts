import "server-only";

import { prisma } from "@/server/db";
import { activityState, average, formatLastActive, progressState } from "./helpers";
import type { CourseMenteesView, MenteeAttentionKind } from "./types";

const RESPONSE_EVIDENCE_LIMIT = 500;

export async function loadCourseMentees(args: { courseId: string; courseSlug: string }): Promise<CourseMenteesView | null> {
  const now = Date.now();
  const course = await prisma.course.findUnique({
    where: { id: args.courseId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      _count: { select: { chapters: true } },
      invites: {
        where: { acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true, token: true, email: true, createdAt: true },
      },
      enrollments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          userId: true,
          status: true,
          percentComplete: true,
          chaptersCompleted: true,
          totalScore: true,
          maxScore: true,
          pendingReviews: true,
          lastActiveAt: true,
          user: { select: { name: true, email: true, image: true } },
          chapterProgress: {
            where: { status: { not: "NOT_STARTED" } },
            orderBy: { startedAt: "desc" },
            select: {
              status: true,
              timeSpentSeconds: true,
              startedAt: true,
              chapter: { select: { title: true, estimatedMinutes: true } },
            },
          },
        },
      },
      helpThreads: { where: { status: "OPEN" }, select: { menteeId: true } },
    },
  });
  if (!course || course.slug !== args.courseSlug) return null;

  const enrollmentIds = course.enrollments.map((item) => item.id);
  const recentResponses = enrollmentIds.length
    ? await prisma.response.findMany({
        where: { enrollmentId: { in: enrollmentIds }, status: { not: "DRAFT" } },
        orderBy: { submittedAt: "desc" },
        take: RESPONSE_EVIDENCE_LIMIT,
        select: { id: true, enrollmentId: true, blockId: true, status: true },
      })
    : [];

  const latestResponseKeys = new Set<string>();
  const revisionEnrollmentIds = new Set<string>();
  for (const response of recentResponses) {
    const key = `${response.enrollmentId}:${response.blockId}`;
    if (latestResponseKeys.has(key)) continue;
    latestResponseKeys.add(key);
    if (response.status === "NEEDS_REVISION") revisionEnrollmentIds.add(response.enrollmentId);
  }

  const openHelpByUser = new Map<string, number>();
  for (const thread of course.helpThreads) {
    openHelpByUser.set(thread.menteeId, (openHelpByUser.get(thread.menteeId) ?? 0) + 1);
  }

  const mentees = course.enrollments.map((enrollment) => {
    const activity = activityState(enrollment.lastActiveAt, now);
    const openHelpRequests = openHelpByUser.get(enrollment.userId) ?? 0;
    const current = enrollment.chapterProgress[0] ?? null;
    const studySeconds = enrollment.chapterProgress.reduce((sum, item) => sum + item.timeSpentSeconds, 0);
    const stalled = enrollment.chapterProgress.some((item) => {
      const expected = (item.chapter.estimatedMinutes ?? 0) * 60;
      return item.status === "IN_PROGRESS" && expected > 0 && item.timeSpentSeconds > Math.max(7200, expected * 3);
    });
    const attention: Array<{ kind: MenteeAttentionKind; label: string }> = [];
    if (enrollment.pendingReviews > 0) attention.push({ kind: "review", label: `${enrollment.pendingReviews} waiting` });
    if (openHelpRequests > 0) attention.push({ kind: "help", label: `${openHelpRequests} help request${openHelpRequests === 1 ? "" : "s"}` });
    if (revisionEnrollmentIds.has(enrollment.id)) attention.push({ kind: "revision", label: "Revision due" });
    if (activity === "inactive" && enrollment.status === "IN_PROGRESS") attention.push({ kind: "inactive", label: "Inactive 7+ days" });
    if (stalled) attention.push({ kind: "stalled", label: "Long-running chapter" });

    return {
      id: enrollment.id,
      userId: enrollment.userId,
      name: enrollment.user.name ?? enrollment.user.email ?? "Unnamed learner",
      email: enrollment.user.email,
      image: enrollment.user.image,
      status: enrollment.status,
      progressState: progressState(enrollment.status, enrollment.percentComplete),
      percentComplete: enrollment.percentComplete,
      chaptersCompleted: enrollment.chaptersCompleted,
      chapterCount: course._count.chapters,
      score: enrollment.totalScore,
      maxScore: enrollment.maxScore,
      pendingReviews: enrollment.pendingReviews,
      openHelpRequests,
      currentChapter: current?.chapter.title ?? null,
      studySeconds,
      lastActiveAt: enrollment.lastActiveAt?.toISOString() ?? null,
      lastActiveLabel: formatLastActive(enrollment.lastActiveAt, now),
      activityState: activity,
      attention,
      evaluationHref: `/courses/${course.slug}/mentees/${enrollment.id}`,
    };
  });

  return {
    course: { id: course.id, slug: course.slug, title: course.title, status: course.status, chapterCount: course._count.chapters },
    linkInvite: course.invites.find((invite) => invite.email === null) ?? null,
    pendingEmailInvites: course.invites.flatMap((invite) => invite.email ? [{ id: invite.id, email: invite.email, createdAt: invite.createdAt.toISOString() }] : []),
    mentees,
    attentionMentees: mentees.filter((mentee) => mentee.attention.length > 0),
    summary: {
      total: mentees.length,
      active: mentees.filter((mentee) => mentee.activityState === "recent").length,
      averageCompletion: average(mentees.map((mentee) => mentee.percentComplete)),
      completed: mentees.filter((mentee) => mentee.progressState === "completed").length,
      pendingReviews: mentees.reduce((sum, mentee) => sum + mentee.pendingReviews, 0),
      openHelpRequests: mentees.reduce((sum, mentee) => sum + mentee.openHelpRequests, 0),
      inactive: mentees.filter((mentee) => mentee.activityState === "inactive" && mentee.status === "IN_PROGRESS").length,
    },
  };
}
