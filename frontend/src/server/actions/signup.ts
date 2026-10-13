"use server";

import { redirect } from "next/navigation";
import type { SignupResult } from "@buildment/shared/api/auth";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export type SignupState = { ok: false; errors: string[] } | { ok: true };

export async function signupAction(
  _prev: SignupState | undefined,
  formData: FormData
): Promise<SignupState> {
  let result: SignupResult;
  try {
    result = await serverApiFetch<SignupResult>("/api/v1/auth/signup", {
      method: "POST",
      json: {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      },
      token: null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, errors: error.errors.length ? error.errors.map((issue) => issue.message) : [error.message] };
    }
    throw error;
  }

  if (result.status === "verified") {
    redirect(`/login?verified=1&email=${encodeURIComponent(result.email)}`);
  }
  redirect("/verify-email?signup=1");
}
