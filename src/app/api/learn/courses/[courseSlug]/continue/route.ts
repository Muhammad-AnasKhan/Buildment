import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import {
  resolveContinueChapterPath,
  syllabusForEnrollment,
} from "@/server/progress/enrollment-syllabus";

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await context.params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      sequential: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
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

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { enrollment, user } = await requireEnrolledMentee(course.id);
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");

  const { flatChapters } = await syllabusForEnrollment(
    course,
    enrollment.id,
    bypassLocking
  );

  const href = resolveContinueChapterPath(course.slug, flatChapters);

  return NextResponse.json({ href });
}
