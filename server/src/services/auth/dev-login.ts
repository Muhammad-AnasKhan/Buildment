import { randomBytes } from "node:crypto";
import { isSeedTestEmail } from "@buildment/shared/lib/seed-data";
import { safeRedirectTo } from "@buildment/shared/lib/safe-redirect";
import { prisma } from "../../db/prisma.js";
import { isProduction } from "../../config/env.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/errors.js";
import { homeRouteForRole } from "./access-rules.js";
import { ensureSeedTestUserVerified, shouldAutoVerifySeedTestUser } from "./seed-test-users.js";
import { createSession } from "./session.js";

// Dev-only shortcut to sign in as a seeded user without email delivery configured.
// Mints a real Session row, so every guard behaves exactly as after a real sign-in.
// Refused outside development/test so it can never ship as an auth bypass.
export async function createDevLoginSession(input: { email?: string; redirectTo?: string }) {
  if (isProduction) throw new NotFoundError();
  if (!input.email) throw new BadRequestError("?email= is required");
  if (!isSeedTestEmail(input.email)) {
    throw new ForbiddenError("Dev login is only for seeded test accounts");
  }

  let user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new NotFoundError(`No user with email ${input.email} — run pnpm db:seed first`);
  if (!user.emailVerified && shouldAutoVerifySeedTestUser(input.email)) {
    await ensureSeedTestUserVerified(input.email);
    user = await prisma.user.findUniqueOrThrow({ where: { email: input.email } });
  }

  const session = await createSession(user.id, randomBytes(32).toString("hex"));
  // Invites flow through /login?redirectTo=/invite/<token>; honour the same local-path-only target.
  const redirectTo = safeRedirectTo(input.redirectTo) ?? homeRouteForRole(user.role);
  return { ...session, redirectTo };
}
