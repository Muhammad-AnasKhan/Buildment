import { ulid } from "ulid";
import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import { resolveCourseFamily, type CourseFamily } from "../../shared/lib/course-tracks.js";
import { NotFoundError } from "../../utils/errors.js";

export type ReleaseChapter = {
  id: string; key: string | null; slug: string; title: string; order: number;
  estimatedMinutes: number | null; readerMode: "DEFAULT" | "QUIZ"; isMilestone: boolean;
  quizPassingScore: number;
};
export type ReleaseModule = { id: string; key: string | null; title: string; order: number; chapters: ReleaseChapter[] };
export type ReleaseContent = { variants: Record<string, ReleaseModule[]> };

export function variantForRelease(familySlug: string | CourseFamily | null, variantSlug: string | null): string {
  return variantSlug ?? (typeof familySlug === "object" && familySlug ? familySlug : resolveCourseFamily(familySlug))?.defaultVariantSlug ?? "default";
}

export async function snapshotLiveCourse(tx: Prisma.TransactionClient, courseId: string, familySlug: string | null): Promise<ReleaseContent> {
  const course = await tx.course.findUniqueOrThrow({ where: { id: courseId }, select: { status: true, variantFamily: true } });
  const modules = await tx.module.findMany({
    where: { courseId, archivedAt: null }, orderBy: { order: "asc" },
    include: { chapters: { where: { archivedAt: null, ...(course.status === "DRAFT" ? {} : { publishedAt: { not: null } }) }, orderBy: { order: "asc" } } },
  });
  const contentModules: ReleaseModule[] = modules.map(module => ({
    id: module.id, key: module.contentKey, title: module.title, order: module.order,
    chapters: module.chapters.map(chapter => ({ id: chapter.id, key: chapter.contentKey, slug: chapter.slug,
      title: chapter.title, order: chapter.order, estimatedMinutes: chapter.estimatedMinutes,
      readerMode: chapter.readerMode, quizPassingScore: chapter.quizPassingScore, isMilestone: chapter.isMilestone })),
  }));
  const variants = resolveCourseFamily(familySlug, course.variantFamily)?.variants.map(variant => variant.slug) ?? ["default"];
  return { variants: Object.fromEntries(variants.map(slug => [slug, contentModules])) };
}

/** Called inside a publish transaction, before any live-row edits. */
export async function ensureBaselineRelease(tx: Prisma.TransactionClient, courseId: string) {
  const course = await tx.course.findUniqueOrThrow({ where: { id: courseId }, select: { activeReleaseId: true, familySlug: true, variantFamily: true } });
  if (course.activeReleaseId) return tx.courseRelease.findUniqueOrThrow({ where: { id: course.activeReleaseId } });
  const content = await snapshotLiveCourse(tx, courseId, course.familySlug);
  const release = await tx.courseRelease.create({ data: { id: ulid(), courseId, number: 1, content: content as unknown as Prisma.InputJsonValue } });
  await tx.course.update({ where: { id: courseId }, data: { activeReleaseId: release.id } });
  // Existing learners who have begun work keep this baseline after publication.
  await tx.enrollment.updateMany({ where: { courseId, releaseId: null,
    OR: [{ startedAt: { not: null } }, { variantLockedAt: { not: null } }, { chapterProgress: { some: {} } }] },
    data: { releaseId: release.id } });
  const family = resolveCourseFamily(course.familySlug, course.variantFamily);
  if (family) {
    const begun = { OR: [{ startedAt: { not: null } }, { chapterProgress: { some: {} } }] };
    await tx.enrollment.updateMany({ where: { courseId, variantSlug: null, ...begun },
      data: { variantSlug: family.defaultVariantSlug, variantChosenAt: new Date() } });
    await tx.enrollment.updateMany({ where: { courseId, variantLockedAt: null, ...begun },
      data: { variantLockedAt: new Date() } });
  }
  return release;
}

export async function releaseForEnrollment(courseId: string, enrollment: { releaseId: string | null; variantSlug: string | null }, familySlug: string | null) {
  const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId }, select: { activeReleaseId: true, variantFamily: true } });
  const releaseId = enrollment.releaseId ?? course.activeReleaseId;
  if (!releaseId) return null;
  const release = await prisma.courseRelease.findFirst({ where: { id: releaseId, courseId } });
  if (!release) throw new NotFoundError("Course release not found.");
  const content = release.content as unknown as ReleaseContent;
  const variant = variantForRelease(resolveCourseFamily(familySlug, course.variantFamily), enrollment.variantSlug);
  const modules = content.variants[variant];
  if (!modules) throw new NotFoundError("Course variant not found in this release.");
  return { release, variant, modules };
}

/** Build the existing syllabus shape from a pinned release. Chapter and block rows are immutable once referenced. */
export async function releaseModulesWithBlocks(modules: ReleaseModule[]) {
  const ids = modules.flatMap(module => module.chapters.map(chapter => chapter.id));
  const rows = await prisma.chapter.findMany({ where: { id: { in: ids } }, select: {
    id: true, blocks: { where: { archivedAt: null }, select: { id: true, type: true, required: true, archivedAt: true } },
  } });
  const byId = new Map(rows.map(row => [row.id, row.blocks]));
  return modules.map(module => ({ ...module, chapters: module.chapters.map(chapter => ({ ...chapter, blocks: byId.get(chapter.id) ?? [] })) }));
}

export async function releaseContainsChapter(courseId: string, enrollment: { releaseId: string | null; variantSlug: string | null }, familySlug: string | null, chapterId: string) {
  const selected = await releaseForEnrollment(courseId, enrollment, familySlug);
  return !selected || selected.modules.some(module => module.chapters.some(chapter => chapter.id === chapterId));
}

export async function assertEnrollmentChapter(tx: Prisma.TransactionClient, enrollmentId: string, chapterId: string) {
  const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollmentId },
    select: { courseId: true, releaseId: true, variantSlug: true, course: { select: { activeReleaseId: true, familySlug: true, variantFamily: true } } } });
  const id = enrollment.releaseId ?? enrollment.course.activeReleaseId;
  if (!id) return;
  const release = await tx.courseRelease.findFirstOrThrow({ where: { id, courseId: enrollment.courseId } });
  const variant = variantForRelease(resolveCourseFamily(enrollment.course.familySlug, enrollment.course.variantFamily), enrollment.variantSlug);
  const content = release.content as unknown as ReleaseContent;
  const modules = content.variants[variant];
  if (!modules) throw new NotFoundError("Course variant not found in this release.");
  if (!modules.some(module => module.chapters.some(chapter => chapter.id === chapterId))) throw new NotFoundError("Chapter is not in this learner's course release.");
}
