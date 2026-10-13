"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";

const requestPath = (formData: FormData, action: string) => {
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Missing request id.");
  return `/api/v1/admin/course-requests/${encodeURIComponent(requestId)}/${action}`;
};

export async function approveOrganizationCourseRequestAction(formData: FormData): Promise<void> {
  await adminCall<void>(requestPath(formData, "approve"), {
    method: "POST",
    json: {
      maxEnrollments: Number(formData.get("maxEnrollments") ?? 0),
      expiresAt: String(formData.get("expiresAt") ?? "").trim(),
    },
  });
  revalidatePath("/admin/requests");
  revalidatePath("/admin/organizations/[orgId]", "page");
}

export async function rejectOrganizationCourseRequestAction(formData: FormData): Promise<void> {
  await adminCall<void>(requestPath(formData, "reject"), { method: "POST" });
  revalidatePath("/admin/requests");
}
