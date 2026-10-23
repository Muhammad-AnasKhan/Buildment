import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";

/** Private margin note on a heading; an empty body removes it. */
export async function saveHeadingNote(user: SessionUser, input: { chapterId: string; headingId: string; body: string }) {
  const chapter = await prisma.chapter.findUnique({ where: { id: input.chapterId, archivedAt: null }, select: { id: true, courseId: true } });
  if (!chapter) throw new NotFoundError("Chapter not found.");
  await requireBlockSubmissionAccess(chapter.courseId, user);

  const body = input.body.trim();
  const where = { userId: user.id, chapterId: chapter.id, headingId: input.headingId };
  if (!body) {
    await prisma.headingNote.deleteMany({ where });
    return { deleted: true };
  }
  await prisma.headingNote.upsert({
    where: { userId_chapterId_headingId: where },
    create: { ...where, body },
    update: { body },
  });
  return { deleted: false };
}
