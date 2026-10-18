"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

/** "sql, react; node" → ["sql", "react", "node"], de-duplicated, capped at 30. */
function parseSkills(raw: string): string[] {
  const parts = raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(parts)].slice(0, 30);
}

export type ProfileUpdateState = { ok: false; errors: string[] } | { ok: true };

export async function updateProfileAction(
  _prev: ProfileUpdateState | undefined,
  formData: FormData
): Promise<ProfileUpdateState> {
  try {
    await serverApiFetch("/api/v1/learner/profile", {
      method: "PATCH",
      json: {
        name: String(formData.get("name") ?? ""),
        timezone: String(formData.get("timezone") ?? ""),
        skills: parseSkills(String(formData.get("skills") ?? "")),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errors: error.errors.length ? error.errors.map((issue) => issue.message) : [error.message] };
    }
    throw error;
  }

  revalidatePath("/settings/profile");
  revalidatePath("/workspace/settings/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePasswordAction(_prev: ProfileUpdateState, formData: FormData): Promise<ProfileUpdateState> {
  try {
    await serverApiFetch("/api/v1/auth/password", {
      method: "PATCH",
      json: {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errors: error.errors.length ? error.errors.map((issue) => issue.message) : [error.message] };
    }
    throw error;
  }
}
