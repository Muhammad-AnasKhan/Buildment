import { renderEmailTemplate } from "../email/render.js";
import { randomBytes } from "node:crypto";
import { AUTH_ERROR_CODES } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
import { BadRequestError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { appBaseUrl, emailConfigured, sendEmail } from "../email/send.js";
import { linkLearnerProfileToUser } from "../enrollment/link-learner-profile.js";
import { logger } from "../../utils/logger.js";

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
  const verifyUrl = `${appBaseUrl()}/api/v1/auth/confirm-email?token=${encodeURIComponent(token)}`;
  const subject = "Verify your Buildment email";
  const html = await renderEmailTemplate("send-verification-email", { greeting: input.name ? ` ${input.name}` : "", url: verifyUrl });
  const text = `Hi ${input.name ?? "there"},\n\nWelcome to Buildment. Confirm your email address to finish setting up your account and start learning:\n${verifyUrl}\n\nThis link expires in 24 hours. If you did not create a Buildment account, you can ignore this email.`;

  const result = await sendEmail({
    to: input.email,
    subject,
    html,
    text,
  });

  if (!result.sent) {
    logger.info({ email: input.email, verifyUrl }, "[auth] verification link (email delivery disabled)");
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

/**
 * Send a fresh verification link. With an explicit email the answer is always
 * "sent" so the endpoint cannot be used to probe which addresses have accounts;
 * for the signed-in user it reports when there is nothing to verify.
 */
export async function resendVerification(input: { email?: string; user?: SessionUser }): Promise<{ sent: boolean }> {
  if (input.email) {
    const account = await prisma.user.findUnique({ where: { email: input.email } });
    if (account && !isEmailVerified(account.emailVerified)) {
      await sendVerificationEmail({ email: account.email, name: account.name });
    }
    return { sent: true };
  }

  if (!input.user) throw new BadRequestError("Enter the email you used to sign up.");
  const account = await prisma.user.findUnique({ where: { id: input.user.id } });
  if (!account) throw new BadRequestError("Account not found.");
  if (isEmailVerified(account.emailVerified)) {
    throw new BadRequestError("Your email is already verified.", AUTH_ERROR_CODES.ALREADY_VERIFIED);
  }
  await sendVerificationEmail({ email: account.email, name: account.name });
  return { sent: true };
}
