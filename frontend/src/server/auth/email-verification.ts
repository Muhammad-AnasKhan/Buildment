import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/server/db";
import { appBaseUrl, emailConfigured, sendEmail } from "@/server/email/send";
import { linkLearnerProfileToUser } from "@/server/enrollment/link-learner-profile";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFY_TTL_MS);
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });
  return token;
}

export async function sendVerificationEmail(input: {
  email: string;
  name?: string | null;
}): Promise<{ sent: boolean; verifyUrl: string }> {
  const token = await createEmailVerificationToken(input.email);
  const verifyUrl = `${appBaseUrl()}/api/auth/confirm-email?token=${encodeURIComponent(token)}`;
  const subject = "Verify your Buildment email";
  const html = `<p>Hi${input.name ? ` ${input.name}` : ""},</p><p>Confirm your email to start learning on Buildment.</p><p><a href="${verifyUrl}">Verify email</a></p><p>This link expires in 24 hours.</p>`;
  const text = `Verify your Buildment email: ${verifyUrl}`;

  const result = await sendEmail({
    to: input.email,
    subject,
    html,
    text,
  });

  if (!result.sent) {
    console.info(`[auth] Verification link for ${input.email}: ${verifyUrl}`);
  }

  return { sent: result.sent, verifyUrl };
}

export type ConfirmEmailResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

export async function confirmEmailVerificationToken(token: string): Promise<ConfirmEmailResult> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.expires <= new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return { ok: false, reason: "expired" };
  }

  const user = await prisma.user.findUnique({ where: { email: row.identifier } });
  if (!user) return { ok: false, reason: "invalid" };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    await tx.verificationToken.delete({ where: { token } });
  });

  await linkLearnerProfileToUser(prisma, user.id, user.email);

  return { ok: true, email: user.email };
}

/** Auth.js sessions often carry ISO strings — not only `Date` instances from Prisma. */
export function isEmailVerified(emailVerified: Date | string | null | undefined): boolean {
  if (emailVerified == null) return false;
  if (emailVerified instanceof Date) return !Number.isNaN(emailVerified.getTime());
  if (typeof emailVerified === "string" && emailVerified.trim()) {
    return !Number.isNaN(new Date(emailVerified).getTime());
  }
  return false;
}

/** When Resend is not configured, skip the verify-email gate (typical local dev). */
export function shouldAutoVerifyWithoutEmailDelivery(): boolean {
  return !emailConfigured();
}

export async function ensureUserEmailVerified(userId: string): Promise<Date | null> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
    select: { emailVerified: true },
  });
  return user.emailVerified;
}

/** Prefer DB when the session cookie still has a stale `emailVerified` value. */
export async function resolveEmailVerifiedForUser(user: {
  id: string;
  emailVerified: Date | string | null | undefined;
}): Promise<Date | null> {
  if (isEmailVerified(user.emailVerified)) {
    const verified = user.emailVerified;
    return verified instanceof Date ? verified : new Date(verified as string);
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true },
  });
  if (dbUser && isEmailVerified(dbUser.emailVerified)) {
    return dbUser.emailVerified;
  }
  return null;
}
