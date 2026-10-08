"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";

async function requireAdmin() {
  return requireRole("ADMIN");
}

const reviewSchema = z.object({
  requestId: z.string().min(1),
  maxEnrollments: z.coerce.number().int().min(1).max(1_000_000),
  expiresAt: z.string().optional(),
});

export async function approveOrganizationCourseRequestAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = reviewSchema.safeParse({
    requestId: formData.get("requestId"),
    maxEnrollments: formData.get("maxEnrollments"),
    expiresAt: String(formData.get("expiresAt") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    throw new Error("Invalid approval input.");
  }

  const request = await prisma.organizationCourseRequest.findUnique({
    where: { id: parsed.data.requestId },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already reviewed.");
  }

  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new Error("Invalid expiry date.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.organizationCourseRequest.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    });
    await tx.organizationCourse.upsert({
      where: {
        organizationId_courseId: {
          organizationId: request.organizationId,
          courseId: request.courseId,
        },
      },
      create: {
        organizationId: request.organizationId,
        courseId: request.courseId,
        maxEnrollments: parsed.data.maxEnrollments,
        isAllowed: true,
        expiresAt,
      },
      update: {
        maxEnrollments: parsed.data.maxEnrollments,
        isAllowed: true,
        expiresAt,
      },
    });
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/organizations/${request.organizationId}`);
}

export async function rejectOrganizationCourseRequestAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Missing request id.");

  const request = await prisma.organizationCourseRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already reviewed.");
  }

  await prisma.organizationCourseRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  revalidatePath("/admin/requests");
}
