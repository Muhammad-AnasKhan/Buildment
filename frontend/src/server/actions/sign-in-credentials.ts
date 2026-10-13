"use server";

import { redirect } from "next/navigation";
import type { AuthSession } from "@buildment/shared/api/auth";
import { safeRedirectTo } from "@/lib/safe-redirect";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";
import { setSessionCookie } from "@/server/auth/session-cookie";

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectTo(String(formData.get("redirectTo") ?? "")) ?? "/dashboard";

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  let session: AuthSession;
  try {
    session = await serverApiFetch<AuthSession>("/api/v1/auth/login", {
      method: "POST",
      json: { email, password },
      token: null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(`/login?error=${encodeURIComponent(error.code)}`);
    }
    throw error;
  }

  await setSessionCookie(session.session);
  redirect(redirectTo);
}
