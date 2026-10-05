"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";

const input = z.object({
  chapterId: z.string().min(1),
  headingId: z.string().min(1).max(160),
  body: z.string().max(2000),
});

export async function saveHeadingNote(raw: { chapterId: string; headingId: string; body: string }) {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "That note could not be saved." };

  const chapter = await prisma.chapter.findUnique({
    where: { id: parsed.data.chapterId },
    select: { id: true, courseId: true, slug: true, course: { select: { slug: true } } },
  });
  if (!chapter) return { ok: false as const, error: "Chapter not found." };

  let userId: string;
  try {
    const access = await requireEnrolledMentee(chapter.courseId);
    userId = access.user.id;
  } catch {
    return { ok: false as const, error: "You are not enrolled in this course." };
  }

  const body = parsed.data.body.trim();
  if (!body) {
    await prisma.headingNote.deleteMany({
      where: { userId, chapterId: chapter.id, headingId: parsed.data.headingId },
    });
  } else {
    await prisma.headingNote.upsert({
      where: {
        userId_chapterId_headingId: {
          userId,
          chapterId: chapter.id,
          headingId: parsed.data.headingId,
        },
      },
      create: { userId, chapterId: chapter.id, headingId: parsed.data.headingId, body },
      update: { body },
    });
  }

  revalidatePath(`/courses/${chapter.course.slug}/${chapter.slug}`);
  return { ok: true as const };
}
