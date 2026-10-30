import { AUTH_ERROR_CODES, type SignupResult } from "../../shared/api/auth.js";
import { isDisposable } from "@isdisposable/js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, UnprocessableError } from "../../utils/errors.js";
import { hashPassword } from "./password.js";
import {
  ensureUserEmailVerified,
  sendVerificationEmail,
  shouldAutoVerifyWithoutEmailDelivery,
} from "./email-verification.js";

export async function signup(input: { name: string; email: string; password: string }): Promise<SignupResult> {
  if (isDisposable(input.email)) {
    throw new UnprocessableError("Please use a non-disposable email address.", "DISPOSABLE_EMAIL");
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) {
    throw new ConflictError("An account with this email already exists. Sign in instead.", AUTH_ERROR_CODES.EMAIL_TAKEN);
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(input.password),
      role: "MENTEE",
      profile: { create: { timezone: "UTC", skills: [] } },
    },
  });

  if (shouldAutoVerifyWithoutEmailDelivery()) {
    await ensureUserEmailVerified(user.id);
    return { email: user.email, status: "verified" };
  }

  await sendVerificationEmail({ email: user.email, name: user.name });
  return { email: user.email, status: "verification_sent" };
}
