import "server-only";
import { prisma } from "@/server/db";
import { flattenChapterIds, lockedChapterIds, previousChapterId } from "./rules";
import type { ProgressStatus } from "@/generated/prisma/client";

export class ChapterLockedError extends Error {
  constructor(
    public readonly chapterId: string,
    public readonly previousChapterId: string | null
  ) {
    super(`Chapter ${chapterId} is locked until the previous chapter is complete`);
    this.name = "ChapterLockedError";
  }
}

export async function loadCourseGate(
  courseId: string,
  enrollmentId: string,
  options?: { bypassLocking?: boolean }
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      sequential: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          order: true,
          chapters: {
            orderBy: { order: "asc" },
            select: { id: true, order: true, slug: true, title: true },
          },
        },
      },
    },
  });
  if (!course) return null;

  const progressRows = await prisma.chapterProgress.findMany({
    where: { enrollmentId },
    select: { chapterId: true, status: true },
  });
  const progressById = new Map<string, ProgressStatus>(
    progressRows.map((row) => [row.chapterId, row.status])
  );
  const orderedIds = flattenChapterIds(course.modules);
  const lockedIds = options?.bypassLocking
    ? new Set<string>()
    : lockedChapterIds(orderedIds, progressById, course.sequential);

  return {
    sequential: course.sequential,
    modules: course.modules,
    orderedIds,
    progressById,
    lockedIds,
  };
}

export async function assertChapterUnlocked(args: {
  courseId: string;
  enrollmentId: string;
  chapterId: string;
  bypassLocking?: boolean;
}) {
  if (args.bypassLocking) return;
  const gate = await loadCourseGate(args.courseId, args.enrollmentId);
  if (!gate) return;
  if (!gate.lockedIds.has(args.chapterId)) return;
  throw new ChapterLockedError(args.chapterId, previousChapterId(gate.orderedIds, args.chapterId));
}
