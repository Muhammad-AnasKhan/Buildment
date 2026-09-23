"use server";

import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { remarkChecklist } from "@/mdx/remark-checklist";
import { remarkLearningLog } from "@/mdx/remark-learning-log";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { restoreInteractiveBlockTags } from "@/mdx/restore-block-tags";
import {
  collectUnknownComponents,
  diffBlocks,
  extractBlocksFromSource,
} from "@/mdx/extract";
import { mdxComponents } from "@/mdx/components";
import { blockRegistry, isRegisteredBlockType } from "@/blocks/registry";
import { slugify } from "@/lib/utils";

// Mentor-facing chapter mutations. Authorization goes through the guards in
// server/auth — never an ad-hoc check here (docs/09-security.mdx).
// Draft autosave writes Chapter.source only; learners never see a draft
// because the reader renders Chapter.compiled, which publish snapshots.

export type ActionResult = { ok: true } | { ok: false; errors: string[] };

const chapterIdInput = z.object({ chapterId: z.string().min(1) });

const chapterSettingsInput = z.object({
  chapterId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required.").max(120),
  summary: z.string().trim().max(280).nullable(),
  estimatedMinutes: z.number().int().min(1).max(600).nullable(),
  readerMode: z.enum(["DEFAULT", "QUIZ"]),
  isMilestone: z.boolean(),
});

export async function updateChapterSettings(input: {
  chapterId: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number | null;
  readerMode: "DEFAULT" | "QUIZ";
  isMilestone: boolean;
}): Promise<ActionResult | { ok: true; savedAt: string }> {
  const parsed = chapterSettingsInput.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) return { ok: false, errors: ["Chapter not found."] };
  await requireMentorOfCourse(chapter.courseId);

  await prisma.chapter.update({
    where: { id: chapter.id },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary || null,
      estimatedMinutes: parsed.data.estimatedMinutes,
      readerMode: parsed.data.readerMode,
      isMilestone: parsed.data.isMilestone,
    },
  });

  return { ok: true, savedAt: new Date().toISOString() };
}

export async function saveChapterDraft(input: {
  chapterId: string;
  source: string;
}): Promise<ActionResult | { ok: true; savedAt: string }> {
  const parsed = z
    .object({ chapterId: z.string().min(1), source: z.string() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Invalid draft payload."] };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) return { ok: false, errors: ["Chapter not found."] };
  await requireMentorOfCourse(chapter.courseId);

  await prisma.chapter.update({
    where: { id: chapter.id },
    data: { source: parsed.data.source },
  });
  return { ok: true, savedAt: new Date().toISOString() };
}

/**
 * Publish = validate + block sync + snapshot, all at once (docs/02-content-authoring.mdx
 * "Rendering pipeline"). Compilation happens here, not on every read: the
 * reader renders the Chapter.compiled snapshot written below.
 */
export async function publishChapter(input: {
  chapterId: string;
}): Promise<ActionResult> {
  const parsed = chapterIdInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Invalid chapter id."] };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
  });
  if (!chapter) return { ok: false, errors: ["Chapter not found."] };
  await requireMentorOfCourse(chapter.courseId);

  // The reader unescapes imported block placeholders before rendering, so
  // validation, extraction, and sync all run against that same restored form.
  const renderable = restoreInteractiveBlockTags(chapter.source);
  const errors: string[] = [];

  try {
    await compile(renderable, {
      remarkPlugins: [remarkGfm, remarkChecklist, remarkLearningLog],
      outputFormat: "function-body",
    });
  } catch (error) {
    errors.push(
      `MDX failed to compile: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const allowlist = new Set(Object.keys(mdxComponents));
  for (const name of collectUnknownComponents(renderable, allowlist)) {
    errors.push(`Unknown component <${name}> is not in the allowed component map.`);
  }

  const extracted = extractBlocksFromSource(renderable);
  const existing = await prisma.block.findMany({
    where: { chapterId: chapter.id, archivedAt: null },
    select: { id: true, sourceHash: true },
  });
  const diff = diffBlocks(extracted, existing);

  // M1 scaffolding: new blocks can only be created once their config can be
  // extracted (M2 plugs that in). Until then, a hand-authored block tag gets
  // a clear publish error instead of a row whose schema can't parse.
  for (const block of diff.create) {
    if (!block.blockType || !isRegisteredBlockType(block.blockType)) continue;
    const configParsed = blockRegistry[block.blockType].schema.safeParse({});
    if (!configParsed.success) {
      errors.push(
        `Block "${block.id}" (<${block.tagName}>) has no config yet — interactive block authoring arrives in M2.`
      );
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  await prisma.$transaction(async (tx) => {
    if (diff.create.length > 0) {
      await tx.block.createMany({
        data: diff.create.map((block) => ({
          id: block.id,
          chapterId: chapter.id,
          type: block.blockType ?? "QUIZ",
          order: block.order,
          config: {},
          sourceHash: block.sourceHash,
        })),
      });
    }
    if (diff.archiveIds.length > 0) {
      await tx.block.updateMany({
        where: { id: { in: diff.archiveIds }, chapterId: chapter.id },
        data: { archivedAt: new Date() },
      });
    }
    for (const block of diff.bump) {
      await tx.block.update({
        where: { id: block.id },
        data: { version: { increment: 1 }, sourceHash: block.sourceHash },
      });
    }
    for (const block of diff.backfill) {
      await tx.block.update({
        where: { id: block.id },
        data: { sourceHash: block.sourceHash },
      });
    }
    await tx.chapter.update({
      where: { id: chapter.id },
      data: { compiled: chapter.source, publishedAt: new Date() },
    });
  });

  return { ok: true };
}

const createChapterInput = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1).optional(),
  title: z.string().min(1).max(120),
});

export async function createChapter(input: {
  courseId: string;
  moduleId?: string;
  title: string;
}): Promise<{ ok: true; chapterId: string } | { ok: false; errors: string[] }> {
  const parsed = createChapterInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Title is required."] };

  await requireMentorOfCourse(parsed.data.courseId);

  const moduleId = parsed.data.moduleId ?? null;
  const slugBase = slugify(parsed.data.title);
  const slug = await uniqueChapterSlug(parsed.data.courseId, slugBase);
  const last = await prisma.chapter.findFirst({
    where: { courseId: parsed.data.courseId, moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const chapter = await prisma.chapter.create({
    data: {
      courseId: parsed.data.courseId,
      moduleId,
      title: parsed.data.title,
      slug,
      order: (last?.order ?? 0) + 1,
      source: `# ${parsed.data.title}\n`,
    },
  });
  return { ok: true, chapterId: chapter.id };
}

const moveChapterInput = z.object({
  chapterId: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export async function moveChapter(input: {
  chapterId: string;
  direction: "up" | "down";
}): Promise<ActionResult> {
  const parsed = moveChapterInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Invalid move request."] };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
  });
  if (!chapter) return { ok: false, errors: ["Chapter not found."] };
  await requireMentorOfCourse(chapter.courseId);

  const neighbor = await prisma.chapter.findFirst({
    where: {
      courseId: chapter.courseId,
      moduleId: chapter.moduleId,
      order: parsed.data.direction === "up"
        ? { lt: chapter.order }
        : { gt: chapter.order },
    },
    orderBy: { order: parsed.data.direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { ok: false, errors: ["Chapter is already at the edge."] };

  await prisma.$transaction([
    prisma.chapter.update({
      where: { id: chapter.id },
      data: { order: neighbor.order },
    }),
    prisma.chapter.update({
      where: { id: neighbor.id },
      data: { order: chapter.order },
    }),
  ]);
  return { ok: true };
}

async function uniqueChapterSlug(courseId: string, base: string): Promise<string> {
  let slug = base;
  for (let suffix = 2; ; suffix += 1) {
    const taken = await prisma.chapter.findUnique({
      where: { courseId_slug: { courseId, slug } },
      select: { id: true },
    });
    if (!taken) return slug;
    slug = `${base}-${suffix}`;
  }
}
