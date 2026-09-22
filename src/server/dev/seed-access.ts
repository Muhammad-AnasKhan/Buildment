import "server-only";
import { isSeedTestEmail } from "@/lib/seed-data";

/** Local dev only: seed mentees/mentor can open any chapter and submit blocks without waiting on gating. */
export function bypassProgressGatingForEmail(email: string): boolean {
  return process.env.NODE_ENV !== "production" && isSeedTestEmail(email);
}
