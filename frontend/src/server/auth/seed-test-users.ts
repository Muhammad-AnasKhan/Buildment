import "server-only";

import { prisma } from "@/server/db";
import { SEED_USERS } from "@/lib/seed-data";
import { hashPassword } from "@/server/auth/password";
import {
  isSeedTestEmail,
  SEED_DEV_PASSWORD,
  shouldAutoVerifySeedTestUser,
} from "@/lib/seed-test-users";

export { SEED_DEV_PASSWORD, shouldAutoVerifySeedTestUser };

export async function ensureSeedTestUserVerified(email: string): Promise<Date | null> {
  if (!isSeedTestEmail(email)) return null;
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
    select: { emailVerified: true },
  });
  return user.emailVerified;
}

export async function ensureAllSeedTestUsersReady() {
  const passwordHash = hashPassword(SEED_DEV_PASSWORD);
  await Promise.all(
    SEED_USERS.map((seed) => {
      const data: {
        emailVerified: Date;
        passwordHash: string;
        role: (typeof SEED_USERS)[number]["role"];
        canInstruct?: boolean;
      } = {
        emailVerified: new Date(),
        passwordHash,
        role: seed.role,
      };
      if (seed.role === "MENTOR") data.canInstruct = true;
      return prisma.user.upsert({
        where: { email: seed.email },
        update: data,
        create: {
          email: seed.email,
          name: seed.name,
          ...data,
        },
      });
    })
  );
}
