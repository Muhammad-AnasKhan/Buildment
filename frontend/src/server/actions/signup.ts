"use server";

import { redirect } from "next/navigation";
import type { SignupResult } from "@/shared/api/auth";
import { signupSchema } from "@/shared/lib/auth-validation";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import { safeRedirectTo } from "@/shared/lib/safe-redirect";
import { apiAuthErrors, zodAuthErrors, type AuthFormState } from "@/lib/auth-form-state";

export type SignupState = AuthFormState;

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: zodAuthErrors(parsed.error), formError: null };
  // Where to go after the account is ready, such as /enroll/<course> from a public course page.
  const redirectTo = safeRedirectTo(String(formData.get("redirectTo") ?? "").trim());

  let result: SignupResult;
  try {
    result = await serverApiFetch<SignupResult>("/api/v1/auth/signup", {
      method: "POST",
      json: redirectTo ? { ...parsed.data, redirectTo } : parsed.data,
      token: null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { fieldErrors: apiAuthErrors(error.errors), formError: error.code === "VALIDATION_ERROR" && error.errors.length ? null : error.message };
    }
    throw error;
  }

  if (result.status === "verified") {
    redirect(`/login?verified=1&email=${encodeURIComponent(result.email)}${redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""}`);
  }
  redirect("/verify-email?signup=1");
}
