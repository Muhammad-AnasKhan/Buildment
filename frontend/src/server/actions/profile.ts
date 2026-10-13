"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireVerifiedUser } from "@/server/auth/guards";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1).max(64),
  skills: z.string().max(2000),
});

function parseSkills(raw: string): string[] {
  const parts = raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(parts)].slice(0, 30);
}

export type ProfileUpdateState = { ok: false; errors: string[] } | { ok: true };

export async function updateProfileAction(
  _prev: ProfileUpdateState | undefined,
  formData: FormData
): Promise<ProfileUpdateState> {
  const user = await requireVerifiedUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
    skills: formData.get("skills"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const skills = parseSkills(parsed.data.skills);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    }),
    prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        timezone: parsed.data.timezone,
        skills,
      },
      update: {
        timezone: parsed.data.timezone,
        skills,
      },
    }),
  ]);

  revalidatePath("/settings/profile");
  return { ok: true };
}
