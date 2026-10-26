"use server";

import { revalidatePath } from "next/cache";
import type { AdminRecoveryCodes, AdminTotpEnrollment } from "@/shared/api/admin";
import { adminCall } from "./call";
import { runAdminAction, toAdminActionState, type AdminActionState } from "./action-result";

// Authenticator-app (TOTP) management for the signed-in admin, plus the
// admin-assisted reset another admin can use when a device is lost.

export type EnrollMfaResult =
  | { ok: true; message: string; enrollment: AdminTotpEnrollment }
  | { ok: false; message: string };

export type RecoveryCodesResult =
  | { ok: true; message: string; recoveryCodes: string[] }
  | { ok: false; message: string };

export async function beginMfaEnrollmentAction(): Promise<EnrollMfaResult> {
  try {
    const enrollment = await adminCall<AdminTotpEnrollment>("/api/v1/admin/mfa/enroll", { method: "POST" });
    return { ok: true, message: "Add the secret to your authenticator app, then confirm a code.", enrollment };
  } catch (error) {
    return { ok: false, message: toAdminActionState(error).message };
  }
}

/** Confirms the first code and returns the one-time backup codes. */
export async function activateMfaAction(formData: FormData): Promise<RecoveryCodesResult> {
  const code = String(formData.get("code") ?? "").trim();
  try {
    const { recoveryCodes } = await adminCall<AdminRecoveryCodes>("/api/v1/admin/mfa/activate", {
      method: "POST",
      json: { code },
    });
    revalidatePath("/admin/settings/profile");
    return { ok: true, message: "Authenticator app enabled.", recoveryCodes };
  } catch (error) {
    return { ok: false, message: toAdminActionState(error).message };
  }
}

/** Issues a fresh backup-code set (invalidating the old one) and returns it once. */
export async function regenerateRecoveryCodesAction(formData: FormData): Promise<RecoveryCodesResult> {
  const code = String(formData.get("code") ?? "").trim();
  try {
    const { recoveryCodes } = await adminCall<AdminRecoveryCodes>("/api/v1/admin/mfa/recovery-codes", {
      method: "POST",
      json: { code },
    });
    revalidatePath("/admin/settings/profile");
    return { ok: true, message: "New backup codes issued.", recoveryCodes };
  } catch (error) {
    return { ok: false, message: toAdminActionState(error).message };
  }
}

export async function disableMfaAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const code = String(formData.get("code") ?? "").trim();
  return runAdminAction(async () => {
    await adminCall<void>("/api/v1/admin/mfa/disable", { method: "POST", json: { code } });
    revalidatePath("/admin/settings/profile");
    return "Authenticator app disabled.";
  });
}

/** Clears another account's authenticator app — the recovery path for a lost device. */
export async function resetUserMfaAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const userId = String(formData.get("userId") ?? "");
  const email = String(formData.get("email") ?? "");
  if (!userId) return { ok: false, message: "Missing user." };
  return runAdminAction(async () => {
    await adminCall<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/reset-mfa`, { method: "POST" });
    revalidatePath(`/admin/users/${userId}`);
    return `Authenticator app reset for ${email}.`;
  });
}
