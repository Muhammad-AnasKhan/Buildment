"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";

export async function approveInstructorAccessRequestAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Missing request.");

  const request = await prisma.instructorAccessRequest.findUnique({
    where: { id: requestId },
    select: { id: true, userId: true, status: true, user: { select: { role: true } } },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already reviewed.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.userId },
      data: {
        canInstruct: true,
        ...(request.user.role !== "ADMIN" ? { role: "MENTOR" } : {}),
      },
    }),
    prisma.instructorAccessRequest.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

export async function rejectInstructorAccessRequestAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Missing request.");

  const request = await prisma.instructorAccessRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true },
  });
  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already reviewed.");
  }

  await prisma.instructorAccessRequest.update({
    where: { id: request.id },
    data: {
      status: "REJECTED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}
