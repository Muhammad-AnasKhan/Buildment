"use server";

import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export async function resendVerificationEmailAction(
  formData?: FormData
): Promise<{ ok: boolean; message: string }> {
  const email = String(formData?.get("email") ?? "").trim().toLowerCase();
  try {
    await serverApiFetch("/api/v1/auth/resend-verification", {
      method: "POST",
      json: email ? { email } : {},
    });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    throw error;
  }
  return {
    ok: true,
    message: email
      ? "If that account still needs verification, a new link is on its way."
      : "Verification email sent. Check your inbox.",
  };
}
