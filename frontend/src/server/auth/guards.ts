import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "./session";
import {
  canAccessLearnSurface,
  canAccessRole,
  canAccessTeachSurface,
  homeRouteForRole,
  surfaceHomeRoute,
  userCanInstruct,
} from "./access-rules";
import { getActiveSurface } from "./surface";

export { getSessionUser } from "./session";
export type { SessionUser } from "./session";
export {
  canAccessLearnSurface,
  canAccessRole,
  canAccessTeachSurface,
  homeRouteForRole,
  isMentorOfCourse,
  surfaceHomeRoute,
  userCanInstruct,
} from "./access-rules";

// Where the web app decides which surface a visitor may enter — see
// docs/09-security.mdx. Ownership of courses, threads and enrollments is
// enforced by the API (403), so pages only need the session and surface checks.

/** Redirects to /login if there's no session. Use in layouts/pages/actions that require any signed-in user. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Signed-in user with a verified email — required for learner/instructor product surfaces. */
export async function requireVerifiedUser() {
  const user = await requireUser();
  // The API already activates seeded / no-email-delivery accounts on /auth/me.
  if (user.role !== "ADMIN" && !user.emailVerified) redirect("/verify-email");
  return user;
}

/** Redirects to that role's home if the signed-in user doesn't have one of `allowed`. */
export async function requireRole(...allowed: readonly ["MENTOR" | "MENTEE" | "ADMIN", ...("MENTOR" | "MENTEE" | "ADMIN")[]]) {
  const user = await requireUser();
  if (!canAccessRole(user.role, allowed)) {
    redirect(homeRouteForRole(user.role));
  }
  return user;
}

/** Learner workspace — any signed-in user except platform admin shell. */
export async function requireLearnSurface() {
  const user = await requireVerifiedUser();
  if (!canAccessLearnSurface(user)) {
    redirect("/admin");
  }
  const canInstruct = userCanInstruct(user);
  const surface = await getActiveSurface(canInstruct);
  if (surface !== "learn") {
    redirect(surfaceHomeRoute("teach"));
  }
  return user;
}

/** Instructor workspace — requires instructor capability and teach surface. */
export async function requireTeachSurface() {
  const user = await requireVerifiedUser();
  if (!canAccessTeachSurface(user)) {
    redirect(surfaceHomeRoute("learn"));
  }
  const canInstruct = userCanInstruct(user);
  const surface = await getActiveSurface(canInstruct);
  if (surface !== "teach") {
    redirect(surfaceHomeRoute("learn"));
  }
  return user;
}
