import type { CourseBuilderChapter, CourseBuilderView, CourseSlugResult } from "../../shared/api/teach.js";
import { TEACH_ERROR_CODES } from "../../shared/api/teach.js";
import { validateCoursePublish } from "../../shared/lib/course-publish-rules.js";
import { slugify } from "../../shared/lib/mdx-headings.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, UnprocessableError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import type { CourseSettingsBody, CreateCourseBody } from "../../validations/teach.js";
import { requireCourseById, requireCourseBySlug } from "./access.js";

// Course lifecycle: DRAFT → PUBLISHED → (ARCHIVED when learners exist | DRAFT when none).
// Publishing is the only transition with rules; see shared/lib/course-publish-rules.

const builderChapterSelect = {
  id: true,
  title: true,
  slug: true,
  order: true,
  publishedAt: true,
  estimatedMinutes: true,
  isMilestone: true,
  readerMode: true,
  blocks: { where: { archivedAt: null }, orderBy: { order: "asc" }, select: { type: true } },
} as const;

type BuilderChapterRow = { publishedAt: Date | null } & Omit<CourseBuilderChapter, "publishedAt">;

function toBuilderChapter(row: BuilderChapterRow): CourseBuilderChapter {
  return { ...row, publishedAt: row.publishedAt?.toISOString() ?? null };
}

/**
 * Creates a DRAFT course owned by the caller with a default first module, so
 * chapters always have a home (the reader walks modules → chapters).
 */
export async function createCourse(user: SessionUser, input: CreateCourseBody): Promise<CourseSlugResult> {
  const slug = await uniqueCourseSlug(slugify(input.title));
  const course = await prisma.course.create({
    data: {
      slug,
      title: input.title,
      description: input.description || null,
      mentorId: user.id,
      modules: { create: { title: "Part 1", order: 0 } },
    },
    select: { slug: true },
  });
  return { courseSlug: course.slug };
}

async function uniqueCourseSlug(base: string): Promise<string> {
  let slug = base;
  for (let suffix = 2; ; suffix += 1) {
    const taken = await prisma.course.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
    slug = `${base}-${suffix}`;
  }
}

/** Everything the course edit page shows: settings, modules with chapters, and loose chapters. */
export async function loadCourseBuilder(user: SessionUser, courseSlug: string): Promise<CourseBuilderView> {
  const owned = await requireCourseBySlug(user, courseSlug);
  const [course, looseChapters] = await Promise.all([
    prisma.course.findUniqueOrThrow({
      where: { id: owned.id },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverUrl: true,
        projectGoal: true,
        difficulty: true,
        estimatedHours: true,
        sequential: true,
        status: true,
        pricingType: true,
        priceCents: true,
        currency: true,
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true, chapters: { orderBy: { order: "asc" }, select: builderChapterSelect } },
        },
      },
    }),
    prisma.chapter.findMany({
      where: { courseId: owned.id, moduleId: null },
      orderBy: { order: "asc" },
      select: builderChapterSelect,
    }),
  ]);

  const { _count, modules, ...settings } = course;
  return {
    course: {
      ...settings,
      enrollmentCount: _count.enrollments,
      modules: modules.map((module) => ({ ...module, chapters: module.chapters.map(toBuilderChapter) })),
    },
    looseChapters: looseChapters.map(toBuilderChapter),
  };
}

export async function updateCourseSettings(user: SessionUser, courseId: string, input: CourseSettingsBody): Promise<void> {
  await requireCourseById(user, courseId);

  let priceCents = 0;
  if (input.pricingType === "PAID") {
    if (input.priceDollars === "") {
      throw new UnprocessableError("Enter a price for paid courses.", TEACH_ERROR_CODES.COURSE_NOT_PUBLISHABLE, ["Enter a price for paid courses."]);
    }
    priceCents = Math.round(input.priceDollars * 100);
    if (priceCents <= 0) {
      throw new UnprocessableError("Paid courses need a price greater than zero.", TEACH_ERROR_CODES.COURSE_NOT_PUBLISHABLE, ["Paid courses need a price greater than zero."]);
    }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: input.title,
      description: input.description || null,
      coverUrl: input.coverUrl || null,
      projectGoal: input.projectGoal || null,
      difficulty: input.difficulty || null,
      estimatedHours: input.estimatedHours === "" ? null : input.estimatedHours,
      sequential: input.sequential,
      pricingType: input.pricingType,
      priceCents,
      currency: input.currency.toUpperCase(),
    },
  });
}

export async function publishCourse(user: SessionUser, courseId: string): Promise<CourseSlugResult> {
  const owned = await requireCourseById(user, courseId);
  if (owned.status === "PUBLISHED") return { courseSlug: owned.slug };

  const course = await prisma.course.findUniqueOrThrow({
    where: { id: owned.id },
    select: {
      pricingType: true,
      priceCents: true,
      _count: { select: { chapters: true } },
      chapters: { where: { publishedAt: { not: null } }, select: { id: true } },
    },
  });
  const reasons = validateCoursePublish({
    status: owned.status,
    pricingType: course.pricingType,
    priceCents: course.priceCents,
    chapterCount: course._count.chapters,
    publishedChapterCount: course.chapters.length,
  });
  if (reasons.length > 0) {
    throw new UnprocessableError(reasons.join(" "), TEACH_ERROR_CODES.COURSE_NOT_PUBLISHABLE, reasons);
  }

  await prisma.course.update({ where: { id: owned.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  return { courseSlug: owned.slug };
}

/** Published → ARCHIVED when learners are enrolled (after confirmation), otherwise back to DRAFT. */
export async function unpublishCourse(
  user: SessionUser,
  courseId: string,
  options: { confirmedWithEnrollments?: boolean }
): Promise<CourseSlugResult> {
  const owned = await requireCourseById(user, courseId);
  if (owned.status !== "PUBLISHED") return { courseSlug: owned.slug };

  const enrollments = await prisma.enrollment.count({ where: { courseId: owned.id } });
  if (enrollments > 0 && !options.confirmedWithEnrollments) {
    throw new ConflictError(
      `${enrollments} learner(s) are enrolled. Confirm you want to archive this course.`,
      TEACH_ERROR_CODES.ENROLLMENTS_CONFIRMATION_REQUIRED
    );
  }

  const nextStatus = enrollments > 0 ? "ARCHIVED" : "DRAFT";
  await prisma.course.update({
    where: { id: owned.id },
    data: { status: nextStatus, ...(nextStatus === "DRAFT" ? { publishedAt: null } : {}) },
  });
  return { courseSlug: owned.slug };
}

/** Archived → DRAFT so the course can be edited and re-published. */
export async function restoreCourseToDraft(user: SessionUser, courseId: string): Promise<CourseSlugResult> {
  const owned = await requireCourseById(user, courseId);
  if (owned.status !== "ARCHIVED") return { courseSlug: owned.slug };
  await prisma.course.update({ where: { id: owned.id }, data: { status: "DRAFT", publishedAt: null } });
  return { courseSlug: owned.slug };
}

/**
 * Permanently deletes a course and everything under it (modules, chapters,
 * blocks, enrollments and learner history). Courses with learners need an
 * explicit confirmation flag.
 */
export async function deleteCourse(
  user: SessionUser,
  courseId: string,
  options: { confirmedWithEnrollments?: boolean }
): Promise<CourseSlugResult> {
  const owned = await requireCourseById(user, courseId);

  const enrollments = await prisma.enrollment.count({ where: { courseId: owned.id } });
  if (enrollments > 0 && !options.confirmedWithEnrollments) {
    throw new ConflictError(
      `${enrollments} learner(s) are enrolled. Deleting this course permanently removes their progress. Confirm you want to delete it.`,
      TEACH_ERROR_CODES.ENROLLMENTS_CONFIRMATION_REQUIRED
    );
  }

  await prisma.course.delete({ where: { id: owned.id } });
  return { courseSlug: owned.slug };
}
