import { prisma } from "../../db/prisma.js";
import { flattenChapterIds, lockedChapterIds, previousChapterId } from "./rules.js";
import type { ProgressStatus } from "../../generated/prisma/index.js";
import { releaseForEnrollment } from "../courses/releases.js";

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
      familySlug: true,
      modules: {
        where: { archivedAt: null },
        orderBy: { order: "asc" },
        select: {
          order: true,
          chapters: {
            where: { archivedAt: null, publishedAt: { not: null } },
            orderBy: { order: "asc" },
            select: { id: true, order: true, slug: true, title: true },
          },
        },
      },
    },
  });
  if (!course) return null;
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id: enrollmentId }, select: { releaseId: true, variantSlug: true } });
  const selected = await releaseForEnrollment(courseId, enrollment, course.familySlug);
  const modules = selected?.modules ?? course.modules;

  const progressRows = await prisma.chapterProgress.findMany({
    where: { enrollmentId },
    select: { chapterId: true, status: true },
  });
  const progressById = new Map<string, ProgressStatus>(
    progressRows.map((row) => [row.chapterId, row.status])
  );
  const orderedIds = flattenChapterIds(modules);
  const lockedIds = options?.bypassLocking
    ? new Set<string>()
    : lockedChapterIds(orderedIds, progressById, course.sequential);

  return {
    sequential: course.sequential,
    modules,
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
  const gate = await loadCourseGate(args.courseId, args.enrollmentId);
  if (!gate) return;
  if (!gate.orderedIds.includes(args.chapterId)) throw new ChapterLockedError(args.chapterId, null);
  if (args.bypassLocking) return;
  if (!gate.lockedIds.has(args.chapterId)) return;
  throw new ChapterLockedError(args.chapterId, previousChapterId(gate.orderedIds, args.chapterId));
}
