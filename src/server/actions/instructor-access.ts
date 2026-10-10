"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireVerifiedUser, userCanInstruct } from "@/server/auth/guards";

const requestSchema = z.object({
  message: z.string().trim().max(500).optional(),
});

export async function requestInstructorAccessAction(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireVerifiedUser();
  if (userCanInstruct(user)) {
    return { ok: false, error: "You already have instructor access." };
  }
  if (user.role === "ADMIN") {
    return { ok: false, error: "Platform admins use the admin console." };
  }

  const parsed = requestSchema.safeParse({
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Could not submit request." };
  }

  const existing = await prisma.instructorAccessRequest.findUnique({
    where: { userId: user.id },
    select: { status: true },
  });
  if (existing?.status === "PENDING") {
    return { ok: false, error: "Your request is already pending review." };
  }

  await prisma.instructorAccessRequest.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: "PENDING",
      message: parsed.data.message ?? null,
    },
    update: {
      status: "PENDING",
      message: parsed.data.message ?? null,
      reviewedById: null,
      reviewedAt: null,
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
