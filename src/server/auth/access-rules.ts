import type { Role } from "@/generated/prisma/client";

// Pure authorization decisions, deliberately free of any Next.js/Auth.js/Prisma
// runtime imports so they're trivial to unit test — see guards.test.ts and
// .cursor/rules/testing.mdc. `guards.ts` wraps these with the actual
// auth()/redirect()/database calls.

export function canAccessRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
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
      return "/courses";
    case "ADMIN":
      return "/admin";
    case "MENTEE":
      return "/dashboard";
  }
}
