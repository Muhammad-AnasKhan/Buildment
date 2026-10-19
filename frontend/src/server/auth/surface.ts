import "server-only";
import type { Role } from "@/shared/domain/enums";
import { canAccessTeachSurface } from "./access-rules";
import { cookies } from "next/headers";
import {
  ACTIVE_SURFACE_COOKIE,
  defaultSurfaceForUser,
  isActiveSurface,
  type ActiveSurface,
} from "@/shared/lib/active-surface";

export async function getActiveSurface(role: Role): Promise<ActiveSurface> {
  const jar = await cookies();
  const raw = jar.get(ACTIVE_SURFACE_COOKIE)?.value;
  if (isActiveSurface(raw)) {
    if (raw === "teach" && !canAccessTeachSurface({ role })) return "learn";
    return raw;
  }
  return defaultSurfaceForUser(role);
}

export async function setActiveSurfaceCookie(surface: ActiveSurface) {
  const jar = await cookies();
  jar.set(ACTIVE_SURFACE_COOKIE, surface, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
