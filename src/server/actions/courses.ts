"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireTeachSurface } from "@/server/auth/guards";
import { slugify } from "@/lib/utils";
import { validateCoursePublish } from "@/server/courses/publish-rules";

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
  const user = await requireTeachSurface();
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

async function assertCourseOwner(
  user: { id: string; role: "MENTOR" | "MENTEE" | "ADMIN" },
  course: { mentorId: string }
): Promise<CourseActionResult | null> {
  if (user.role !== "ADMIN" && course.mentorId !== user.id) {
    return { ok: false, errors: ["You don't own this course."] };
  }
  return null;
}

async function revalidateCourseSlug(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  if (course) revalidatePath(`/courses/${course.slug}/edit`);
}

export async function publishCourse(input: {
  courseId: string;
}): Promise<CourseActionResult> {
  const user = await requireTeachSurface();
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: {
      id: true,
      slug: true,
      mentorId: true,
      status: true,
      pricingType: true,
      priceCents: true,
      _count: { select: { chapters: true } },
      chapters: { where: { publishedAt: { not: null } }, select: { id: true } },
    },
  });
  if (!course) return { ok: false, errors: ["Course not found."] };
  const ownerError = await assertCourseOwner(user, course);
  if (ownerError) return ownerError;
  if (course.status === "PUBLISHED") return { ok: true, courseSlug: course.slug };

  const publishErrors = validateCoursePublish({
    status: course.status,
    pricingType: course.pricingType,
    priceCents: course.priceCents,
    chapterCount: course._count.chapters,
    publishedChapterCount: course.chapters.length,
  });
  if (publishErrors.length > 0) return { ok: false, errors: publishErrors };

  await prisma.course.update({
    where: { id: course.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  await revalidateCourseSlug(course.id);
  return { ok: true, courseSlug: course.slug };
}

export async function unpublishCourse(input: {
  courseId: string;
  /** Required when mentees are enrolled — the UI collects this confirmation. */
  confirmedWithEnrollments?: boolean;
}): Promise<CourseActionResult> {
  const user = await requireTeachSurface();
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: {
      id: true,
      slug: true,
      mentorId: true,
      status: true,
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return { ok: false, errors: ["Course not found."] };
  const ownerError = await assertCourseOwner(user, course);
  if (ownerError) return ownerError;
  if (course.status !== "PUBLISHED") return { ok: true, courseSlug: course.slug };
  if (course._count.enrollments > 0 && !input.confirmedWithEnrollments) {
    return {
      ok: false,
      errors: [
        `${course._count.enrollments} learner(s) are enrolled. Confirm you want to archive this course.`,
      ],
    };
  }

  const nextStatus = course._count.enrollments > 0 ? "ARCHIVED" : "DRAFT";
  await prisma.course.update({
    where: { id: course.id },
    data: {
      status: nextStatus,
      ...(nextStatus === "DRAFT" ? { publishedAt: null } : {}),
    },
  });
  await revalidateCourseSlug(course.id);
  return { ok: true, courseSlug: course.slug };
}

/** Move an archived course back to draft for editing before re-publish. */
export async function restoreCourseToDraft(input: {
  courseId: string;
}): Promise<CourseActionResult> {
  const user = await requireTeachSurface();
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    select: { id: true, slug: true, mentorId: true, status: true },
  });
  if (!course) return { ok: false, errors: ["Course not found."] };
  const ownerError = await assertCourseOwner(user, course);
  if (ownerError) return ownerError;
  if (course.status !== "ARCHIVED") return { ok: true, courseSlug: course.slug };

  await prisma.course.update({
    where: { id: course.id },
    data: { status: "DRAFT", publishedAt: null },
  });
  await revalidateCourseSlug(course.id);
  return { ok: true, courseSlug: course.slug };
}
