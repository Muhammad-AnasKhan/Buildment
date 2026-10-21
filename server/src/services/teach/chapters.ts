import type { Prisma } from "../../generated/prisma/index.js";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import type { ChapterEditorView, ChapterIdResult, SavedAtResult } from "../../shared/api/teach.js";
import { TEACH_ERROR_CODES } from "../../shared/api/teach.js";
import { blockDefinitions, isRegisteredBlockType } from "../../shared/blocks/definitions.js";
import { slugify } from "../../shared/lib/mdx-headings.js";
import { mdxComponentAllowlist } from "../../shared/mdx/component-allowlist.js";
import { collectUnknownComponents, diffBlocks, extractBlocksFromSource } from "../../shared/mdx/extract.js";
import { collectCanvasProblems } from "../../shared/mdx/canvas-tags.js";
import { blockConfigFromSource, extractBlockConfigsFromSource, hasQuizBlocks, isActivityOnlySource } from "../../shared/mdx/extract-block-config.js";
import { remarkChecklist } from "../../shared/mdx/remark-checklist.js";
import { remarkLearningLog } from "../../shared/mdx/remark-learning-log.js";
import { restoreInteractiveBlockTags } from "../../shared/mdx/restore-block-tags.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError, UnprocessableError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import type { ChapterSettingsBody, CreateChapterBody, MoveDirection } from "../../validations/teach.js";
import { requireCourseById } from "./access.js";
import { syncChapterBlocksFromSource } from "./sync-blocks.js";

// Mentor-facing chapter mutations. Draft saves write Chapter.source only;
// learners read Chapter.compiled, which publish snapshots after validation.

async function requireChapter(user: SessionUser, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) throw new NotFoundError("Chapter not found");
  const course = await requireCourseById(user, chapter.courseId);
  return { chapter, course };
}

export async function createChapter(user: SessionUser, courseId: string, input: CreateChapterBody): Promise<ChapterIdResult> {
  await requireCourseById(user, courseId);
  const moduleId = input.moduleId ?? null;
  if (moduleId) {
    const owner = await prisma.module.findFirst({ where: { id: moduleId, courseId }, select: { id: true } });
    if (!owner) throw new NotFoundError("Module not found");
  }

  const slug = await uniqueChapterSlug(courseId, slugify(input.title));
  const last = await prisma.chapter.findFirst({ where: { courseId, moduleId }, orderBy: { order: "desc" }, select: { order: true } });
  const chapter = await prisma.chapter.create({
    data: { courseId, moduleId, title: input.title, slug, order: (last?.order ?? 0) + 1, source: `# ${input.title}\n` },
    select: { id: true },
  });
  return { chapterId: chapter.id };
}

async function uniqueChapterSlug(courseId: string, base: string): Promise<string> {
  let slug = base;
  for (let suffix = 2; ; suffix += 1) {
    const taken = await prisma.chapter.findUnique({ where: { courseId_slug: { courseId, slug } }, select: { id: true } });
    if (!taken) return slug;
    slug = `${base}-${suffix}`;
  }
}

/** Swaps the chapter with its neighbour inside the same module; 409 at the edge. */
export async function moveChapter(user: SessionUser, chapterId: string, direction: MoveDirection): Promise<void> {
  const { chapter } = await requireChapter(user, chapterId);
  const neighbor = await prisma.chapter.findFirst({
    where: {
      courseId: chapter.courseId,
      moduleId: chapter.moduleId,
      order: direction === "up" ? { lt: chapter.order } : { gt: chapter.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) throw new ConflictError("Chapter is already at the edge.", TEACH_ERROR_CODES.ALREADY_AT_EDGE);

  await prisma.$transaction([
    prisma.chapter.update({ where: { id: chapter.id }, data: { order: neighbor.order } }),
    prisma.chapter.update({ where: { id: neighbor.id }, data: { order: chapter.order } }),
  ]);
}

/** The editor's initial state. Escaped block placeholders are restored so the editor sees real JSX. */
export async function loadChapterEditor(user: SessionUser, chapterId: string): Promise<ChapterEditorView> {
  const { chapter, course } = await requireChapter(user, chapterId);
  const blocks = await prisma.block.findMany({ where: { chapterId: chapter.id, archivedAt: null }, select: { id: true, config: true } });
  return {
    chapterId: chapter.id,
    courseId: course.id,
    courseSlug: course.slug,
    title: chapter.title,
    summary: chapter.summary,
    estimatedMinutes: chapter.estimatedMinutes,
    readerMode: chapter.readerMode,
    isMilestone: chapter.isMilestone,
    publishedAt: chapter.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: chapter.publishedAt !== null && chapter.compiled !== chapter.source,
    source: restoreInteractiveBlockTags(chapter.source),
    lastPublishedSource: chapter.compiled,
    blockConfigs: Object.fromEntries(blocks.map((block) => [block.id, block.config])),
  };
}

export async function updateChapterSettings(user: SessionUser, chapterId: string, input: ChapterSettingsBody): Promise<SavedAtResult> {
  const { chapter } = await requireChapter(user, chapterId);
  if (input.readerMode !== "QUIZ" && chapter.compiled && hasQuizBlocks(restoreInteractiveBlockTags(chapter.compiled))) {
    throw new UnprocessableError("Published quizzes require Quiz flow. Remove the quizzes and publish before changing the reader experience.", TEACH_ERROR_CODES.CHAPTER_NOT_PUBLISHABLE);
  }
  await prisma.chapter.update({
    where: { id: chapter.id },
    data: {
      title: input.title,
      summary: input.summary || null,
      estimatedMinutes: input.estimatedMinutes,
      readerMode: input.readerMode,
      isMilestone: input.isMilestone,
    },
  });
  return { savedAt: new Date().toISOString() };
}

export async function saveChapterDraft(user: SessionUser, chapterId: string, source: string): Promise<SavedAtResult> {
  const { chapter } = await requireChapter(user, chapterId);
  await prisma.chapter.update({ where: { id: chapter.id }, data: { source } });
  await syncChapterBlocksFromSource(chapter.id, source);
  return { savedAt: new Date().toISOString() };
}

/**
 * Publish = validate + block sync + snapshot. Compilation happens once here,
 * never on read: the reader renders the Chapter.compiled snapshot.
 */
export async function publishChapter(user: SessionUser, chapterId: string): Promise<void> {
  const { chapter } = await requireChapter(user, chapterId);
  const renderable = restoreInteractiveBlockTags(chapter.source);
  const reasons = await collectPublishProblems(chapter.id, renderable, chapter.readerMode);
  if (reasons.length > 0) {
    throw new UnprocessableError("The chapter cannot be published yet.", TEACH_ERROR_CODES.CHAPTER_NOT_PUBLISHABLE, reasons);
  }

  await syncChapterBlocksFromSource(chapter.id, renderable);
  await prisma.chapter.update({
    where: { id: chapter.id },
    data: { compiled: chapter.source, publishedAt: new Date() },
  });
}

/**
 * Permanently deletes a chapter with its blocks and learner history. Chapters
 * with progress or submissions need an explicit confirmation flag. Ordering
 * gaps are harmless — new chapters use the highest order + 1.
 */
export async function removeChapter(
  user: SessionUser,
  chapterId: string,
  options: { confirmedWithProgress?: boolean }
): Promise<void> {
  const { chapter } = await requireChapter(user, chapterId);

  const [progress, responses] = await Promise.all([
    prisma.chapterProgress.count({ where: { chapterId: chapter.id } }),
    prisma.response.count({ where: { block: { chapterId: chapter.id } } }),
  ]);
  if ((progress > 0 || responses > 0) && !options.confirmedWithProgress) {
    throw new ConflictError(
      "This chapter has learner progress or submissions. Confirm you want to remove it and their history.",
      TEACH_ERROR_CODES.CHAPTER_PROGRESS_CONFIRMATION_REQUIRED
    );
  }

  await prisma.chapter.delete({ where: { id: chapter.id } });
}

/** Everything that would break the reader: MDX syntax, unknown components, block configs. */
async function collectPublishProblems(chapterId: string, renderable: string, readerMode: string, db: Prisma.TransactionClient = prisma): Promise<string[]> {
  const problems: string[] = [];

  try {
    await compile(renderable, { remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog], outputFormat: "function-body" });
  } catch (error) {
    problems.push(`MDX failed to compile: ${error instanceof Error ? error.message : String(error)}`);
    return problems;
  }

  for (const name of collectUnknownComponents(renderable, mdxComponentAllowlist)) {
    problems.push(`Unknown component <${name}> is not in the allowed component map.`);
  }

  problems.push(...collectCanvasProblems(renderable));

  if (readerMode !== "QUIZ" && hasQuizBlocks(renderable)) {
    problems.push("Quizzes require Quiz flow. Change the reader experience in Chapter settings before publishing.");
  }

  if (readerMode === "QUIZ" && !isActivityOnlySource(renderable)) {
    problems.push("Quiz flow supports activities only: Quiz, Open Question, Predict, and Code Exercise. Move lesson text and visual blocks to a standard lesson.");
  }

  const extracted = extractBlocksFromSource(renderable);
  const configs = extractBlockConfigsFromSource(renderable);
  const existing = await db.block.findMany({
    where: { chapterId, archivedAt: null },
    select: { id: true, type: true, config: true, sourceHash: true },
  });
  const existingById = new Map(existing.map((row) => [row.id, row]));
  const created = new Set(diffBlocks(extracted, existing).create.map((row) => row.id));

  for (const block of extracted) {
    if (!block.blockType || !isRegisteredBlockType(block.blockType)) continue;
    const schema = blockDefinitions[block.blockType].schema;
    const inlineConfig = blockConfigFromSource(block, configs);

    if (created.has(block.id)) {
      if (!schema.safeParse(inlineConfig ?? {}).success) {
        problems.push(`Block "${block.id}" (<${block.tagName}>) is missing valid content — edit it in the rich UI or source before publishing.`);
      }
      continue;
    }

    const persisted = existingById.get(block.id);
    const config = inlineConfig ?? persisted?.config;
    if (!config) {
      if (persisted) problems.push(`${block.tagName} block "${block.id}" has no configuration yet. Publish blocked.`);
      continue;
    }
    const result = schema.safeParse(config);
    if (!result.success) {
      const details = result.error.issues.map((issue) => issue.path.join(".") || "configuration").join(", ");
      problems.push(`${block.tagName} block "${block.id}" has invalid configuration: ${details}. Publish blocked.`);
    }
  }

  return problems;
}


/** Validate the complete selection before atomically syncing and publishing its drafts. */
export async function publishChapters(user: SessionUser, scope: { courseId: string } | { moduleId: string }): Promise<void> {
  let courseId: string;
  let moduleId: string | undefined;
  if ("moduleId" in scope) {
    const module = await prisma.module.findUnique({ where: { id: scope.moduleId }, select: { courseId: true } });
    if (!module) throw new NotFoundError("Module not found");
    courseId = module.courseId;
    moduleId = scope.moduleId;
  } else courseId = scope.courseId;
  await requireCourseById(user, courseId);

  await prisma.$transaction(async tx => {
    const chapters = await tx.chapter.findMany({ where: { courseId, ...(moduleId ? { moduleId } : {}) }, orderBy: [{ order: "asc" }, { id: "asc" }] });
    if (!chapters.length) throw new UnprocessableError("There are no chapters to publish.", TEACH_ERROR_CODES.CHAPTER_NOT_PUBLISHABLE);
    const pending = chapters.filter(chapter => !chapter.publishedAt || chapter.compiled !== chapter.source);
    const problems: string[] = [];
    for (const chapter of pending) {
      const reasons = await collectPublishProblems(chapter.id, restoreInteractiveBlockTags(chapter.source), chapter.readerMode, tx);
      problems.push(...reasons.map(reason => `${chapter.title}: ${reason}`));
    }
    if (problems.length) throw new UnprocessableError("Some chapters cannot be published yet. No chapters were published.", TEACH_ERROR_CODES.CHAPTER_NOT_PUBLISHABLE, problems);
    const publishedAt = new Date();
    for (const chapter of pending) {
      await syncChapterBlocksFromSource(chapter.id, chapter.source, tx);
      const updated = await tx.chapter.updateMany({
        where: { id: chapter.id, source: chapter.source, readerMode: chapter.readerMode, compiled: chapter.compiled, publishedAt: chapter.publishedAt },
        data: { compiled: chapter.source, publishedAt },
      });
      if (updated.count !== 1) throw new ConflictError("A chapter changed during publishing. Please try again.");
    }
  }, { timeout: 20000 });
}
