"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireEnrolledMentee, requireHelpThreadAccess } from "@/server/auth/guards";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { ChapterLockedError, assertChapterUnlocked } from "@/server/progress/gate";
import { canReplyToHelpThread, canResolveHelpThread } from "@/server/help/access";

export type HelpActionResult = { ok: true; threadId: string } | { ok: false; error: string };

const messageBody = z
  .string()
  .trim()
  .min(10, "Please add a bit more detail (at least 10 characters).")
  .max(4000, "Message is too long (max 4000 characters).");

const askFromChapterInput = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  body: messageBody,
});

const replyInput = z.object({
  threadId: z.string().min(1),
  body: messageBody,
});

const resolveInput = z.object({
  threadId: z.string().min(1),
});

function revalidateHelpPaths(args: {
  courseSlug: string;
  chapterSlug?: string | null;
  threadId: string;
}) {
  revalidatePath("/help");
  revalidatePath(`/help/${args.threadId}`);
  revalidatePath("/my-questions");
  revalidatePath(`/my-questions/${args.threadId}`);
  revalidatePath(`/courses/${args.courseSlug}`);
  if (args.chapterSlug) {
    revalidatePath(`/courses/${args.courseSlug}/${args.chapterSlug}`);
  }
}

/** Mentee asks from a chapter — creates a thread or adds to the open one for this chapter. */
export async function askMentorFromChapter(input: {
  courseId: string;
  chapterId: string;
  body: string;
}): Promise<HelpActionResult> {
  const parsed = askFromChapterInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, slug: true, courseId: true, course: { select: { slug: true } } },
  });
  if (!chapter || chapter.courseId !== parsed.data.courseId) {
    return { ok: false, error: "Chapter not found." };
  }

  const { enrollment, user } = await requireEnrolledMentee(chapter.courseId);
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  const existingOpen = await prisma.helpThread.findFirst({
    where: {
      menteeId: user.id,
      chapterId: chapter.id,
      status: "OPEN",
    },
    select: { id: true },
  });

  if (!existingOpen) {
    try {
      await assertChapterUnlocked({
        courseId: chapter.courseId,
        enrollmentId: enrollment.id,
        chapterId: chapter.id,
        bypassLocking,
      });
    } catch (error) {
      if (error instanceof ChapterLockedError) {
        return { ok: false, error: "Finish the previous chapter before asking for help here." };
      }
      throw error;
    }
  }

  const thread =
    existingOpen ??
    (await prisma.helpThread.create({
      data: {
        courseId: chapter.courseId,
        chapterId: chapter.id,
        menteeId: user.id,
      },
      select: { id: true },
    }));

  await prisma.helpMessage.create({
    data: {
      threadId: thread.id,
      authorId: user.id,
      body: parsed.data.body,
    },
  });
  await prisma.helpThread.update({
    where: { id: thread.id },
    data: { updatedAt: new Date() },
  });

  revalidateHelpPaths({
    courseSlug: chapter.course.slug,
    chapterSlug: chapter.slug,
    threadId: thread.id,
  });

  return { ok: true, threadId: thread.id };
}

export async function replyToHelpThread(input: {
  threadId: string;
  body: string;
}): Promise<HelpActionResult> {
  const parsed = replyInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { user, thread } = await requireHelpThreadAccess(parsed.data.threadId);

  if (
    !canReplyToHelpThread(
      user,
      { menteeId: thread.menteeId, status: thread.status },
      thread.course
    )
  ) {
    return { ok: false, error: "This conversation is closed." };
  }

  await prisma.helpMessage.create({
    data: {
      threadId: thread.id,
      authorId: user.id,
      body: parsed.data.body,
    },
  });
  await prisma.helpThread.update({
    where: { id: thread.id },
    data: { updatedAt: new Date() },
  });

  revalidateHelpPaths({
    courseSlug: thread.course.slug,
    chapterSlug: thread.chapter?.slug,
    threadId: thread.id,
  });

  return { ok: true, threadId: thread.id };
}

export async function resolveHelpThread(input: { threadId: string }): Promise<HelpActionResult> {
  const parsed = resolveInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid thread." };
  }

  const { user, thread } = await requireHelpThreadAccess(parsed.data.threadId);

  if (!canResolveHelpThread(user, thread.course)) {
    return { ok: false, error: "Only the course mentor can resolve this thread." };
  }
  if (thread.status === "RESOLVED") {
    return { ok: true, threadId: thread.id };
  }

  await prisma.helpThread.update({
    where: { id: thread.id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  revalidateHelpPaths({
    courseSlug: thread.course.slug,
    chapterSlug: thread.chapter?.slug,
    threadId: thread.id,
  });

  return { ok: true, threadId: thread.id };
}
