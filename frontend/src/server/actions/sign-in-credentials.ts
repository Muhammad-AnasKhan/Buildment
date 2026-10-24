"use server";

import { redirect } from "next/navigation";
import type { AuthSession } from "@/shared/api/auth";
import { loginSchema } from "@/shared/lib/auth-validation";
import { safeRedirectTo } from "@/shared/lib/safe-redirect";
import { isSeedTestEmail } from "@/shared/lib/seed-data";
import { SEED_DEV_PASSWORD } from "@/shared/lib/seed-test-users";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import { loginErrorMessage } from "@/lib/auth-errors";
import { apiAuthErrors, zodAuthErrors, type AuthFormState } from "@/lib/auth-form-state";
import { setSessionCookie } from "@/server/auth/session-cookie";
import { testAccountsEnabled } from "@/server/auth/dev-test-accounts";

export type LoginState = AuthFormState;

export async function signInWithPasswordAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: zodAuthErrors(parsed.error), formError: null };
  return signInAndRedirect(parsed.data, formData);
}

/** Dev-only test-account picker: signs in as a seeded user through the same login call. */
export async function signInAsTestAccountAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  if (!testAccountsEnabled() || !isSeedTestEmail(email)) {
    return { fieldErrors: {}, formError: "Test accounts are only available in development." };
  }
  return signInAndRedirect({ email, password: SEED_DEV_PASSWORD }, formData);
}

async function signInAndRedirect(credentials: { email: string; password: string }, formData: FormData): Promise<LoginState> {
  const redirectTo = safeRedirectTo(String(formData.get("redirectTo") ?? "")) ?? "/dashboard";

  let session: AuthSession;
  try {
    session = await serverApiFetch<AuthSession>("/api/v1/auth/login", {
      method: "POST",
      json: credentials,
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

  await setSessionCookie(session.session);
  redirect(redirectTo);
}
