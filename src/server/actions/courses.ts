"use server";

import { z } from "zod";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";
import { slugify } from "@/lib/utils";

export type CourseActionResult =
  | { ok: true; courseSlug: string }
  | { ok: false; errors: string[] };

const createCourseInput = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
});

/**
 * Creates a DRAFT course owned by the signed-in mentor, with a default first
 * module so chapters created in M1 always have a home (the reader walks
 * modules -> chapters; moduleless chapters would be invisible to learners).
 */
export async function createCourse(input: {
  title: string;
  description?: string;
}): Promise<CourseActionResult> {
  const user = await requireRole("MENTOR", "ADMIN");
  const parsed = createCourseInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: ["A title of at least 3 characters is required."] };
  }

  const slug = await uniqueCourseSlug(slugify(parsed.data.title));
  const course = await prisma.course.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description || null,
      mentorId: user.id,
      modules: {
        create: { title: "Part 1", order: 0 },
      },
    },
  });
  return { ok: true, courseSlug: course.slug };
}

async function uniqueCourseSlug(base: string): Promise<string> {
  let slug = base;
  for (let suffix = 2; ; suffix += 1) {
    const taken = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!taken) return slug;
    slug = `${base}-${suffix}`;
  }
}
