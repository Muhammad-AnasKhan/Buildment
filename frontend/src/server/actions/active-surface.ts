"use server";

import { redirect } from "next/navigation";
import { type ActiveSurface, isActiveSurface } from "@/lib/active-surface";
import { requireVerifiedUser, userCanInstruct } from "@/server/auth/guards";
import { canAccessTeachSurface, surfaceHomeRoute } from "@/server/auth/access-rules";
import { setActiveSurfaceCookie } from "@/server/auth/surface";

export async function setActiveSurfaceAction(surface: ActiveSurface) {
  if (!isActiveSurface(surface)) {
    throw new Error("Invalid surface");
  }
  const user = await requireVerifiedUser();
  if (surface === "teach" && !canAccessTeachSurface({ role: user.role, canInstruct: userCanInstruct(user) })) {
    redirect(surfaceHomeRoute("learn"));
  }
  await setActiveSurfaceCookie(surface);
  redirect(surfaceHomeRoute(surface));
}
