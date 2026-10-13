"use server";

import { revalidatePath } from "next/cache";
import { adminCall } from "./call";

async function review(formData: FormData, action: "approve" | "reject") {
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Missing request.");
  await adminCall<void>(`/api/v1/admin/instructor-access-requests/${encodeURIComponent(requestId)}/${action}`, { method: "POST" });
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

export async function approveInstructorAccessRequestAction(formData: FormData): Promise<void> {
  await review(formData, "approve");
}

export async function rejectInstructorAccessRequestAction(formData: FormData): Promise<void> {
  await review(formData, "reject");
}
