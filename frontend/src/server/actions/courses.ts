"use server";

import { revalidatePath } from "next/cache";
import type { CourseSlugResult } from "@/shared/api/teach";
import { teachCall } from "./teach-call";

export type CourseActionResult =
  | { ok: true; courseSlug: string }
  | { ok: false; errors: string[] };

async function courseCall(path: string, json?: unknown): Promise<CourseActionResult> {
  const result = await teachCall<CourseSlugResult>(path, { method: "POST", json });
  if (!result.ok) return result;
  revalidatePath(`/courses/${result.data.courseSlug}/edit`);
  revalidatePath(`/courses/${result.data.courseSlug}/settings`);
  return { ok: true, courseSlug: result.data.courseSlug };
}

/** Creates a DRAFT course owned by the signed-in mentor; the API adds a default first module. */
export async function createCourse(input: { title: string; description?: string }): Promise<CourseActionResult> {
  const result = await teachCall<CourseSlugResult>("/api/v1/teach/courses", { method: "POST", json: input });
  if (!result.ok) return { ok: false, errors: ["A title of at least 3 characters is required."] };
  return { ok: true, courseSlug: result.data.courseSlug };
}

export async function publishCourse(input: { courseId: string }): Promise<CourseActionResult> {
  return courseCall(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/publish`);
}

export async function unpublishCourse(input: {
  courseId: string;
  /** Required when mentees are enrolled — the UI collects this confirmation. */
  confirmedWithEnrollments?: boolean;
}): Promise<CourseActionResult> {
  return courseCall(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/unpublish`, {
    confirmedWithEnrollments: input.confirmedWithEnrollments ?? false,
  });
}

/** Move an archived course back to draft for editing before re-publish. */
export async function restoreCourseToDraft(input: { courseId: string }): Promise<CourseActionResult> {
  return courseCall(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/restore`);
}

export type CourseDeleteResult = { ok: true } | { ok: false; errors: string[] };

/** Permanently deletes a course after the instructor confirms in the UI. */
export async function deleteCourse(input: {
  courseId: string;
  /** Required when learners are enrolled — deleting removes their progress too. */
  confirmedWithEnrollments?: boolean;
}): Promise<CourseDeleteResult> {
  const result = await teachCall<CourseSlugResult>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}`, {
    method: "DELETE",
    json: { confirm: true, confirmedWithEnrollments: input.confirmedWithEnrollments ?? false },
  });
  if (!result.ok) return result;
  revalidatePath("/courses");
  revalidatePath("/courses/[courseSlug]/edit", "page");
  revalidatePath("/courses/[courseSlug]/settings", "page");
  revalidatePath("/", "layout");
  return { ok: true };
}
