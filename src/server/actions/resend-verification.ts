"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { isEmailVerified, sendVerificationEmail } from "@/server/auth/email-verification";

export async function resendVerificationEmailAction(): Promise<{ ok: boolean; message: string }> {
  const user = await getSessionUser();
  if (!user?.email) {
    return { ok: false, message: "Sign in first." };
  }
  if (isEmailVerified(user.emailVerified)) {
    return { ok: false, message: "Your email is already verified." };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.email) {
    return { ok: false, message: "Account not found." };
  }
  if (isEmailVerified(dbUser.emailVerified)) {
    return { ok: false, message: "Your email is already verified." };
  }

  await sendVerificationEmail({ email: dbUser.email, name: dbUser.name });
  return { ok: true, message: "Verification email sent. Check your inbox." };
}
