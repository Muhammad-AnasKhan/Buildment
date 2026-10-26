
import { prisma } from "../../db/prisma.js";
import { dateToDayKey, localDayKey, shiftDayKey, dayKeyToDate } from "../../shared/lib/local-date.js";
import { loadGamificationSummary } from "../gamification/summary.js";
import { loadLearnerHabit } from "../progress/learner-habit.js";
import { buildMenteeDashboardViewModel } from "./dashboard-model.js";
import { learnerTimeZone } from "./time-zone.js";

export async function loadMenteeDashboard(args: {
  learnerId: string;
  learnerName: string;
  bypassLocking?: boolean;
}) {
  // Days are the learner's own (DailyActivity is written on their local day).
  const todayKey = localDayKey(new Date(), await learnerTimeZone(args.learnerId));
  const since = dayKeyToDate(shiftDayKey(todayKey, -6));

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: args.learnerId, status: { not: "DROPPED" } },
    orderBy: [{ lastActiveAt: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      lifecycle: true,
      status: true,
      percentComplete: true,
      chaptersCompleted: true,
      totalScore: true,
      maxScore: true,
      pendingReviews: true,
      xpTotal: true,
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
            where: { archivedAt: null },
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              title: true,
              chapters: {
                where: { archivedAt: null, publishedAt: { not: null } },
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
  const [dailyRows, sessions, helpThreads, openHelpCount, responses, habit] = await Promise.all([
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
        menteeLastReadAt: true,
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
            review: { select: { feedback: true, verdict: true, createdAt: true, seenAt: true } },
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
    loadLearnerHabit(args.learnerId),
  ]);

  // The weekly-goal reward is paid by the engagement events (services/engagement/events.ts), not
  // here, so it always arrives with the mascot's reaction instead of silently during a page render.
  const gamification = await loadGamificationSummary(args.learnerId);

  const byDay = new Map<string, number>();
  for (const row of dailyRows) {
    const key = dateToDayKey(row.date);
    byDay.set(key, (byDay.get(key) ?? 0) + row.activeSeconds);
  }
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = shiftDayKey(todayKey, index - 6);
    return { day, seconds: byDay.get(day) ?? 0 };
  });

  return buildMenteeDashboardViewModel({
    learnerId: args.learnerId,
    learnerName: args.learnerName,
    enrollments,
    responses,
    helpThreads,
    sessions,
    week,
    todayKey,
    openHelpCount,
    bypassLocking: args.bypassLocking,
    habit,
    gamification,
  });
}
