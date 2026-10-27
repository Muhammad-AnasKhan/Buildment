"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";
import { runAdminAction, type AdminActionState } from "./action-result";

const requestPath = (formData: FormData, action: string) => {
  const requestId = String(formData.get("requestId") ?? "");
  return requestId ? `/api/v1/admin/course-requests/${encodeURIComponent(requestId)}/${action}` : null;
};

export async function approveOrganizationCourseRequestAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const path = requestPath(formData, "approve");
  if (!path) return { ok: false, message: "Missing request id." };
  return runAdminAction(async () => {
    await adminCall<void>(path, {
      method: "POST",
      json: {
        maxEnrollments: Number(formData.get("maxEnrollments") ?? 0),
        expiresAt: String(formData.get("expiresAt") ?? "").trim(),
      },
    });
    revalidatePath("/admin/requests");
    revalidatePath("/admin/organizations/[orgId]", "page");
    return "Request approved.";
  });
}

export async function rejectOrganizationCourseRequestAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const path = requestPath(formData, "reject");
  if (!path) return { ok: false, message: "Missing request id." };
  return runAdminAction(async () => {
    await adminCall<void>(path, { method: "POST" });
    revalidatePath("/admin/requests");
    return "Request rejected.";
  });
}
