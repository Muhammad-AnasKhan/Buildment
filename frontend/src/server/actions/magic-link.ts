"use server";

import { redirect } from "next/navigation";
import { safeRedirectTo } from "@/lib/safe-redirect";
import { serverApiFetch } from "@/lib/api-server";

/** Emails a one-time sign-in link; the API answers the same way whether or not the address is known. */
export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login?error=missing-email");

  await serverApiFetch("/api/v1/auth/magic-link", {
    method: "POST",
    json: { email, redirectTo: safeRedirectTo(String(formData.get("redirectTo") ?? "")) },
    token: null,
  });
  redirect("/verify");
}
