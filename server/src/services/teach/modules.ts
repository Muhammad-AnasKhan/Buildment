import { TEACH_ERROR_CODES } from "@buildment/shared/api/teach";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import type { MoveDirection } from "../../validations/teach.js";
import { requireCourseById } from "./access.js";

// Module order is unique per course (@@unique([courseId, order])), so appends
// and swaps run in serializable transactions and retry on write conflicts.

export async function createModule(user: SessionUser, courseId: string, title: string): Promise<{ moduleId: string }> {
  await requireCourseById(user, courseId);
  const created = await withSerializableRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const last = await tx.module.findFirst({ where: { courseId }, orderBy: { order: "desc" }, select: { order: true } });
        return tx.module.create({
          data: { courseId, title, order: (last?.order ?? -1) + 1 },
          select: { id: true },
        });
      },
      { isolationLevel: "Serializable" }
    )
  );
  return { moduleId: created.id };
}

async function requireModule(user: SessionUser, moduleId: string) {
  const courseModule = await prisma.module.findUnique({ where: { id: moduleId }, select: { id: true, courseId: true } });
  if (!courseModule) throw new NotFoundError("Module not found");
  await requireCourseById(user, courseModule.courseId);
  return courseModule;
}

export async function renameModule(user: SessionUser, moduleId: string, title: string): Promise<void> {
  const courseModule = await requireModule(user, moduleId);
  await prisma.module.update({ where: { id: courseModule.id }, data: { title } });
}

/** Swaps the module with its neighbour; 409 when it is already first/last. */
export async function moveModule(user: SessionUser, moduleId: string, direction: MoveDirection): Promise<void> {
  const courseModule = await requireModule(user, moduleId);

  const moved = await withSerializableRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const current = await tx.module.findUnique({ where: { id: courseModule.id }, select: { id: true, order: true } });
        if (!current) return false;

        const neighbor = await tx.module.findFirst({
          where: {
            courseId: courseModule.courseId,
            order: direction === "up" ? { lt: current.order } : { gt: current.order },
          },
          orderBy: { order: direction === "up" ? "desc" : "asc" },
          select: { id: true, order: true },
        });
        if (!neighbor) return false;

        const first = await tx.module.findFirst({ where: { courseId: courseModule.courseId }, orderBy: { order: "asc" }, select: { order: true } });
        // Park the module below every order value so the swap never collides with the unique index.
        const parked = (first?.order ?? 0) - 1;
        await tx.module.update({ where: { id: current.id }, data: { order: parked } });
        await tx.module.update({ where: { id: neighbor.id }, data: { order: current.order } });
        await tx.module.update({ where: { id: current.id }, data: { order: neighbor.order } });
        return true;
      },
      { isolationLevel: "Serializable" }
    )
  );

  if (!moved) throw new ConflictError("Module is already at the edge.", TEACH_ERROR_CODES.ALREADY_AT_EDGE);
}

export async function withSerializableRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === 2) throw error;
    }
  }
}

function isRetryableTransactionError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code: unknown }).code === "P2034" || (error as { code: unknown }).code === "40001")
  );
}
