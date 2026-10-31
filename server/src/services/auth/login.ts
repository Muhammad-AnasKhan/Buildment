import { AUTH_ERROR_CODES } from "../../shared/api/auth.js";
import { prisma } from "../../db/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { linkLearnerProfileToUser } from "../enrollment/link-learner-profile.js";
import { verifyPassword } from "./password.js";
import {
  ensureUserEmailVerified,
  isEmailVerified,
  shouldAutoVerifyWithoutEmailDelivery,
} from "./email-verification.js";
import { ensureSeedTestUserVerified, shouldAutoVerifySeedTestUser } from "./seed-test-users.js";
import { createSession, deleteSession, toSessionUser, assertNotSuspended } from "./session.js";
import { assertMfaCode } from "./mfa.js";

/**
 * Unverified accounts are activated on the spot when email delivery is not
 * configured (local dev) or the account is a seeded test user; otherwise the
 * caller must verify first. Returns the possibly-updated user.
 */
export async function resolveVerificationState(user: SessionUser): Promise<SessionUser> {
  if (user.role === "ADMIN" || isEmailVerified(user.emailVerified)) return user;

  const verifiedAt = shouldAutoVerifySeedTestUser(user.email)
    ? await ensureSeedTestUserVerified(user.email)
    : shouldAutoVerifyWithoutEmailDelivery()
      ? await ensureUserEmailVerified(user.id)
      : null;

  return verifiedAt ? { ...user, emailVerified: verifiedAt } : user;
}

/** Password sign-in. Mints a session and attaches any pending organisation enrollments. */
export async function loginWithPassword(input: { email: string; password: string; code?: string }) {
  const record = await prisma.user.findUnique({ where: { email: input.email } });
  if (!record || !verifyPassword(input.password, record.passwordHash)) {
    throw new UnauthorizedError("Invalid email or password.", AUTH_ERROR_CODES.INVALID_CREDENTIALS);
  }
  assertNotSuspended(record);
  // MFA is checked before the verification gate, so an enabled account always proves possession.
  await assertMfaCode(record, input.code);

  const user = await resolveVerificationState(toSessionUser(record));
  if (user.role !== "ADMIN" && !isEmailVerified(user.emailVerified)) {
    throw new ForbiddenError("Verify your email before signing in.", AUTH_ERROR_CODES.EMAIL_UNVERIFIED);
  }

  return startSession(user);
}

/** Shared tail of every successful sign-in (password, magic link). */
export async function startSession(user: SessionUser) {
  await linkLearnerProfileToUser(prisma, user.id, user.email);
  const session = await createSession(user.id);
  return { user: { ...user, loginSessionId: session.loginSessionId }, session };
}

export async function logout(sessionToken: string) {
  await deleteSession(sessionToken);
}
