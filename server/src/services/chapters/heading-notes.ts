import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { releaseContainsChapter } from "../courses/releases.js";
import { ensureChapterStarted } from "../progress/compute.js";

/** Private margin note on a heading; an empty body removes it. */
export async function saveHeadingNote(user: SessionUser, input: { chapterId: string; headingId: string; body: string }) {
  const chapter = await prisma.chapter.findUnique({ where: { id: input.chapterId, archivedAt: null }, select: { id: true, courseId: true, course: { select: { familySlug: true } } } });
  if (!chapter) throw new NotFoundError("Chapter not found.");
  const enrollment = await requireBlockSubmissionAccess(chapter.courseId, user);
  if (!(await releaseContainsChapter(chapter.courseId, enrollment, chapter.course.familySlug, chapter.id))) throw new NotFoundError("Chapter not found.");

  const body = input.body.trim();
  const where = { userId: user.id, chapterId: chapter.id, headingId: input.headingId };
  if (!body) {
    await prisma.headingNote.deleteMany({ where });
    return { deleted: true };
  }
  await prisma.$transaction(async tx => {
    await ensureChapterStarted(tx, enrollment.id, chapter.id);
    await tx.headingNote.upsert({
      where: { userId_chapterId_headingId: where },
      create: { ...where, body },
      update: { body },
    });
  });
  return { deleted: false };
}
