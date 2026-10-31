"use client";
import { VariantPicker as SharedPicker, type VariantChoice } from "@buildment/learning-ui/components/learn/variant-picker";
import { chooseCourseVariantAction } from "@/server/actions/course-track";
export type { VariantChoice };
export function VariantPicker(props: { courseSlug: string; choices: VariantChoice[]; initialSlug: string | null }) {
  return <SharedPicker {...props} onChoose={chooseCourseVariantAction} />;
}
