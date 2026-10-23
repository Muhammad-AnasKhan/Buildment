import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { requireBlockSubmissionAccess } from "../enrollment/api-learn-access.js";
import { bypassProgressGatingForEmail } from "../auth/seed-access.js";
import { resolveContinueChapterPath, syllabusForEnrollment } from "../progress/enrollment-syllabus.js";
import { releaseForEnrollment, releaseModulesWithBlocks } from "./releases.js";

/** Path of the chapter the learner should open next in this course (`null` when done). */
export async function continueChapterPath(input: {
  courseSlug: string;
  user: SessionUser | undefined;
}): Promise<{ href: string | null }> {
  const course = await prisma.course.findUnique({
    where: { slug: input.courseSlug },
    select: {
      id: true,
      slug: true,
      sequential: true,
      familySlug: true,
      modules: {
        where: { archivedAt: null },
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
            where: { archivedAt: null, publishedAt: { not: null } },
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              order: true,
              blocks: {
                where: { archivedAt: null },
                select: { type: true, required: true, archivedAt: true },
              },
            },
          },
        },
      },
    },
  });
  if (!course) throw new NotFoundError("Course not found");

  const enrollment = await requireBlockSubmissionAccess(course.id, input.user);
  const bypassLocking = bypassProgressGatingForEmail(input.user!.email);

  const selected = await releaseForEnrollment(course.id, enrollment, course.familySlug);
  const modules = selected ? await releaseModulesWithBlocks(selected.modules) : course.modules;
  const { flatChapters } = await syllabusForEnrollment({ ...course, modules }, enrollment.id, bypassLocking);
  return { href: resolveContinueChapterPath(course.slug, flatChapters) };
}
