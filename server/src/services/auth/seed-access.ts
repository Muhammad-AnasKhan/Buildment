import { isSeedTestEmail } from "../../shared/lib/seed-data.js";
import { isProduction } from "../../config/env.js";

/** Local dev only: seed mentees/mentor can open any chapter and submit blocks without waiting on gating. */
export function bypassProgressGatingForEmail(email: string): boolean {
  return !isProduction && isSeedTestEmail(email);
}

/**
 * Sequential chapter locks are skipped for:
 * - local seed test emails (dev only), or
 * - accounts an admin marked as tester (still a normal learner otherwise).
 */
export function shouldBypassProgressGating(user: {
  email: string;
  testerEnabled?: boolean;
}): boolean {
  return Boolean(user.testerEnabled) || bypassProgressGatingForEmail(user.email);
}
