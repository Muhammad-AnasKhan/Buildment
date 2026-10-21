"use server";

import { revalidatePath } from "next/cache";
import type { CourseInstructorInviteAcceptance, CourseInstructorInviteResult } from "@/shared/api/teach";
import { teachCall } from "./teach-call";

export async function inviteCourseInstructor(input: { courseId: string; courseSlug: string; email: string; role: "COURSE_CREATOR" | "SUBMISSION_EVALUATOR" }) {
  const result = await teachCall<CourseInstructorInviteResult>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/instructor-invites`, {
    method: "POST", json: { email: input.email, role: input.role },
  });
  if (!result.ok) return result;
  revalidatePath(`/courses/${input.courseSlug}/edit`);
  revalidatePath(`/courses/${input.courseSlug}/settings`);
  return { ok: true as const, ...result.data };
}

export async function removeCourseInstructor(input: { courseId: string; courseSlug: string; userId: string }) {
  const result = await teachCall<void>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/instructors/${encodeURIComponent(input.userId)}`, { method: "DELETE" });
  if (!result.ok) return result;
  revalidatePath(`/courses/${input.courseSlug}/edit`);
  revalidatePath(`/courses/${input.courseSlug}/settings`);
  return { ok: true as const };
}

export async function revokeCourseInstructorInvite(input: { courseId: string; courseSlug: string; inviteId: string }) {
  const result = await teachCall<void>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/instructor-invites/${encodeURIComponent(input.inviteId)}`, { method: "DELETE" });
  if (!result.ok) return result;
  revalidatePath(`/courses/${input.courseSlug}/edit`);
  revalidatePath(`/courses/${input.courseSlug}/settings`);
  return { ok: true as const };
}

export async function acceptCourseInstructorInvite(token: string) {
  const result = await teachCall<CourseInstructorInviteAcceptance>(`/api/v1/teach/instructor-invites/${encodeURIComponent(token)}/accept`, { method: "POST" });
  if (!result.ok) return result;
  return { ok: true as const, courseSlug: result.data.courseSlug, role: result.data.role };
}
