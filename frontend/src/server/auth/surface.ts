import "server-only";
import { cookies } from "next/headers";
import {
  ACTIVE_SURFACE_COOKIE,
  defaultSurfaceForUser,
  isActiveSurface,
  type ActiveSurface,
} from "@/lib/active-surface";

export async function getActiveSurface(canInstruct: boolean): Promise<ActiveSurface> {
  const jar = await cookies();
  const raw = jar.get(ACTIVE_SURFACE_COOKIE)?.value;
  if (isActiveSurface(raw)) {
    if (raw === "teach" && !canInstruct) return "learn";
    return raw;
  }
  return defaultSurfaceForUser(canInstruct);
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
