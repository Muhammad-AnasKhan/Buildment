"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { isEmailVerified, sendVerificationEmail } from "@/server/auth/email-verification";

export async function resendVerificationEmailAction(
  formData?: FormData
): Promise<{ ok: boolean; message: string }> {
  const requestedEmail = String(formData?.get("email") ?? "").trim().toLowerCase();
  if (requestedEmail) {
    const dbUser = await prisma.user.findUnique({ where: { email: requestedEmail } });
    if (dbUser?.email && !isEmailVerified(dbUser.emailVerified)) {
      await sendVerificationEmail({ email: dbUser.email, name: dbUser.name });
    }
    return {
      ok: true,
      message: "If that account still needs verification, a new link is on its way.",
    };
  }

  const user = await getSessionUser();
  if (!user?.email) {
    return { ok: false, message: "Enter the email you used to sign up." };
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
