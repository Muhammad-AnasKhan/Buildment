"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";
import { runAdminAction, type AdminActionState } from "./action-result";

async function review(formData: FormData, action: "approve" | "reject"): Promise<AdminActionState> {
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return { ok: false, message: "Missing request." };
  return runAdminAction(async () => {
    await adminCall<void>(
      `/api/v1/admin/instructor-access-requests/${encodeURIComponent(requestId)}/${action}`,
      { method: "POST" }
    );
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
    return action === "approve" ? "Instructor request approved." : "Instructor request rejected.";
  });
}

export async function approveInstructorAccessRequestAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  return review(formData, "approve");
}

export async function rejectInstructorAccessRequestAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  return review(formData, "reject");
}
