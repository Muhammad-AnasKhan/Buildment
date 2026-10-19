// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { Role } from "../domain/enums";

/** Which workspace the user is browsing — learner vs instructor (Udemy-style switch). */
export type ActiveSurface = "learn" | "teach";

export const ACTIVE_SURFACE_COOKIE = "buildment-surface";

export function isActiveSurface(value: string | undefined): value is ActiveSurface {
  return value === "learn" || value === "teach";
}

export function defaultSurfaceForUser(role: Role): ActiveSurface {
  return role === "MENTOR" || role === "ADMIN" ? "teach" : "learn";
}
