"use server";

import { revalidatePath } from "next/cache";
import type { AdminBulkResult } from "@/shared/api/admin";
import { adminCall } from "./call";
import { runAdminAction, type AdminActionState } from "./action-result";

// Bulk admin actions. The client toolbar posts one `ids` entry per selected row;
// the API reports per-row outcomes (never all-or-nothing), which we summarise.

function ids(formData: FormData): string[] {
  return [...new Set(formData.getAll("ids").map(String).filter(Boolean))];
}

function summarize(result: AdminBulkResult, verb: string): string {
  const skipped = result.skipped.length;
  if (skipped === 0) return `${result.updated} ${verb}.`;
  const first = result.skipped[0]!;
  return `${result.updated} ${verb}, ${skipped} skipped (${first.reason}).`;
}

export async function bulkSuspendUsersAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userIds = ids(formData);
  const note = String(formData.get("note") ?? "").trim() || undefined;
  if (userIds.length === 0) return { ok: false, message: "Select at least one row first." };
  return runAdminAction(async () => {
    const result = await adminCall<AdminBulkResult>("/api/v1/admin/users/bulk/suspend", {
      method: "POST",
      json: { ids: userIds, note },
    });
    revalidatePath("/admin/users");
    return summarize(result, `of ${userIds.length} suspended`);
  });
}

export async function bulkReinstateUsersAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const userIds = ids(formData);
  if (userIds.length === 0) return { ok: false, message: "Select at least one row first." };
  return runAdminAction(async () => {
    const result = await adminCall<AdminBulkResult>("/api/v1/admin/users/bulk/reinstate", {
      method: "POST",
      json: { ids: userIds },
    });
    revalidatePath("/admin/users");
    return summarize(result, `of ${userIds.length} reinstated`);
  });
}

export async function bulkApproveCourseRequestsAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const requestIds = ids(formData);
  if (requestIds.length === 0) return { ok: false, message: "Select at least one request first." };
  return runAdminAction(async () => {
    const result = await adminCall<AdminBulkResult>("/api/v1/admin/course-requests/bulk/approve", {
      method: "POST",
      json: {
        ids: requestIds,
        maxEnrollments: Number(formData.get("maxEnrollments") ?? 0),
        expiresAt: String(formData.get("expiresAt") ?? "").trim(),
      },
    });
    revalidatePath("/admin/requests");
    revalidatePath("/admin/organizations/[orgId]", "page");
    return summarize(result, `of ${requestIds.length} approved`);
  });
}

export async function bulkRejectCourseRequestsAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const requestIds = ids(formData);
  if (requestIds.length === 0) return { ok: false, message: "Select at least one request first." };
  return runAdminAction(async () => {
    const result = await adminCall<AdminBulkResult>("/api/v1/admin/course-requests/bulk/reject", {
      method: "POST",
      json: { ids: requestIds },
    });
    revalidatePath("/admin/requests");
    return summarize(result, `of ${requestIds.length} rejected`);
  });
}
