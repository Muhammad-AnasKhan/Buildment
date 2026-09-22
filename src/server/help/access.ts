import type { Role } from "@/generated/prisma/client";
import { isMentorOfCourse } from "@/server/auth/access-rules";

export function canAccessHelpThread(
  user: { id: string; role: Role },
  thread: { menteeId: string },
  course: { mentorId: string }
): boolean {
  if (thread.menteeId === user.id) return true;
  return isMentorOfCourse(user.id, user.role, course);
}

export function canReplyToHelpThread(
  user: { id: string; role: Role },
  thread: { menteeId: string; status: "OPEN" | "RESOLVED" },
  course: { mentorId: string }
): boolean {
  if (thread.status !== "OPEN") return false;
  if (thread.menteeId === user.id) return true;
  return isMentorOfCourse(user.id, user.role, course);
}

export function canResolveHelpThread(
  user: { id: string; role: Role },
  course: { mentorId: string }
): boolean {
  return isMentorOfCourse(user.id, user.role, course);
}
