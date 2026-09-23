"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";

export type CourseBuilderActionResult =
  | { ok: true }
  | { ok: false; errors: string[] };

const courseIdSchema = z.string().min(1);
const moduleTitleSchema = z.string().trim().min(1).max(120);

const createModuleSchema = z.object({
  courseId: courseIdSchema,
  title: moduleTitleSchema,
});

export async function createModule(input: {
  courseId: string;
  title: string;
}): Promise<CourseBuilderActionResult> {
  const parsed = createModuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: ["Enter a module title between 1 and 120 characters."] };
  }

  await requireMentorOfCourse(parsed.data.courseId);

  try {
    await withSerializableRetry(async () => {
      await prisma.$transaction(
        async (tx) => {
          const lastModule = await tx.module.findFirst({
            where: { courseId: parsed.data.courseId },
            orderBy: { order: "desc" },
            select: { order: true },
          });
          await tx.module.create({
            data: {
              courseId: parsed.data.courseId,
              title: parsed.data.title,
              order: (lastModule?.order ?? -1) + 1,
            },
          });
        },
        { isolationLevel: "Serializable" }
      );
    });
  } catch {
    return { ok: false, errors: ["The module could not be created. Please try again."] };
  }

  await revalidateCourseBuilder(parsed.data.courseId);
  return { ok: true };
}

const renameModuleSchema = z.object({
  moduleId: z.string().min(1),
  title: moduleTitleSchema,
});

export async function renameModule(input: {
  moduleId: string;
  title: string;
}): Promise<CourseBuilderActionResult> {
  const parsed = renameModuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: ["Enter a module title between 1 and 120 characters."] };
  }

  const courseModule = await prisma.module.findUnique({
    where: { id: parsed.data.moduleId },
    select: { id: true, courseId: true },
  });
  if (!courseModule) return { ok: false, errors: ["Module not found."] };
  await requireMentorOfCourse(courseModule.courseId);

  await prisma.module.update({
    where: { id: courseModule.id },
    data: { title: parsed.data.title },
  });
  await revalidateCourseBuilder(courseModule.courseId);
  return { ok: true };
}

const moveModuleSchema = z.object({
  moduleId: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export async function moveModule(input: {
  moduleId: string;
  direction: "up" | "down";
}): Promise<CourseBuilderActionResult> {
  const parsed = moveModuleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Invalid move request."] };

  const courseModule = await prisma.module.findUnique({
    where: { id: parsed.data.moduleId },
    select: { id: true, courseId: true },
  });
  if (!courseModule) return { ok: false, errors: ["Module not found."] };
  await requireMentorOfCourse(courseModule.courseId);

  let moved = false;
  try {
    await withSerializableRetry(async () => {
      await prisma.$transaction(
        async (tx) => {
          const current = await tx.module.findUnique({
            where: { id: courseModule.id },
            select: { id: true, order: true },
          });
          if (!current) return;

          const neighbor = await tx.module.findFirst({
            where: {
              courseId: courseModule.courseId,
              order:
                parsed.data.direction === "up"
                  ? { lt: current.order }
                  : { gt: current.order },
            },
            orderBy: { order: parsed.data.direction === "up" ? "desc" : "asc" },
            select: { id: true, order: true },
          });
          if (!neighbor) return;

          const first = await tx.module.findFirst({
            where: { courseId: courseModule.courseId },
            orderBy: { order: "asc" },
            select: { order: true },
          });
          const temporaryOrder = (first?.order ?? 0) - 1;

          // The temporary slot avoids violating @@unique([courseId, order]) while swapping.
          await tx.module.update({
            where: { id: current.id },
            data: { order: temporaryOrder },
          });
          await tx.module.update({
            where: { id: neighbor.id },
            data: { order: current.order },
          });
          await tx.module.update({
            where: { id: current.id },
            data: { order: neighbor.order },
          });
          moved = true;
        },
        { isolationLevel: "Serializable" }
      );
    });
  } catch {
    return { ok: false, errors: ["The module could not be moved. Please try again."] };
  }

  if (!moved) return { ok: false, errors: ["Module is already at the edge."] };
  await revalidateCourseBuilder(courseModule.courseId);
  return { ok: true };
}

const courseSettingsSchema = z.object({
  courseId: courseIdSchema,
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500),
  projectGoal: z.string().trim().max(240),
  difficulty: z.enum(["", "Easy", "Medium", "Hard"]),
  estimatedHours: z.union([z.literal(""), z.coerce.number().int().min(1).max(1000)]),
  sequential: z.boolean(),
});

export async function updateCourseSettings(input: {
  courseId: string;
  title: string;
  description: string;
  projectGoal: string;
  difficulty: string;
  estimatedHours: string;
  sequential: boolean;
}): Promise<CourseBuilderActionResult> {
  const parsed = courseSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: ["Check the title, difficulty, description, goal, and estimated hours."],
    };
  }

  await requireMentorOfCourse(parsed.data.courseId);
  await prisma.course.update({
    where: { id: parsed.data.courseId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      projectGoal: parsed.data.projectGoal || null,
      difficulty: parsed.data.difficulty || null,
      estimatedHours:
        parsed.data.estimatedHours === "" ? null : parsed.data.estimatedHours,
      sequential: parsed.data.sequential,
    },
  });
  await revalidateCourseBuilder(parsed.data.courseId);
  return { ok: true };
}

async function revalidateCourseBuilder(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  if (course) revalidatePath(`/courses/${course.slug}/edit`);
}

async function withSerializableRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === 2) throw error;
    }
  }
  throw new Error("Transaction retry exhausted.");
}

function isRetryableTransactionError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "P2034" || error.code === "40001")
  );
}
