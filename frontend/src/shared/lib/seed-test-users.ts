// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import { isSeedTestEmail } from "./seed-data";

/** Known dev password for seeded accounts (login form + credentials provider). */
export const SEED_DEV_PASSWORD = "buildment-dev";

export function shouldAutoVerifySeedTestUser(email: string | null | undefined): boolean {
  return process.env.NODE_ENV !== "production" && Boolean(email && isSeedTestEmail(email));
}

export { isSeedTestEmail } from "./seed-data";
