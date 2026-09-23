import "server-only";

import { prisma } from "@/server/db";
import { utcDateOnly } from "@/server/progress/heartbeat";
import { buildMenteeDashboardViewModel } from "./dashboard-model";

export async function loadMenteeDashboard(args: {
  learnerId: string;
  learnerName: string;
  bypassLocking?: boolean;
}) {
  const today = utcDateOnly();
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - 6);

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: args.learnerId },
    orderBy: [{ lastActiveAt: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      percentComplete: true,
      chaptersCompleted: true,
      totalScore: true,
      maxScore: true,
      pendingReviews: true,
      lastActiveAt: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverUrl: true,
          sequential: true,
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              title: true,
              chapters: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  order: true,
                  blocks: {
                    where: { archivedAt: null },
                    orderBy: { order: "asc" },
                    select: { type: true, required: true, archivedAt: true },
                  },
                },
              },
            },
          },
        },
      },
      chapterProgress: {
        select: {
          chapterId: true,
          status: true,
          blocksCompleted: true,
          blocksTotal: true,
          timeSpentSeconds: true,
          startedAt: true,
          completedAt: true,
        },
      },
    },
  });

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const [dailyRows, sessions, helpThreads, openHelpCount, responses] = await Promise.all([
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : prisma.dailyActivity.findMany({
          where: { enrollmentId: { in: enrollmentIds }, date: { gte: since } },
          select: { date: true, activeSeconds: true },
        }),
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : prisma.studySession.findMany({
          where: { enrollmentId: { in: enrollmentIds } },
          orderBy: { updatedAt: "desc" },
          take: 12,
          select: {
            id: true,
            enrollmentId: true,
            status: true,
            startedAt: true,
            endedAt: true,
            activeSeconds: true,
            updatedAt: true,
            chapter: { select: { slug: true, title: true } },
            enrollment: { select: { course: { select: { slug: true, title: true } } } },
          },
        }),
    prisma.helpThread.findMany({
      where: { menteeId: args.learnerId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        course: { select: { slug: true, title: true } },
        chapter: { select: { slug: true, title: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { authorId: true, createdAt: true },
        },
      },
    }),
    prisma.helpThread.count({ where: { menteeId: args.learnerId, status: "OPEN" } }),
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : prisma.response.findMany({
          where: { userId: args.learnerId, enrollmentId: { in: enrollmentIds }, status: { not: "DRAFT" } },
          orderBy: [{ submittedAt: "desc" }, { attempt: "desc" }],
          take: 48,
          select: {
            id: true,
            blockId: true,
            enrollmentId: true,
            attempt: true,
            status: true,
            submittedAt: true,
            review: { select: { feedback: true, verdict: true, createdAt: true } },
            block: {
              select: {
                chapter: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    course: { select: { slug: true, title: true } },
                  },
                },
              },
            },
          },
        }),
  ]);

  const byDay = new Map<string, number>();
  for (const row of dailyRows) {
    const key = row.date.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + row.activeSeconds);
  }
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    return { day, seconds: byDay.get(day) ?? 0 };
  });

  return buildMenteeDashboardViewModel({
    learnerName: args.learnerName,
    enrollments,
    responses,
    helpThreads,
    sessions,
    week,
    todayKey: today.toISOString().slice(0, 10),
    openHelpCount,
    bypassLocking: args.bypassLocking,
  });
}
