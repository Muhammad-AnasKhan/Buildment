import { HELP_ERROR_CODES, type HelpThreadDetail, type HelpThreadSummary } from "../../shared/api/help.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { bypassProgressGatingForEmail } from "../auth/seed-access.js";
import { notifyMenteeHelpReply, notifyMenteeHelpThreadResolved, notifyMentorHelpQuestion } from "../email/event-notifications.js";
import { queueEmail } from "../email/queue.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { mentorReplyUnread } from "../progress/attention.js";
import { ChapterLockedError, assertChapterUnlocked } from "../progress/gate.js";
import { canAccessHelpThread, canReplyToHelpThread, canResolveHelpThread } from "./access.js";
import { mapHelpMessages } from "./serialize.js";

const messageInclude = {
  orderBy: { createdAt: "asc" },
  include: { author: { select: { id: true, name: true, role: true } } },
} as const;

export async function listMenteeThreads(user: SessionUser): Promise<HelpThreadSummary[]> {
  const threads = await prisma.helpThread.findMany({
    where: { menteeId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      course: { select: { slug: true, title: true } },
      chapter: { select: { slug: true, title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, authorId: true } },
    },
  });

  const firstMessages = threads.length
    ? await prisma.helpMessage.findMany({
        where: { threadId: { in: threads.map((thread) => thread.id) } },
        orderBy: { createdAt: "asc" },
        distinct: ["threadId"],
        select: { threadId: true, body: true },
      })
    : [];
  const questionsByThread = new Map(firstMessages.map((message) => [message.threadId, message.body]));

  return threads.map((thread) => {
    const preview = thread.messages[0] ?? null;
    return {
      id: thread.id,
      status: thread.status,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
      course: thread.course,
      chapter: thread.chapter,
      question: questionsByThread.get(thread.id) ?? null,
      preview: preview ? { body: preview.body, createdAt: preview.createdAt.toISOString(), fromMentor: preview.authorId !== user.id } : null,
      unread: mentorReplyUnread({
        menteeId: user.id,
        menteeLastReadAt: thread.menteeLastReadAt,
        latestMessage: preview ? { authorId: preview.authorId, createdAt: preview.createdAt } : null,
      }),
    };
  });
}

/** Thread with its course for authorization decisions; 404 when missing, 403 when not the mentee or course mentor. */
async function loadAccessibleThread(threadId: string, user: SessionUser) {
  const thread = await prisma.helpThread.findUnique({
    where: { id: threadId },
    include: {
      course: { select: { id: true, slug: true, title: true, mentorId: true } },
      chapter: { select: { id: true, slug: true, title: true } },
      mentee: { select: { id: true, name: true, email: true } },
    },
  });
  if (!thread) throw new NotFoundError("Thread not found");
  if (!canAccessHelpThread(user, thread, thread.course)) {
    throw new ForbiddenError("You cannot access this conversation.");
  }
  return thread;
}

/** Opening a thread as its mentee marks the mentor's replies as read. */
export async function getThread(threadId: string, user: SessionUser): Promise<HelpThreadDetail> {
  const thread = await loadAccessibleThread(threadId, user);
  const messages = await prisma.helpMessage.findMany({ where: { threadId: thread.id }, ...messageInclude });

  if (user.id === thread.menteeId) {
    await prisma.helpThread.update({ where: { id: thread.id }, data: { menteeLastReadAt: new Date() } });
  }

  return {
    id: thread.id,
    status: thread.status,
    courseId: thread.courseId,
    chapterId: thread.chapterId,
    menteeId: thread.menteeId,
    mentee: thread.mentee,
    course: { slug: thread.course.slug, title: thread.course.title },
    chapter: thread.chapter ? { slug: thread.chapter.slug, title: thread.chapter.title } : null,
    messages: mapHelpMessages(messages),
  };
}

/** Mentee asks from a chapter — creates a thread or adds to the open one for this chapter. */
export async function askFromChapter(user: SessionUser, input: { courseId: string; chapterId: string; body: string }) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: input.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter || chapter.courseId !== input.courseId) throw new NotFoundError("Chapter not found.");

  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);

  const existingOpen = await prisma.helpThread.findFirst({
    where: { menteeId: user.id, chapterId: chapter.id, status: "OPEN" },
    select: { id: true },
  });

  if (!existingOpen) {
    try {
      await assertChapterUnlocked({
        courseId: chapter.courseId,
        enrollmentId: enrollment.id,
        chapterId: chapter.id,
        bypassLocking: bypassProgressGatingForEmail(user.email),
      });
    } catch (error) {
      if (error instanceof ChapterLockedError) {
        throw new ForbiddenError("Finish the previous chapter before asking for help here.", HELP_ERROR_CODES.CHAPTER_LOCKED);
      }
      throw error;
    }
  }

  const thread =
    existingOpen ??
    (await prisma.helpThread.create({
      data: { courseId: chapter.courseId, chapterId: chapter.id, menteeId: user.id },
      select: { id: true },
    }));

  await appendMessage(thread.id, user.id, input.body);
  queueEmail(() => notifyMentorHelpQuestion({ threadId: thread.id, body: input.body, menteeName: user.name }));

  return { threadId: thread.id, created: !existingOpen };
}

export async function reply(user: SessionUser, threadId: string, body: string) {
  const thread = await loadAccessibleThread(threadId, user);
  if (!canReplyToHelpThread(user, { menteeId: thread.menteeId, status: thread.status }, thread.course)) {
    throw new ConflictError("This conversation is closed.", HELP_ERROR_CODES.THREAD_CLOSED);
  }

  await appendMessage(thread.id, user.id, body);

  if (user.id === thread.menteeId) {
    queueEmail(() => notifyMentorHelpQuestion({ threadId: thread.id, body, menteeName: user.name }));
  } else {
    queueEmail(() => notifyMenteeHelpReply({ threadId: thread.id, body, mentorName: user.name }));
  }
  return { threadId: thread.id };
}

export async function resolve(user: SessionUser, threadId: string) {
  const thread = await loadAccessibleThread(threadId, user);
  if (!canResolveHelpThread(user, thread.course)) {
    throw new ForbiddenError("Only the course mentor can resolve this thread.");
  }
  if (thread.status === "RESOLVED") return { threadId: thread.id, alreadyResolved: true };

  await prisma.helpThread.update({ where: { id: thread.id }, data: { status: "RESOLVED", resolvedAt: new Date() } });
  queueEmail(() => notifyMenteeHelpThreadResolved(thread.id));
  return { threadId: thread.id, alreadyResolved: false };
}

async function appendMessage(threadId: string, authorId: string, body: string) {
  await prisma.helpMessage.create({ data: { threadId, authorId, body } });
  await prisma.helpThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
}

/** Latest help thread for this mentee + chapter (open or resolved), for the chapter reader. */
export async function loadChapterThread(menteeId: string, chapterId: string) {
  return prisma.helpThread.findFirst({
    where: { menteeId, chapterId },
    orderBy: { updatedAt: "desc" },
    include: { messages: messageInclude },
  });
}
