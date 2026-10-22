import { createHash } from "node:crypto";
import { ulid } from "ulid";
import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../db/prisma.js";
import type { SessionUser } from "../../types/auth.js";
import type { CourseUpdatePreview } from "../../shared/api/teach.js";
import { BadRequestError, ConflictError } from "../../utils/errors.js";
import { requireCourseById } from "./access.js";
import { parseCourseZip, type ImportPlan } from "./course-import.js";
import { canonical, matchCourseUpdate, type UpdateMapping } from "./course-update-matching.js";
import { recomputeChapterProgress, recomputeEnrollmentRollup } from "../progress/compute.js";

async function snapshot(db: Prisma.TransactionClient, courseId: string) {
  return db.course.findUniqueOrThrow({ where: { id: courseId }, include: {
    modules: { orderBy: { id: "asc" } },
    chapters: { orderBy: { id: "asc" }, include: { blocks: { orderBy: [{ order: "asc" }, { id: "asc" }] } } },
  } });
}
const fingerprint = (value: unknown) => createHash("sha256").update(canonical(value)).digest("hex");
type StoredPlan = { content: ImportPlan; mapping: UpdateMapping };

export async function previewCourseZipUpdate(user: SessionUser, courseId: string, buffer: Buffer): Promise<CourseUpdatePreview> {
  const course = await requireCourseById(user, courseId);
  const { slug, plan } = await parseCourseZip(buffer);
  if (slug !== course.slug) throw new BadRequestError(`The ZIP slug must be "${course.slug}" to update this course.`);
  const current = await snapshot(prisma, courseId);
  const result = matchCourseUpdate(plan, current.modules, current.chapters);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const warnings = [
    "Removed content is archived. Mentor, team, enrollments, submissions, and learner history are retained.",
    "Uncertain matches are treated as new chapters. Existing progress is not transferred to ambiguous content.",
    "Changed activities receive new identities; old submissions remain in history. Completion percentages can change.",
    "Approval releases incoming chapters immediately for published or archived courses, including previously unpublished chapters. Draft courses remain drafts.",
    "Course details, pricing, ownership, and publication status are unchanged.",
  ];
  // Bound retained temporary packages. Approvals are persisted so they work across server instances.
  await prisma.courseImportPreview.deleteMany({ where: { expiresAt: { lt: new Date() }, appliedAt: null } });
  await prisma.courseImportPreview.deleteMany({ where: { courseId, userId: user.id, appliedAt: null } });
  const preview = await prisma.courseImportPreview.create({ data: {
    courseId, userId: user.id, fingerprint: fingerprint(current), expiresAt,
    plan: { content: plan, mapping: result.mapping } as unknown as Prisma.InputJsonValue,
    diff: { modules: result.modules, warnings } as unknown as Prisma.InputJsonValue,
  } });
  return { previewId: preview.id, expiresAt: expiresAt.toISOString(), modules: result.modules, warnings };
}

/** Apply only the server-owned plan the instructor reviewed, with a stale-content check. */
export async function approveCourseZipUpdate(user: SessionUser, courseId: string, previewId: string) {
  await requireCourseById(user, courseId);
  try {
    return await prisma.$transaction(async tx => {
      const preview = await tx.courseImportPreview.findFirst({ where: { id: previewId, courseId, userId: user.id } });
      if (!preview || preview.appliedAt || preview.expiresAt <= new Date()) throw new ConflictError("This preview expired or was already applied. Upload the ZIP again.");
      const current = await snapshot(tx, courseId);
      if (fingerprint(current) !== preview.fingerprint) throw new ConflictError("Course content changed after this preview. Upload the ZIP again to review the latest changes.");
      const { content, mapping } = preview.plan as unknown as StoredPlan;
      const now = new Date();
      const oldChapters = new Map(current.chapters.map(c => [c.id, c]));
      const keptModules: string[] = [], keptChapters: string[] = [];
      const changedActivityChapters = new Set<string>();
      // Park ALL module orders below their current range before reordering (unique per course).
      const baseOrder = Math.min(0, ...current.modules.map(m => m.order)) - current.modules.length - 1;
      for (const [index, module] of current.modules.entries()) {
        await tx.module.update({ where: { id: module.id }, data: { order: baseOrder + index } });
      }
      const usedSlugs = new Set(current.chapters.map(c => c.slug));
      for (const [mi, module] of content.modules.entries()) {
        const match = mapping[mi];
        const moduleId = match.moduleId ?? ulid();
        keptModules.push(moduleId);
        if (match.moduleId) await tx.module.update({ where: { id: moduleId }, data: { title: module.title, order: mi + 1, archivedAt: null } });
        else await tx.module.create({ data: { id: moduleId, courseId, title: module.title, order: mi + 1 } });
        for (const [li, lesson] of module.lessons.entries()) {
          const chapterId = match.chapters[li].chapterId ?? ulid();
          const old = oldChapters.get(chapterId);
          keptChapters.push(chapterId);
          let source = lesson.source;
          if (!old) {
            const baseSlug = `${mi + 1}-${lesson.lessonNum}-${lesson.slugPart}`;
            let slug = baseSlug;
            if (usedSlugs.has(slug)) slug = `${baseSlug}-${ulid().toLowerCase()}`;
            usedSlugs.add(slug);
            await tx.chapter.create({ data: { id: chapterId, courseId, moduleId, slug, title: lesson.title, source: "", order: lesson.lessonNum } });
          }
          const remainingBlocks = new Map(old?.blocks.slice().sort((a, b) => Number(Boolean(a.archivedAt)) - Number(Boolean(b.archivedAt))).map(b => [b.id, b]) ?? []);
          const blockIds: string[] = [];
          // Reuse only semantically identical activities; answers/reviews never migrate to a new task.
          for (const [index, block] of lesson.blocks.entries()) {
            const previous = [...remainingBlocks.values()].find(b => b.type === block.type && b.required === block.required && canonical(b.config) === canonical(block.config));
            const blockId = previous?.id ?? ulid();
            source = source.replaceAll(block.id, blockId);
            blockIds.push(blockId);
            if (previous) {
              remainingBlocks.delete(previous.id);
              await tx.block.update({ where: { id: blockId }, data: { archivedAt: null, order: index + 1 } });
            } else {
              await tx.block.create({ data: { ...block, id: blockId, chapterId, order: index + 1, blocking: false, points: 1, tags: [] } });
              changedActivityChapters.add(chapterId);
            }
          }
          const data = { moduleId, title: lesson.title, summary: lesson.summary, source, compiled: source,
            publishedAt: current.status === "DRAFT" ? old?.publishedAt ?? null : now,
            order: lesson.lessonNum, estimatedMinutes: lesson.estimatedMinutes, readerMode: lesson.readerMode,
            isMilestone: lesson.isMilestone, archivedAt: null };
          await tx.chapter.update({ where: { id: chapterId }, data });
          if (old?.blocks.some(b => !b.archivedAt && !blockIds.includes(b.id))) changedActivityChapters.add(chapterId);
          if (old && (old.isMilestone || lesson.isMilestone) && old.source !== source) changedActivityChapters.add(chapterId);
          await tx.block.updateMany({ where: { chapterId, id: { notIn: blockIds }, archivedAt: null }, data: { archivedAt: now } });
        }
      }
      await tx.chapter.updateMany({ where: { courseId, id: { notIn: keptChapters }, archivedAt: null }, data: { archivedAt: now } });
      await tx.module.updateMany({ where: { courseId, id: { notIn: keptModules }, archivedAt: null }, data: { archivedAt: now } });
      // Preserve timestamps and learning logs; refresh only progress affected by changed activities.
      const affected = await tx.chapterProgress.findMany({ where: { chapterId: { in: [...changedActivityChapters] } }, select: { chapterId: true, enrollmentId: true } });
      for (const row of affected) await recomputeChapterProgress(tx, row.enrollmentId, row.chapterId, { preserveActivity: true });
      const enrollments = await tx.enrollment.findMany({ where: { courseId }, select: { id: true } });
      for (const enrollment of enrollments) await recomputeEnrollmentRollup(tx, enrollment.id, { preserveActivity: true });
      await tx.course.update({ where: { id: courseId }, data: { updatedAt: now } });
      await tx.courseImportPreview.update({ where: { id: preview.id }, data: { appliedAt: now } });
      return { courseSlug: current.slug };
    }, { isolationLevel: "Serializable", timeout: 60000, maxWait: 10000 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2034") throw new ConflictError("The course changed during approval. Upload the ZIP again.");
    throw error;
  }
}
