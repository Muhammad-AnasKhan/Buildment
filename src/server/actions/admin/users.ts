"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/guards";

export async function setUserInstructorAccessAction(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const userId = String(formData.get("userId") ?? "");
  const enabled = formData.get("canInstruct") === "true";
  if (!userId) throw new Error("Missing user.");

  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!existing) throw new Error("User not found.");

  await prisma.user.update({
    where: { id: userId },
    data: {
      canInstruct: enabled,
      ...(enabled && existing.role !== "ADMIN" ? { role: "MENTOR" } : {}),
    },
  });

  revalidatePath("/admin/users");
}

const inviteInstructorSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(120).optional(),
});

/** Grant instructor tools to an existing user by email (admin invite). */
export async function grantInstructorByEmailAction(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const parsed = inviteInstructorSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) {
    throw new Error("Enter a valid email.");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: parsed.data.name ?? email.split("@")[0],
      role: "MENTOR",
      canInstruct: true,
      emailVerified: new Date(),
    },
    update: {
      canInstruct: true,
      ...(existing?.role === "ADMIN" ? {} : { role: "MENTOR" }),
    },
  });

  revalidatePath("/admin/users");
}
