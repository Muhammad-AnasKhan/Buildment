import { isSeedTestEmail } from "@buildment/shared/lib/seed-data";
import { isProduction } from "../../config/env.js";

/** Local dev only: seed mentees/mentor can open any chapter and submit blocks without waiting on gating. */
export function bypassProgressGatingForEmail(email: string): boolean {
  return !isProduction && isSeedTestEmail(email);
}
