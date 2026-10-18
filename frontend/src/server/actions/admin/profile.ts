"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export type AdminProfileState = { ok: boolean; message: string };

async function save(path: string, json: Record<string, string>, message: string): Promise<AdminProfileState> {
  try {
    await serverApiFetch(path, { method: "PATCH", json });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.errors.map((issue) => issue.message).join(" ") || error.message };
    throw error;
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message };
}

export async function updateAdminProfileAction(_state: AdminProfileState, data: FormData) {
  return save("/api/v1/admin/profile", {
    name: String(data.get("name") ?? ""),
    email: String(data.get("email") ?? ""),
    currentPassword: String(data.get("currentPassword") ?? ""),
  }, "Profile saved.");
}

export async function updateAdminPasswordAction(_state: AdminProfileState, data: FormData) {
  return save("/api/v1/admin/password", {
    currentPassword: String(data.get("currentPassword") ?? ""),
    newPassword: String(data.get("newPassword") ?? ""),
    confirmPassword: String(data.get("confirmPassword") ?? ""),
  }, "Password updated. Other sessions have been signed out.");
}
