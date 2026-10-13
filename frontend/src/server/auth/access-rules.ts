import type { Role } from "@/generated/prisma/client";
import type { ActiveSurface } from "@/lib/active-surface";

// Pure authorization decisions, deliberately free of any Next.js/Auth.js/Prisma
// runtime imports so they're trivial to unit test — see guards.test.ts and
// guards.test.ts. `guards.ts` wraps these with the actual
// auth()/redirect()/database calls.

export function canAccessRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
}

export function normalizeUserCapabilities(user: { role: Role; canInstruct?: boolean }) {
  const canInstruct =
    user.canInstruct === true || user.role === "MENTOR" || user.role === "ADMIN";
  return { role: user.role, canInstruct };
}

/** Instructor capability (Buildment instructor tools), independent of Pathment mentor identity. */
export function userCanInstruct(user: { role: Role; canInstruct?: boolean }): boolean {
  return normalizeUserCapabilities(user).canInstruct;
}

export function canAccessLearnSurface(user: { role: Role }): boolean {
  return user.role !== "ADMIN";
}

export function canAccessTeachSurface(user: { role: Role; canInstruct: boolean }): boolean {
  if (user.role === "ADMIN") return true;
  return userCanInstruct(user);
}

export function surfaceHomeRoute(surface: ActiveSurface): string {
  return surface === "teach" ? "/workspace" : "/dashboard";
}

export function isMentorOfCourse(
  userId: string,
  userRole: Role,
  course: { mentorId: string }
): boolean {
  return userRole === "ADMIN" || course.mentorId === userId;
}

export function homeRouteForRole(role: Role): string {
  switch (role) {
    case "MENTOR":
      return "/workspace";
    case "ADMIN":
      return "/admin";
    case "MENTEE":
      return "/dashboard";
  }
}
