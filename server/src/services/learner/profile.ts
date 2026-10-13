import type { LearnerProfile, ProfileUpdateInput } from "../../shared/api/learner.js";
import { prisma } from "../../db/prisma.js";
import type { SessionUser } from "../../types/auth.js";

export async function loadProfile(user: SessionUser): Promise<LearnerProfile> {
  const [profile, featured] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.enrollment.findFirst({
      where: { userId: user.id, status: { not: "DROPPED" } },
      orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }],
      select: { course: { select: { title: true, coverUrl: true } } },
    }),
  ]);
  return {
    name: user.name,
    email: user.email,
    image: user.image,
    timezone: profile?.timezone ?? "UTC",
    skills: profile?.skills ?? [],
    featuredCourse: featured?.course ?? null,
  };
}

export async function updateProfile(user: SessionUser, input: ProfileUpdateInput): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: input.name } }),
    prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, timezone: input.timezone, skills: input.skills },
      update: { timezone: input.timezone, skills: input.skills },
    }),
  ]);
}
