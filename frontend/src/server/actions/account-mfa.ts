"use server";

import { revalidatePath } from "next/cache";
import type { AdminRecoveryCodes, AdminTotpEnrollment } from "@/shared/api/admin";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch, type ServerApiRequestInit } from "@/lib/api-server";
import { runAdminAction, toAdminActionState, type AdminActionState } from "@/server/actions/admin/action-result";

export type AccountMfaEnrollmentResult =
  | { ok: true; message: string; enrollment: AdminTotpEnrollment }
  | { ok: false; message: string };

export type AccountRecoveryCodesResult =
  | { ok: true; message: string; recoveryCodes: string[] }
  | { ok: false; message: string };

async function accountMfaCall<T>(path: string, init: ServerApiRequestInit = {}) {
  try {
    return await serverApiFetch<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError) throw new Error(error.message);
    throw error;
  }
}

function revalidateProfileSettings() {
  revalidatePath("/settings/profile");
  revalidatePath("/workspace/settings/profile");
  revalidatePath("/admin/settings/profile");
}

export async function beginAccountMfaEnrollmentAction(): Promise<AccountMfaEnrollmentResult> {
  try {
    const enrollment = await accountMfaCall<AdminTotpEnrollment>("/api/v1/auth/mfa/enroll", { method: "POST" });
    return { ok: true, message: "Add the secret to your authenticator app, then confirm a code.", enrollment };
  } catch (error) {
    return { ok: false, message: toAdminActionState(error).message };
  }
}

export async function activateAccountMfaAction(formData: FormData): Promise<AccountRecoveryCodesResult> {
  try {
    const { recoveryCodes } = await accountMfaCall<AdminRecoveryCodes>("/api/v1/auth/mfa/activate", {
      method: "POST",
      json: { code: String(formData.get("code") ?? "").trim() },
    });
    revalidateProfileSettings();
    return { ok: true, message: "Two-factor authentication enabled.", recoveryCodes };
  } catch (error) {
    return { ok: false, message: toAdminActionState(error).message };
  }
}

export async function regenerateAccountRecoveryCodesAction(formData: FormData): Promise<AccountRecoveryCodesResult> {
  try {
    const { recoveryCodes } = await accountMfaCall<AdminRecoveryCodes>("/api/v1/auth/mfa/recovery-codes", {
      method: "POST",
      json: { code: String(formData.get("code") ?? "").trim() },
    });
    revalidateProfileSettings();
    return { ok: true, message: "New backup codes issued.", recoveryCodes };
  } catch (error) {
    return { ok: false, message: toAdminActionState(error).message };
  }
}

export async function disableAccountMfaAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const code = String(formData.get("code") ?? "").trim();
  return runAdminAction(async () => {
    await accountMfaCall<void>("/api/v1/auth/mfa/disable", { method: "POST", json: { code } });
    revalidateProfileSettings();
    return "Two-factor authentication disabled.";
  });
}
