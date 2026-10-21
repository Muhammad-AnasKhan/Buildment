"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UpdateCourseTrackResult } from "@/shared/api/catalog";
import { serverApiFetch } from "@/lib/api-server";

// Variant and specialisation choices for a course in a family. Both land back on
// the course home, which is themed by the variant the learner just picked.

function readField(formData: FormData, name: string): string {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

export async function chooseCourseVariantAction(formData: FormData): Promise<void> {
  const courseSlug = readField(formData, "courseSlug");
  const variantSlug = readField(formData, "variantSlug");
  const result = await serverApiFetch<UpdateCourseTrackResult>(
    `/api/v1/courses/${encodeURIComponent(courseSlug)}/track/variant`,
    { method: "PUT", json: { variantSlug } }
  );
  revalidatePath(`/courses/${result.courseSlug}`, "layout");
  redirect(`/courses/${result.courseSlug}`);
}

export async function chooseCourseSpecialisationAction(formData: FormData): Promise<void> {
  const courseSlug = readField(formData, "courseSlug");
  const specialisationSlug = readField(formData, "specialisationSlug");
  const result = await serverApiFetch<UpdateCourseTrackResult>(
    `/api/v1/courses/${encodeURIComponent(courseSlug)}/track/specialisation`,
    { method: "PUT", json: { specialisationSlug } }
  );
  revalidatePath(`/courses/${result.courseSlug}`);
  redirect(`/courses/${result.courseSlug}#specialisation`);
}
