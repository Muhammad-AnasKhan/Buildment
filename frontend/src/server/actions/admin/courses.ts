"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";
import { runAdminAction, type AdminActionState } from "./action-result";

/** Admin course write actions: publish, unpublish (draft), or archive. */
export async function setCourseStatusAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const status = String(formData.get("status") ?? "").trim();
  if (!courseId) return { ok: false, message: "Missing course." };
  if (!status) return { ok: false, message: "Choose a status." };

  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/courses/${encodeURIComponent(courseId)}/status`, {
      method: "POST",
      json: { status },
    });
    revalidatePath("/admin/courses");
    revalidatePath("/catalog");
    return `Course set to ${status.toLowerCase()}.`;
  });
}
