"use server";

import { redirect } from "next/navigation";
import { authEmailSchema } from "@/shared/lib/auth-validation";
import { safeRedirectTo } from "@/shared/lib/safe-redirect";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import { loginErrorMessage } from "@/lib/auth-errors";
import { apiAuthErrors, type AuthFormState } from "@/lib/auth-form-state";

/** Emails a one-time sign-in link; the API answers the same way whether or not the address is known. */
export async function sendMagicLinkAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = authEmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0]?.message ?? "Enter a valid email" }, formError: null };

  try {
    await serverApiFetch("/api/v1/auth/magic-link", {
      method: "POST",
      json: { email: parsed.data, redirectTo: safeRedirectTo(String(formData.get("redirectTo") ?? "")) },
      token: null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        fieldErrors: apiAuthErrors(error.errors),
        formError: error.errors.length ? null : error.code === "API_UNAVAILABLE" ? error.message : loginErrorMessage(error.code) ?? error.message,
      };
    }
    throw error;
  }
  redirect("/verify");
}
